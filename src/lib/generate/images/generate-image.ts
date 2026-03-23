import "server-only";

import { getImageProvider } from "@/lib/generate/images/registry";
import type {
  GeneratedImageResult,
  ImageGenerationOptions,
  ImageProviderId,
} from "@/lib/generate/images/types";

/**
 * Entry point for image generation — provider-agnostic.
 */
export function getDefaultImageProviderId(): ImageProviderId {
  const raw = process.env.IMAGE_GENERATION_PROVIDER?.trim().toLowerCase();
  if (raw === "gemini") return "gemini";
  return "openai";
}

export async function generateImage(params: {
  provider?: ImageProviderId;
  prompt: string;
  options?: ImageGenerationOptions;
}): Promise<GeneratedImageResult> {
  const id = params.provider ?? getDefaultImageProviderId();
  const impl = getImageProvider(id);
  return impl.generateImage(params.prompt, params.options);
}
