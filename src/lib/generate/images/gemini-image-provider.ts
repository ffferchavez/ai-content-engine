import type { GeneratedImageResult, ImageGenerationOptions, ImageGenerationProvider } from "@/lib/generate/images/types";

/**
 * Placeholder for a future Google Gemini / Imagen-style provider.
 * Wire `GEMINI_API_KEY` (or similar) and implement `generateImage` here.
 */
export class GeminiImageProvider implements ImageGenerationProvider {
  readonly id = "gemini" as const;

  async generateImage(_prompt: string, _options?: ImageGenerationOptions): Promise<GeneratedImageResult> {
    throw new Error(
      "Gemini image generation is not implemented yet. Set IMAGE_GENERATION_PROVIDER=openai in your environment.",
    );
  }
}
