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
function parseImageProviderId(raw?: string): ImageProviderId | undefined {
  switch (raw?.trim().toLowerCase()) {
    case "gemini":
      return "gemini";
    case "openai":
      return "openai";
    default:
      return undefined;
  }
}

export function getDefaultImageProviderId(): ImageProviderId {
  return parseImageProviderId(process.env.IMAGE_GENERATION_PROVIDER) ?? "openai";
}

function getFallbackImageProviderId(primary: ImageProviderId): ImageProviderId | undefined {
  const configured = parseImageProviderId(process.env.IMAGE_GENERATION_FALLBACK_PROVIDER);
  if (configured && configured !== primary) return configured;
  if (primary === "gemini") return "openai";
  return undefined;
}

function shouldRetryWithFallback(err: unknown): boolean {
  if (!(err instanceof Error)) return true;
  const message = err.message.toLowerCase();
  if (
    message.includes("content policy") ||
    message.includes("content_policy") ||
    message.includes("blocked") ||
    message.includes("rejected")
  ) {
    return false;
  }
  return true;
}

export async function generateImage(params: {
  provider?: ImageProviderId;
  prompt: string;
  options?: ImageGenerationOptions;
}): Promise<GeneratedImageResult> {
  const primary = params.provider ?? getDefaultImageProviderId();
  const fallback = getFallbackImageProviderId(primary);

  try {
    return await getImageProvider(primary).generateImage(params.prompt, params.options);
  } catch (err) {
    if (!fallback || !shouldRetryWithFallback(err)) {
      throw err;
    }
    return getImageProvider(fallback).generateImage(params.prompt, params.options);
  }
}
