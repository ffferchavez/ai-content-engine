import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getCurrentOrganizationId } from "@/lib/org";
import { getOptionalOpenAIApiKey } from "@/lib/env/server";
import { mapImageProviderError } from "@/lib/generate/images/errors";
import { generateImage } from "@/lib/generate/images/generate-image";
import {
  buildFallbackImagePrompt,
  transformImagePromptForPostPack,
} from "@/lib/generate/post-pack-image-prompt";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_REFERENCE_IMAGES = 3;

function readString(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getCurrentOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const apiKey = getOptionalOpenAIApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 503 });
  }

  const formData = await request.formData();
  const postAngle = readString(formData, "postAngle");
  const hook = readString(formData, "hook");
  const caption = readString(formData, "caption");
  const callToAction = readString(formData, "callToAction");
  const hashtags = readString(formData, "hashtags");
  const visualDirection = readString(formData, "visualDirection");

  if (!hook || !caption || !callToAction) {
    return NextResponse.json(
      { error: "Select the hook, caption, and call to action before generating an image." },
      { status: 400 },
    );
  }

  const referenceImages = formData
    .getAll("referenceImages")
    .filter((value): value is File => value instanceof File && value.size > 0 && value.type.startsWith("image/"))
    .slice(0, MAX_REFERENCE_IMAGES);

  const openai = new OpenAI({ apiKey });
  const promptInput = {
    post_angle:
      postAngle || `${hook}. ${hashtags ? `Hashtags context: ${hashtags}.` : "Use the final post message as the angle."}`,
    image_prompt: null,
    visual_direction: visualDirection || `Use the hook, caption, and CTA as the visual context: ${caption} ${callToAction}`,
    suggested_format: "static post" as const,
    title: "Final merged post",
  };

  let prompt: string;
  try {
    prompt = await transformImagePromptForPostPack(promptInput, openai);
  } catch {
    prompt = buildFallbackImagePrompt(promptInput);
  }

  try {
    const out = await generateImage({
      prompt,
      options: {
        size: "1024x1024",
        quality: "high",
        referenceImages: await Promise.all(
          referenceImages.map(async (image, index) => ({
            buffer: Buffer.from(await image.arrayBuffer()),
            mimeType: image.type || "image/png",
            filename: image.name || `reference-${index + 1}.png`,
          })),
        ),
      },
    });

    return NextResponse.json({
      imageUrl: `data:${out.mimeType};base64,${out.buffer.toString("base64")}`,
      prompt,
      usedReferenceImages: referenceImages.length,
    });
  } catch (err) {
    return NextResponse.json({ error: mapImageProviderError(err) }, { status: 502 });
  }
}
