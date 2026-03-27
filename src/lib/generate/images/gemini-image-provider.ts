import { GoogleGenAI, Modality } from "@google/genai";
import { getOptionalGeminiApiKey } from "@/lib/env/server";
import type {
  GeneratedImageResult,
  ImageGenerationOptions,
  ImageGenerationProvider,
} from "@/lib/generate/images/types";

/**
 * Google Gemini image generation via Nano Banana (`gemini-2.5-flash-image`).
 * Supports text-to-image and optional reference-image guided generation.
 */
export class GeminiImageProvider implements ImageGenerationProvider {
  readonly id = "gemini" as const;

  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<GeneratedImageResult> {
    const apiKey = getOptionalGeminiApiKey();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const model = process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-2.5-flash-image";
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: {
        role: "user",
        parts: [
          ...(options?.referenceImages ?? []).map((image) => ({
            inlineData: {
              data: image.buffer.toString("base64"),
              mimeType: image.mimeType,
            },
          })),
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
          aspectRatio: toGeminiAspectRatio(options?.size),
          imageSize: toGeminiImageSize(options?.size),
        },
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
    const b64 = imagePart?.inlineData?.data;
    if (!b64) {
      throw new Error(response.text || "No image returned from the Gemini model");
    }
    return {
      buffer: Buffer.from(b64, "base64"),
      mimeType: imagePart?.inlineData?.mimeType || "image/png",
    };
  }
}

function toGeminiAspectRatio(size?: string): string {
  switch (size) {
    case "1536x1024":
      return "3:2";
    case "1024x1536":
      return "2:3";
    case "1792x1024":
      return "16:9";
    case "1024x1792":
      return "9:16";
    default:
      return "1:1";
  }
}

function toGeminiImageSize(size?: string): "1K" | "2K" {
  switch (size) {
    case "1536x1024":
    case "1024x1536":
    case "1792x1024":
    case "1024x1792":
      return "2K";
    default:
      return "1K";
  }
}
