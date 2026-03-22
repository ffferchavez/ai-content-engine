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

const SYSTEM = `You are the social content studio for Helion Media. Output a single JSON object only — no markdown, no prose outside JSON.

Your job is to deliver READY-TO-POST social packs: concrete, specific, and native to how people actually use each format on Instagram / LinkedIn / TikTok (short lines, real hooks, no brochure tone).

JSON schema (exact keys):
{
  "summary": "one sharp sentence: what this batch is for and how the posts differ",
  "post_packs": [
    {
      "title": "short internal name for this post (not clickbait)",
      "post_angle": "the one idea or POV this post pushes",
      "suggested_format": "carousel" | "reel" | "static post" | "story",
      "hook": "opening line or on-screen text — punchy, speakable, platform-realistic",
      "caption": "full caption with natural line breaks where needed",
      "call_to_action": "specific next step (comment, save, DM, book, etc.)",
      "hashtags": "space-separated or inline — realistic count, not spam",
      "visual_direction": "what to show or film: shots, layout, text-on-screen, b-roll — practical for a creator"
    }
  ]
}

Rules:
- Produce exactly 3, 4, or 5 items in post_packs (never fewer than 3, never more than 5).
- Each post must be a COMPLETE pack: every field non-empty.
- Make posts DISTINCT: different angles, formats, and hooks — not five versions of the same line.
- Match the brand voice from the user message; mirror real vocabulary from the brand context when possible.
- Avoid generic agency filler: no "digital transformation", "unlock potential", "elevate your brand", "in today's fast-paced world", "synergy", "leverage", "cutting-edge" unless the brand itself uses that language.
- Avoid stock phrases like "Join us on a journey" unless it fits the brand voice.
- Write like a practitioner shipping content this week: specific details, real scenarios, clear visuals.
- suggested_format must be one of: carousel, reel, static post, story.`;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
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
  return {
    title,
    post_angle,
    suggested_format,
    hook,
    caption,
    call_to_action,
    hashtags,
    visual_direction,
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

export async function runStructuredGeneration(params: {
  brandName: string;
  brandBlock: string;
  topic: string;
  platform?: string;
  /** e.g. friendly, professional, bold */
  tone?: string;
}): Promise<StructuredPackResult> {
  const apiKey = getOptionalOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });
  const userMsg = [
    `Brand name: ${params.brandName}`,
    params.brandBlock ? `Brand context:\n${params.brandBlock}` : "",
    params.tone ? `Tone: write in a ${params.tone} style.` : "",
    `Topic / brief: ${params.topic}`,
    params.platform
      ? `Primary platform or channel: ${params.platform} — tailor hooks and caption shape to what works there.`
      : "",
    "Return 3–5 complete post_packs as specified.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.75,
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
