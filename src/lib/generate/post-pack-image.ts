import type { SuggestedFormat } from "@/lib/generate/post-pack";

/** Product rule: images only for feed-style packs, not reel/story concepts. */
export function supportsPostPackImageGeneration(format: SuggestedFormat): boolean {
  return format === "static post" || format === "carousel";
}
