/** Shared shape for one complete social post (stored in generated_assets.metadata). */

export const SUGGESTED_FORMATS = [
  "carousel",
  "reel",
  "static post",
  "story",
] as const;

export type SuggestedFormat = (typeof SUGGESTED_FORMATS)[number];

export type PostPackFields = {
  post_angle: string;
  suggested_format: SuggestedFormat;
  hook: string;
  caption: string;
  call_to_action: string;
  hashtags: string;
  visual_direction: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function normalizeSuggestedFormat(raw: string): SuggestedFormat {
  const s = raw.toLowerCase().trim();
  if (s.includes("carousel")) return "carousel";
  if (s.includes("reel")) return "reel";
  if (s.includes("story")) return "story";
  if (s.includes("static") || s.includes("feed") || s.includes("image")) return "static post";
  return "static post";
}

export function parsePostPackFields(raw: unknown): PostPackFields | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const post_angle = isNonEmptyString(o.post_angle) ? o.post_angle.trim() : "";
  const hook = isNonEmptyString(o.hook) ? o.hook.trim() : "";
  const caption = isNonEmptyString(o.caption) ? o.caption.trim() : "";
  const call_to_action = isNonEmptyString(o.call_to_action) ? o.call_to_action.trim() : "";
  const hashtags = isNonEmptyString(o.hashtags) ? o.hashtags.trim() : "";
  const visual_direction = isNonEmptyString(o.visual_direction) ? o.visual_direction.trim() : "";
  if (!post_angle || !hook || !caption || !call_to_action || !hashtags || !visual_direction) {
    return null;
  }
  const fmtRaw = isNonEmptyString(o.suggested_format) ? o.suggested_format : "static post";
  const suggested_format = normalizeSuggestedFormat(fmtRaw);
  return {
    post_angle,
    suggested_format,
    hook,
    caption,
    call_to_action,
    hashtags,
    visual_direction,
  };
}

export function formatPostPackForCopy(params: {
  title: string | null;
  platform: string | null;
  fields: PostPackFields;
}): string {
  const { title, platform, fields } = params;
  const lines = [
    title ? `${title}\n` : "",
    `Angle: ${fields.post_angle}`,
    `Format: ${fields.suggested_format}`,
    platform ? `Platform note: ${platform}` : "",
    "",
    "Hook:",
    fields.hook,
    "",
    "Caption:",
    fields.caption,
    "",
    "CTA:",
    fields.call_to_action,
    "",
    "Hashtags:",
    fields.hashtags,
    "",
    "Visual direction:",
    fields.visual_direction,
  ].filter((line) => line !== "");
  return lines.join("\n").trim();
}
