import OpenAI, { APIError } from "openai";
import { getOptionalOpenAIApiKey } from "@/lib/env/server";
import {
  normalizeSuggestedFormat,
  parseSlidesArray,
  type PostPackFields,
  type SuggestedFormat,
} from "@/lib/generate/post-pack";

export type SocialPostPack = {
  title: string;
} & PostPackFields;

export type StructuredPackResult = {
  summary: string;
  post_packs: SocialPostPack[];
};

const SYSTEM = `You are the Helion Media social studio. Helion helps real businesses ship social content that sounds human and on-brand — never generic "AI marketing" filler.

Output ONE JSON object only. No markdown fences, no commentary outside JSON.

## post_packs item shape (depends on suggested_format)

### A) static post, reel, or story
Use pack-level fields only. Omit "slides" or set "slides": null.
{
  "title": "...",
  "post_angle": "...",
  "suggested_format": "static post" | "reel" | "story",
  "hook": "...",
  "caption": "...",
  "call_to_action": "...",
  "hashtags": "...",
  "visual_direction": "Practical art direction for a single image or concept",
  "image_prompt": "Optional short line for image generation, or null (reel/story: often null)"
}

### B) carousel (multi-slide; required)
Include pack-level hook/caption/CTA/hashtags for the overall post PLUS a "slides" array (3 to 7 slides).
Pack-level "visual_direction" = short overview of how the carousel flows (1–3 sentences).
Pack-level "image_prompt" may be null (per-slide prompts live on slides).
{
  "title": "...",
  "post_angle": "...",
  "suggested_format": "carousel",
  "hook": "...",
  "caption": "Full caption; can reference swiping through slides",
  "call_to_action": "...",
  "hashtags": "...",
  "visual_direction": "How the carousel reads as a whole; narrative arc across slides",
  "image_prompt": null,
  "slides": [
    {
      "slide_number": 1,
      "title": "Short slide headline",
      "supporting_text": "On-slide copy idea or bullet (not literal text to render in an image)",
      "visual_direction": "What this slide should show — one clear visual idea",
      "image_prompt": "Optional one-line image brief for this slide, or null"
    }
  ]
}

Carousel rules:
- slides array MUST have between 3 and 7 items; slide_number must be 1..N in order with no gaps.
- Each slide is one distinct visual beat; avoid repeating the same composition.
- This app generates still images per slide later — not video.

## Helion quality bar
- Write like someone who posts for this brand weekly: concrete nouns, real scenarios, specific details from the brand context.
- Each pack is ONE complete post. Hook + caption + CTA + hashtags + visuals must feel cohesive.
- Make the 3 packs clearly different (angle, format, hook) — not small rewrites of the same idea.

## Platform awareness (when the user names a platform, follow it strictly)
- Instagram: punchy hook; carousels = clear slide progression.
- Facebook: slightly warmer, community-oriented language.
- LinkedIn: professional but not stiff; carousels can be educational step-by-step.
- TikTok-style / short-form: ultra-tight hook; still no video file — text only.

## Format field (suggested_format)
- "static post": single-image feed post.
- "carousel": MUST include full "slides" array (3–7 slides).
- "story" for ephemeral, vertical, time-bound angles.
- "reel": ONLY as a *concept* — no video files; never imply exported video.

## Language
- Write every user-facing string in the language specified in the user message.

## Objective
- Align CTA and tone with the campaign objective in the user message.

## Style guardrails
- Avoid emoji-heavy copy and decorative icon spam. Use emojis only when the brand voice clearly calls for them or the user explicitly asks.
- Prefer clean punctuation and strong wording over classic AI-looking embellishments.

## Banned patterns (unless the brand voice explicitly uses them)
- "In today's fast-paced world", "unlock", "elevate your brand", "game-changer", "synergy", "leverage", "cutting-edge", "digital transformation", "join us on a journey".
- Empty superlatives without proof or brand voice.

## Rules
- Exactly 3 items in post_packs — never fewer, never more.
- For carousel packs: slides array is REQUIRED with 3–7 slides. For non-carousel: do not include slides.
- Every required string field must be non-empty where specified. Use null for image_prompt when omitting.
- suggested_format must be one of: carousel, reel, static post, story.`;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function parseOptionalImagePrompt(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t.length > 0 ? t : null;
}

