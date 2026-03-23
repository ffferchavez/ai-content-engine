import { GeminiImageProvider } from "@/lib/generate/images/gemini-image-provider";
import { OpenAIImageProvider } from "@/lib/generate/images/openai-image-provider";
import type { ImageGenerationProvider, ImageProviderId } from "@/lib/generate/images/types";

const openai = new OpenAIImageProvider();
const gemini = new GeminiImageProvider();

export function getImageProvider(id: ImageProviderId): ImageGenerationProvider {
  switch (id) {
    case "openai":
      return openai;
    case "gemini":
      return gemini;
    default:
      throw new Error(`Unknown image provider: ${String(id)}`);
  }
}
