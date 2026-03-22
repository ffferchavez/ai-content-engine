import { APIError } from "openai";
import { NextResponse } from "next/server";
import { runStructuredGeneration } from "@/lib/generate/structured";
import { allowGenerate } from "@/lib/generate/rate-limit";
import { getCurrentOrganizationId } from "@/lib/org";
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
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const brandId = typeof body.brandId === "string" ? body.brandId.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const platform =
    typeof body.platform === "string" && body.platform.trim() ? body.platform.trim().slice(0, 120) : undefined;
  const toneRaw = typeof body.tone === "string" ? body.tone.trim().toLowerCase() : "";
  const allowedTones = new Set(["friendly", "professional", "bold", "calm", "playful"]);
  const tone = allowedTones.has(toneRaw) ? toneRaw : undefined;

  if (!brandId || !UUID_RE.test(brandId)) {
    return NextResponse.json({ error: "Choose a valid brand" }, { status: 400 });
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

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("id, name, description, voice_notes, target_audience, industry, default_language")
    .eq("id", brandId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (brandError || !brand?.id) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const brandBlock = [
    brand.description ? `About: ${brand.description}` : "",
    brand.industry ? `Industry: ${brand.industry}` : "",
    brand.voice_notes ? `Voice: ${brand.voice_notes}` : "",
    brand.target_audience ? `Audience: ${brand.target_audience}` : "",
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
        platform: platform ?? null,
        brand_name: brand.name,
        tone: tone ?? null,
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
      platform,
      tone,
    });

    const assetRows = pack.pieces.map((p, i) => ({
      content_generation_id: generationId,
      asset_type: p.kind,
      platform: p.platform ?? platform ?? null,
      language: brand.default_language ?? "en",
      sort_order: i,
      title: p.title ?? null,
      body: p.body,
      metadata: {},
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
        output_summary: { summary: pack.summary, piece_count: pack.pieces.length },
        model: "gpt-4o-mini",
        updated_at: new Date().toISOString(),
      })
      .eq("id", generationId);

    if (updateError) {
      console.error("[api/generate] finalize:", updateError.message);
    }

    const { data: assetsOut } = await supabase
      .from("generated_assets")
      .select("id, asset_type, platform, title, body, sort_order")
      .eq("content_generation_id", generationId)
      .order("sort_order", { ascending: true });

    return NextResponse.json({
      generationId,
      summary: pack.summary,
      assets: assetsOut ?? [],
    });
  } catch (err) {
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