function parsePostPackItem(raw: unknown): SocialPostPack | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title = isNonEmptyString(o.title) ? o.title.trim() : "";
  const post_angle = isNonEmptyString(o.post_angle) ? o.post_angle.trim() : "";
  const hook = isNonEmptyString(o.hook) ? o.hook.trim() : "";
  const caption = isNonEmptyString(o.caption) ? o.caption.trim() : "";
  const call_to_action = isNonEmptyString(o.call_to_action) ? o.call_to_action.trim() : "";
  const hashtags = isNonEmptyString(o.hashtags) ? o.hashtags.trim() : "";
  const visual_direction = isNonEmptyString(o.visual_direction) ? o.visual_direction.trim() : "";
  const fmtRaw = isNonEmptyString(o.suggested_format) ? o.suggested_format : "";
  if (!title || !post_angle || !hook || !caption || !call_to_action || !hashtags || !visual_direction) {
    return null;
  }
  const suggested_format: SuggestedFormat = (fmtRaw
    ? normalizeSuggestedFormat(fmtRaw)
    : "static post") as SuggestedFormat;
  const image_prompt = parseOptionalImagePrompt(o.image_prompt);

  let slides = parseSlidesArray(o.slides).map((s) => ({
    ...s,
    image_url: null as string | null,
    media_url: null as string | null,
    media_status: "not_generated" as const,
  }));

  if (suggested_format === "carousel") {
    if (slides.length < 3 || slides.length > 7) {
      return null;
    }
  } else {
    slides = [];
  }

  return {
    title,
    post_angle,
    suggested_format,
    hook,
    caption,
    call_to_action,
    hashtags,
    visual_direction,
    image_prompt,
    image_url: null,
    media_url: null,
    media_status: "not_generated",
    slides,
  };
}

function parsePostPacks(raw: unknown): SocialPostPack[] {
  if (!Array.isArray(raw)) return [];
  const out: SocialPostPack[] = [];
  for (const item of raw) {
    const pack = parsePostPackItem(item);
    if (pack) out.push(pack);
  }
  return out;
}

const OBJECTIVE_LABELS: Record<string, string> = {
  awareness: "brand awareness / reach",
  engagement: "comments, saves, shares",
  traffic: "clicks to site or link",
  leads: "DMs, sign-ups, bookings",
  community: "belonging and conversation",
  launch: "announcement or campaign push",
};

const RETRY_USER_SUFFIX =
  "CRITICAL: The top-level JSON must include post_packs as an array with length 3 only. Each object must include every required string field so nothing is dropped during validation.";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function shouldRetryStructuredAttempt(err: unknown): boolean {
  if (err instanceof APIError) {
    if (err.status === 401 || err.status === 403) return false;
    return true;
  }
  if (!(err instanceof Error)) return false;
  const m = err.message;
  if (m.includes("OPENAI_API_KEY")) return false;
  return (
    m.includes("Expected exactly 3 post packs") ||
    m.includes("Model did not return valid JSON") ||
    m.includes("Invalid JSON shape") ||
    m.includes("Empty model response")
  );
}

async function runStructuredGenerationOnce(
  params: {
    brandName: string;
    brandBlock: string;
    topic: string;
    platform?: string;
    tone?: string;
    language?: string;
    objective?: string;
  },
  options: { attemptIndex: number; appendRetryHint: boolean },
): Promise<StructuredPackResult> {
  const apiKey = getOptionalOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const lang = params.language?.trim() || "en";
  const objectiveKey = params.objective?.trim() ?? "";
  const objectiveLine = objectiveKey
    ? `Campaign objective: ${OBJECTIVE_LABELS[objectiveKey] ?? objectiveKey}. Shape CTA and proof points to match.`
    : "";

  const openai = new OpenAI({ apiKey });
  const userMsg = [
    `Brand name: ${params.brandName}`,
    `Write all post copy in language code: ${lang} (use natural native phrasing for that language).`,
    params.brandBlock ? `Brand context:\n${params.brandBlock}` : "",
    objectiveLine,
    params.tone ? `Tone overlay: ${params.tone} — still must match brand context above.` : "",
    `Topic / campaign notes:\n${params.topic}`,
    params.platform
      ? `Primary platform: ${params.platform} — hooks, caption length, line breaks, and hashtag style must match what performs there.`
      : "If no platform was given, choose sensible defaults per post (vary formats) and note the assumed platform in each post_angle only if helpful.",
    "Return exactly 3 complete post_packs as specified. For carousel packs, include a slides array (3–7 slides). image_prompt may be null.",
    options.appendRetryHint ? RETRY_USER_SUFFIX : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const temperature = options.attemptIndex === 0 ? 0.72 : 0.55;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userMsg },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty model response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Model did not return valid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON shape");
  }

  const obj = parsed as Record<string, unknown>;
  const summary =
    typeof obj.summary === "string" && obj.summary.trim()
      ? obj.summary.trim()
      : "Generated post packs";

  const post_packs = parsePostPacks(obj.post_packs);

  if (post_packs.length !== 3) {
    throw new Error(
      `Expected exactly 3 post packs, got ${post_packs.length}. Try again — the model returned an invalid batch.`,
    );
  }

  return { summary, post_packs };
}

export async function runStructuredGeneration(params: {
  brandName: string;
  brandBlock: string;
  topic: string;
  platform?: string;
  tone?: string;
  /** ISO-ish code e.g. en, es */
  language?: string;
  /** e.g. awareness, leads */
  objective?: string;
}): Promise<StructuredPackResult> {
  const maxAttempts = 3;
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await runStructuredGenerationOnce(params, {
        attemptIndex: attempt,
        appendRetryHint: attempt > 0,
      });
    } catch (e) {
      lastErr = e;
      if (attempt < maxAttempts - 1 && shouldRetryStructuredAttempt(e)) {
        await sleep(350 * (attempt + 1));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}
