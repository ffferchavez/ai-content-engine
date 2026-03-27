import OpenAI from "openai";
import { getOptionalOpenAIApiKey } from "@/lib/env/server";
import type {
  GeneratedImageResult,
  ImageGenerationOptions,
  ImageGenerationProvider,
} from "@/lib/generate/images/types";

/**
 * OpenAI Images API — default model is GPT Image (`gpt-image-1` family), not DALL·E.
 * Override with `OPENAI_IMAGE_MODEL` (e.g. `gpt-image-1`, or legacy `dall-e-3` for compatibility).
 */
export class OpenAIImageProvider implements ImageGenerationProvider {
  readonly id = "openai" as const;

  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<GeneratedImageResult> {
    const apiKey = getOptionalOpenAIApiKey();
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const model = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
    const openai = new OpenAI({ apiKey });

    const isGptImageFamily = model.startsWith("gpt-image");
    const referenceImages = options?.referenceImages ?? [];

    if (isGptImageFamily) {
      if (referenceImages.length > 0) {
        const result = await openai.images.edit({
          model,
          image: referenceImages.map(
            (image, index) =>
              new File(
                [Uint8Array.from(image.buffer)],
                image.filename || `reference-${index + 1}.png`,
                {
                  type: image.mimeType,
                },
              ),
          ),
          prompt,
          size: (options?.size as "1024x1024" | "1536x1024" | "1024x1536" | "auto" | undefined) ?? "1024x1024",
          quality:
            (options?.quality as "low" | "medium" | "high" | "auto" | undefined) ??
            ("high" as const),
        });

        const b64 = result.data?.[0]?.b64_json;
        if (!b64) {
          throw new Error("No image returned from the model");
        }
        return {
          buffer: Buffer.from(b64, "base64"),
          mimeType: "image/png",
        };
      }

      const result = await openai.images.generate({
        model,
        prompt,
        n: 1,
        size: (options?.size as "1024x1024" | "1536x1024" | "1024x1536" | "auto" | undefined) ?? "1024x1024",
        quality:
          (options?.quality as "low" | "medium" | "high" | "auto" | undefined) ??
          ("high" as const),
        output_format: "png",
      });

      const b64 = result.data?.[0]?.b64_json;
      if (!b64) {
        throw new Error("No image returned from the model");
      }
      return {
        buffer: Buffer.from(b64, "base64"),
        mimeType: "image/png",
      };
    }

    // Legacy DALL·E paths — only when explicitly configured via OPENAI_IMAGE_MODEL.
    if (referenceImages.length > 0) {
      throw new Error("OPENAI_IMAGE_MODEL must be a gpt-image model to use reference images");
    }
    const result = await openai.images.generate({
      model: model as "dall-e-2" | "dall-e-3",
      prompt,
      n: 1,
      size:
        (options?.size as "1024x1024" | "1792x1024" | "1024x1792" | undefined) ?? "1024x1024",
      response_format: "b64_json",
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error("No image returned from the model");
    }
    return {
      buffer: Buffer.from(b64, "base64"),
      mimeType: "image/png",
    };
  }
}
