import OpenAI from "openai";
import { getOptionalOpenAIApiKey } from "@/lib/env/server";
import {
  normalizeSuggestedFormat,
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

## Output shape (exact keys)
{
  "summary": "One sentence: what this batch is for and how the 3–5 posts differ.",
  "post_packs": [
    {
      "title": "Short internal label for this post (not clickbait)",
      "post_angle": "The single idea or POV this post commits to",
      "suggested_format": "carousel" | "reel" | "static post" | "story",
      "hook": "First line or on-screen opener — tight, speakable, fits the platform",
      "caption": "Full caption with natural line breaks; length should match the platform norms in the user message",
      "call_to_action": "One concrete next step (comment, save, DM, link in bio, book, etc.)",
      "hashtags": "Realistic set for the platform — not spammy; use # where appropriate or plain words if the platform rarely uses hashtags",
      "visual_direction": "Practical art direction: composition, subject, lighting mood, text overlay placement — what a designer or photographer could execute",
      "image_prompt": "Optional: ONE short English line a future image model could use (subject + style). Use null if not needed."
    }
  ]
}

## Helion quality bar
- Write like someone who posts for this brand weekly: concrete nouns, real scenarios, specific details from the brand context.
- Each pack is ONE complete post, not a bucket of parts. Hook + caption + CTA + hashtags + visuals must feel like the same post.
- Make the 3–5 packs clearly different (angle, format, hook) — not small rewrites of the same idea.

## Platform awareness (when the user names a platform, follow it strictly)
- Instagram: punchy hook, short paragraphs or single block, strong visual_direction; carousels = slide-by-slide beats in visual_direction if format is carousel.
- Facebook: slightly warmer, community-oriented language; hooks can be a full first sentence.
- LinkedIn: professional but not stiff; line breaks for skim-reading; avoid hashtag walls; hooks often work as a standalone first line.
- TikTok-style / short-form: ultra-tight hook; caption can reference on-screen text; still no video file — text only.

## Format field (suggested_format)
- "static post" and "carousel" are preferred for LinkedIn and many B2B cases.
- "story" for ephemeral, vertical, time-bound angles.
- "reel": ONLY as a *concept* — shot list + on-screen text ideas in hook/visual_direction. This app does NOT produce video files; never imply exported video or editing timelines.

## Language
- Write every user-facing string in the language specified in the user message (hook, caption, CTA, hashtags as appropriate for that locale). If the language is English, use the brand's market (US/UK) vocabulary from context.

## Objective
- Align CTA and tone with the campaign objective in the user message (e.g. awareness vs leads).

## Banned patterns (unless the brand voice explicitly uses them)
- "In today's fast-paced world", "unlock", "elevate your brand", "game-changer", "synergy", "leverage", "cutting-edge", "digital transformation", "join us on a journey".
- Empty superlatives ("best ever") without proof or brand voice.
- Generic questions as hooks ("Did you know…?") unless they are specific.

## Rules
- Exactly 3, 4, or 5 items in post_packs — never fewer, never more.
- Every required string field must be non-empty. Use null only for image_prompt when omitting it.
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
    "Return 3–5 complete post_packs as specified. image_prompt may be null on any item.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.72,
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

  if (post_packs.length < 3 || post_packs.length > 5) {
    throw new Error(
      `Expected 3–5 post packs, got ${post_packs.length}. Try again — the model returned an invalid batch.`,
    );
  }

  return { summary, post_packs };
}
