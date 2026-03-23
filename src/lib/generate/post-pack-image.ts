import type { SuggestedFormat } from "@/lib/generate/post-pack";

const MAX_PROMPT_CHARS = 3800;

/** Product rule: images only for feed-style packs, not reel/story concepts. */
export function supportsPostPackImageGeneration(format: SuggestedFormat): boolean {
  return format === "static post" || format === "carousel";
}

/**
 * Combines optional model line + visual direction for DALL·E.
 * Keeps brand-safe framing without extra PII.
 */
export function buildPostPackImagePrompt(params: {
  image_prompt: string | null;
  visual_direction: string;
  post_angle: string;
}): string {
  const parts = [
    "Professional social media marketing image, clean composition, no text overlays unless described.",
    `Subject / angle: ${params.post_angle}`,
    params.image_prompt ? `Image brief: ${params.image_prompt}` : null,
    `Visual direction: ${params.visual_direction}`,
  ].filter(Boolean) as string[];
  const full = parts.join("\n\n");
  return full.length > MAX_PROMPT_CHARS ? full.slice(0, MAX_PROMPT_CHARS) : full;
}
