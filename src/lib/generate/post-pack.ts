/** Shared shape for one complete social post (stored in generated_assets.metadata). */

export const SUGGESTED_FORMATS = [
  "carousel",
  "reel",
  "static post",
  "story",
] as const;

export type SuggestedFormat = (typeof SUGGESTED_FORMATS)[number];

/** Reserved for when image/media pipelines exist; v1 always stores placeholders. */
export type GenerationMediaStatus = "not_generated" | "pending" | "ready";

export type PostPackMediaExtension = {
  /** Optional one-line prompt for a future image model; may be null in v1. */
  image_prompt: string | null;
  image_url: string | null;
  media_url: string | null;
  media_status: GenerationMediaStatus;
};

/** One slide in a carousel pack (copy + per-slide image placeholders). */
export type CarouselSlide = {
  slide_number: number;
  title: string;
  supporting_text: string;
  visual_direction: string;
  image_prompt: string | null;
  image_url?: string | null;
  media_url?: string | null;
  media_status?: GenerationMediaStatus;
};

export type PostPackFields = {
  post_angle: string;
  suggested_format: SuggestedFormat;
  hook: string;
  caption: string;
  call_to_action: string;
  hashtags: string;
  visual_direction: string;
  /** Empty for static/reel/story; 1+ slides for carousel (new packs: 3+ slides). */
  slides: CarouselSlide[];
} & PostPackMediaExtension;

export const POST_PACK_COMPOSER_FIELDS = [
  "hook",
  "caption",
  "call_to_action",
  "hashtags",
  "visual_direction",
  "post_angle",
] as const;

export type PostPackComposerField = (typeof POST_PACK_COMPOSER_FIELDS)[number];

export type PostPackComposerDraft = {
  fields: Partial<Pick<PostPackFields, PostPackComposerField>>;
  sources: Partial<Record<PostPackComposerField, number>>;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function parseOptionalString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function normalizeMediaStatus(raw: unknown): GenerationMediaStatus {
  if (raw === "pending" || raw === "ready") return raw;
  return "not_generated";
}

export function normalizeSuggestedFormat(raw: string): SuggestedFormat {
  const s = raw.toLowerCase().trim();
  if (s.includes("carousel")) return "carousel";
  if (s.includes("reel")) return "reel";
  if (s.includes("story")) return "story";
  if (s.includes("static") || s.includes("feed") || s.includes("image")) return "static post";
  return "static post";
}

function parseSlideRaw(raw: unknown): CarouselSlide | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const slide_number = typeof o.slide_number === "number" && Number.isFinite(o.slide_number) ? o.slide_number : 0;
  const title = isNonEmptyString(o.title) ? o.title.trim() : "";
  const supporting_text = typeof o.supporting_text === "string" ? o.supporting_text.trim() : "";
  const visual_direction = isNonEmptyString(o.visual_direction) ? o.visual_direction.trim() : "";
  const image_prompt = parseOptionalString(o.image_prompt);
  if (!slide_number || !title || !visual_direction) {
    return null;
  }
  return {
    slide_number,
    title,
    supporting_text,
    visual_direction,
    image_prompt,
    image_url: parseOptionalString(o.image_url),
    media_url: parseOptionalString(o.media_url),
    media_status: normalizeMediaStatus(o.media_status),
  };
}

/** Parse slides from model JSON or metadata; does not apply legacy fallback. */
export function parseSlidesArray(raw: unknown): CarouselSlide[] {
  if (!Array.isArray(raw)) return [];
  const out: CarouselSlide[] = [];
  for (const item of raw) {
    const s = parseSlideRaw(item);
    if (s) out.push(s);
  }
  out.sort((a, b) => a.slide_number - b.slide_number);
  return out;
}

/** Legacy carousel rows: no slides array — synthesize one slide from pack-level fields. */
function legacyCarouselSlides(
  visual_direction: string,
  image_prompt: string | null,
): CarouselSlide[] {
  return [
    {
      slide_number: 1,
      title: "Slide 1",
      supporting_text: "",
      visual_direction,
      image_prompt,
      image_url: null,
      media_url: null,
      media_status: "not_generated",
    },
  ];
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
  const image_prompt = parseOptionalString(o.image_prompt);
  const image_url = parseOptionalString(o.image_url);
  const media_url = parseOptionalString(o.media_url);
  const media_status = normalizeMediaStatus(o.media_status);

  let slides = parseSlidesArray(o.slides);
  if (suggested_format === "carousel") {
    if (slides.length === 0) {
      slides = legacyCarouselSlides(visual_direction, image_prompt);
    }
  } else {
    slides = [];
  }

  return {
    post_angle,
    suggested_format,
    hook,
    caption,
    call_to_action,
    hashtags,
    visual_direction,
    image_prompt,
    image_url,
    media_url,
    media_status,
    slides,
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
    fields.image_prompt ? ["", "Image prompt:", fields.image_prompt] : [],
  ]
    .flat()
    .filter((line) => line !== "");

  if (fields.suggested_format === "carousel" && fields.slides.length > 0) {
    lines.push("", "Slides:");
    for (const s of fields.slides) {
      lines.push(
        "",
        `Slide ${s.slide_number}: ${s.title}`,
        s.supporting_text ? `  ${s.supporting_text}` : "",
        `  Direction: ${s.visual_direction}`,
        s.image_prompt ? `  Image prompt: ${s.image_prompt}` : "",
      );
    }
  }

  return lines.join("\n").trim();
}
