import { APIError } from "openai";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getOptionalOpenAIApiKey } from "@/lib/env/server";
import { allowPostPackImageGenerate } from "@/lib/generate/image-rate-limit";
import {
  buildPostPackImagePrompt,
  supportsPostPackImageGeneration,
} from "@/lib/generate/post-pack-image";
import { parsePostPackFields } from "@/lib/generate/post-pack";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/org";

export const runtime = "nodejs";

const BUCKET = "generated-media";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function mapOpenAIImageError(err: unknown): string {
  if (err instanceof APIError) {
    if (err.status === 429) return "The AI is busy. Wait a minute and try again.";
    if (err.status === 401) return "OpenAI key is invalid. Check OPENAI_API_KEY.";
    if (err.status === 400 && err.message?.includes("content_policy"))
      return "This prompt was rejected by the image model. Try adjusting your brief and visual direction.";
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Image generation failed. Try again.";
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await context.params;
  if (!assetId || !UUID_RE.test(assetId)) {
    return NextResponse.json({ error: "Invalid asset" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!allowPostPackImageGenerate(user.id)) {
    return NextResponse.json(
      { error: "Too many image requests. Wait a minute and try again." },
      { status: 429 },
    );
  }

  const orgId = await getCurrentOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .select("id, metadata, asset_type, content_generation_id")
    .eq("id", assetId)
    .maybeSingle();

  if (assetError || !asset) {
    return NextResponse.json({ error: "Post pack not found" }, { status: 404 });
  }

  if (asset.asset_type !== "post_pack") {
    return NextResponse.json({ error: "Only post packs can have images" }, { status: 400 });
  }

  const { data: gen, error: genError } = await supabase
    .from("content_generations")
    .select("organization_id")
    .eq("id", asset.content_generation_id)
    .maybeSingle();

  if (genError || !gen?.organization_id || gen.organization_id !== orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = parsePostPackFields(asset.metadata);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid post pack metadata" }, { status: 400 });
  }

  if (!supportsPostPackImageGeneration(parsed.suggested_format)) {
    return NextResponse.json(
      {
        error:
          "Images are only generated for static posts and carousels. Reel and story packs stay text-only.",
      },
      { status: 400 },
    );
  }

  const apiKey = getOptionalOpenAIApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 503 });
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return NextResponse.json(
      {
        error:
          "Image upload is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your server environment.",
      },
      { status: 503 },
    );
  }

  const prompt = buildPostPackImagePrompt({
    image_prompt: parsed.image_prompt,
    visual_direction: parsed.visual_direction,
    post_angle: parsed.post_angle,
  });

  const openai = new OpenAI({ apiKey });

  let b64: string | undefined;
  try {
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });
    b64 = result.data?.[0]?.b64_json;
  } catch (err) {
    const friendly = mapOpenAIImageError(err);
    return NextResponse.json({ error: friendly }, { status: 502 });
  }

  if (!b64) {
    return NextResponse.json({ error: "No image returned from the model" }, { status: 502 });
  }

  const buffer = Buffer.from(b64, "base64");
  const path = `${orgId}/${asset.content_generation_id}/${asset.id}.png`;

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: "image/png",
    upsert: true,
  });

  if (uploadError) {
    console.error("[generated-assets/image] upload:", uploadError.message);
    return NextResponse.json(
      { error: "Could not save image to storage. Check the generated-media bucket and policies." },
      { status: 502 },
    );
  }

  const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path);
  const imageUrl = publicUrlData.publicUrl;

  const prev =
    asset.metadata && typeof asset.metadata === "object" && !Array.isArray(asset.metadata)
      ? { ...(asset.metadata as Record<string, unknown>) }
      : {};

  const merged: Record<string, unknown> = {
    ...prev,
    image_url: imageUrl,
    media_url: imageUrl,
    media_status: "ready",
    image_generated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("generated_assets")
    .update({ metadata: merged })
    .eq("id", assetId);

  if (updateError) {
    console.error("[generated-assets/image] metadata update:", updateError.message);
    return NextResponse.json({ error: "Image saved but could not update the post pack." }, { status: 500 });
  }

  return NextResponse.json({
    imageUrl,
    metadata: merged,
  });
}
