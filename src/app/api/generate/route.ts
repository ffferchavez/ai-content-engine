import { APIError } from "openai";
import { NextResponse } from "next/server";
import { parseBrandUrlsFromDb, brandUrlsContextBlock } from "@/lib/brands/urls";
import { runStructuredGeneration } from "@/lib/generate/structured";
import { allowGenerate } from "@/lib/generate/rate-limit";
import { getCurrentOrganizationId } from "@/lib/org";
import { generationPlatformLabel, parseGenerationPlatformId } from "@/lib/platforms";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_TOPIC = 8000;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function mapOpenAIError(err: unknown): string {
  if (err instanceof APIError) {
    if (err.status === 429) return "The AI is busy. Wait a minute and try again.";
    if (err.status === 401) return "OpenAI key is invalid. Check OPENAI_API_KEY.";
    if (err.status === 503) return "AI service is temporarily unavailable. Try again soon.";
    if (err.message) return err.message;
  }
  if (err instanceof Error) {
    if (err.message.includes("OPENAI_API_KEY")) {
      return "OPENAI_API_KEY is not set";
    }
    // Parsing / validation errors from `runStructuredGeneration` (safe to show)
    if (err.message.trim()) return err.message.trim();
  }
  return "Generation failed. Try again.";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!allowGenerate(user.id)) {
    return NextResponse.json(
      { error: "Too many requests. Wait a minute and try again." },
      { status: 429 },
    );
  }

  const orgId = await getCurrentOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  let body: {
    brandId?: string;
    topic?: string;
    platform?: string;
    tone?: string;
    language?: string;
    objective?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const brandId = typeof body.brandId === "string" ? body.brandId.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const platformSlug = parseGenerationPlatformId(body.platform);
  const toneRaw = typeof body.tone === "string" ? body.tone.trim().toLowerCase() : "";
  const allowedTones = new Set(["friendly", "professional", "bold", "calm", "playful"]);
  const tone = allowedTones.has(toneRaw) ? toneRaw : undefined;

  const langRaw = typeof body.language === "string" ? body.language.trim().toLowerCase() : "";
  const allowedLangs = new Set(["en", "es", "fr", "de", "pt", "it"]);
  const languageOverride = allowedLangs.has(langRaw) ? langRaw : undefined;

  const objRaw = typeof body.objective === "string" ? body.objective.trim().toLowerCase() : "";
  const allowedObjectives = new Set([
    "awareness",
    "engagement",
    "traffic",
    "leads",
    "community",
    "launch",
  ]);
  const objective = allowedObjectives.has(objRaw) ? objRaw : undefined;

  if (!brandId || !UUID_RE.test(brandId)) {
    return NextResponse.json({ error: "Choose a valid brand" }, { status: 400 });
  }
  if (!platformSlug) {
    return NextResponse.json({ error: "Choose a primary platform" }, { status: 400 });
  }

  if (!topic) {
    return NextResponse.json({ error: "Add a topic or brief" }, { status: 400 });
  }
  if (topic.length > MAX_TOPIC) {
    return NextResponse.json(
      { error: `Topic is too long (max ${MAX_TOPIC} characters)` },
      { status: 400 },
    );
  }

  const platformLabel = generationPlatformLabel(platformSlug);

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("id, name, description, voice_notes, target_audience, industry, default_language, brand_urls")
    .eq("id", brandId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (brandError || !brand?.id) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const brandUrls = parseBrandUrlsFromDb(
    (brand as { brand_urls?: unknown }).brand_urls,
  );
  const urlsBlock = brandUrlsContextBlock(brandUrls);

  const brandBlock = [
    brand.description ? `About: ${brand.description}` : "",
    brand.industry ? `Industry: ${brand.industry}` : "",
    brand.voice_notes ? `Voice: ${brand.voice_notes}` : "",
    brand.target_audience ? `Audience: ${brand.target_audience}` : "",
    urlsBlock,
  ]
    .filter(Boolean)
    .join("\n");

  const { data: genRow, error: genInsertError } = await supabase
    .from("content_generations")
    .insert({
      organization_id: orgId,
      brand_id: brand.id,
      created_by: user.id,
      status: "draft",
      input_payload: {
        topic,
        platform: platformSlug,
        brand_name: brand.name,
        tone: tone ?? null,
        language: languageOverride ?? brand.default_language ?? "en",
        objective: objective ?? null,
      },
      provider: "openai",
    })
    .select("id")
    .single();

  if (genInsertError || !genRow?.id) {
    console.error("[api/generate] insert generation:", genInsertError?.message);
    return NextResponse.json({ error: "Could not start generation" }, { status: 500 });
  }

  const generationId = genRow.id;

  try {
    const pack = await runStructuredGeneration({
      brandName: brand.name,
      brandBlock,
      topic,
      platform: platformLabel,
      tone,
      language: languageOverride ?? brand.default_language ?? "en",
      objective,
    });

    const assetRows = pack.post_packs.map((p, i) => ({
      content_generation_id: generationId,
      asset_type: "post_pack",
      platform: platformSlug,
      language: languageOverride ?? brand.default_language ?? "en",
      sort_order: i,
      title: p.title,
      body: p.caption,
      metadata: {
        post_angle: p.post_angle,
        suggested_format: p.suggested_format,
        hook: p.hook,
        caption: p.caption,
        call_to_action: p.call_to_action,
        hashtags: p.hashtags,
        visual_direction: p.visual_direction,
        image_prompt: p.image_prompt,
        image_url: p.image_url,
        media_url: p.media_url,
        media_status: p.media_status,
        slides: p.slides,
      },
    }));

    const { error: assetsError } = await supabase.from("generated_assets").insert(assetRows);

    if (assetsError) {
      console.error("[api/generate] insert assets:", assetsError.message);
      await supabase
        .from("content_generations")
        .update({
          status: "failed",
          error_message: assetsError.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", generationId);
      return NextResponse.json({ error: "Could not save results" }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("content_generations")
      .update({
        status: "completed",
        output_summary: { summary: pack.summary, post_count: pack.post_packs.length },
        model: "gpt-4o-mini",
        updated_at: new Date().toISOString(),
      })
      .eq("id", generationId);

    if (updateError) {
      console.error("[api/generate] finalize:", updateError.message);
    }

    const { data: assetsOut } = await supabase
      .from("generated_assets")
      .select("id, asset_type, platform, title, body, sort_order, metadata")
      .eq("content_generation_id", generationId)
      .order("sort_order", { ascending: true });

    return NextResponse.json({
      generationId,
      summary: pack.summary,
      assets: assetsOut ?? [],
    });
  } catch (err) {
    console.error("[api/generate] OpenAI / pipeline error:", err);
    const friendly = mapOpenAIError(err);
    const msg = err instanceof Error ? err.message : "Generation failed";
    await supabase
      .from("content_generations")
      .update({
        status: "failed",
        error_message: msg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", generationId);

    if (msg.includes("OPENAI_API_KEY") || friendly.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "OpenAI is not configured. Add OPENAI_API_KEY to your server environment." },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: friendly }, { status: 502 });
  }
}
