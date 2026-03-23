/**
 * Normalized primary platform for generation (v1 single-select).
 * Stored on generations/assets as these slug strings.
 */

export const GENERATION_PLATFORM_IDS = ["instagram", "facebook", "linkedin", "tiktok", "x"] as const;

export type GenerationPlatformId = (typeof GENERATION_PLATFORM_IDS)[number];

const LABEL: Record<GenerationPlatformId, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  x: "X (Twitter)",
};

export const GENERATION_PLATFORMS: readonly { id: GenerationPlatformId; label: string }[] =
  GENERATION_PLATFORM_IDS.map((id) => ({ id, label: LABEL[id] }));

export function isGenerationPlatformId(s: string): s is GenerationPlatformId {
  return (GENERATION_PLATFORM_IDS as readonly string[]).includes(s);
}

/** Parse API / JSON body value into a platform id, or null if invalid. */
export function parseGenerationPlatformId(raw: unknown): GenerationPlatformId | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase();
  return isGenerationPlatformId(s) ? s : null;
}

/** Human label for prompts and UI when value is a known slug. */
export function generationPlatformLabel(id: GenerationPlatformId): string {
  return LABEL[id];
}

/**
 * Display string for DB values: known slugs → label; legacy free-text generations unchanged.
 */
export function formatPlatformForDisplay(platform: string | null | undefined): string {
  if (!platform?.trim()) return "";
  const s = platform.trim().toLowerCase();
  if (isGenerationPlatformId(s)) return LABEL[s];
  return platform.trim();
}
