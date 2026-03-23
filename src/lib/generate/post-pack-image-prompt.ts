import OpenAI from "openai";
import type { SuggestedFormat } from "@/lib/generate/post-pack";

const MAX_DALLE_PROMPT = 3500;

const TRANSFORMER_SYSTEM = `You write the final text prompt for DALL·E 3 (Helion Media — premium social content).

You receive notes from a social post pack. The "visual direction" field is creative copy for humans — often too busy or literal for an image model.

Your job: output ONE concise English prompt (plain text only, no quotes, no markdown) that will produce a clean, scroll-stopping still image.

Rules you must follow:
- Distill to a single strong visual idea. Do not list every detail from the notes.
- Never instruct the image model to render text, typography, captions, labels, logos, watermarks, UI, dashboards, app screens, browser chrome, or fake interface elements — unless the notes explicitly require real-world signage (rare).
- Avoid infographic layouts, multi-panel collages, busy grids, and "futuristic tech" clutter unless clearly required (they usually are not).
- Prefer simple, premium composition: clear subject, generous negative space, natural or soft studio light, editorial or modern ad aesthetic.
- One focal subject or one clear scene beats many competing elements.

If the user message says this is ONE SLIDE of a carousel, produce an image for that slide only — not a grid of slides or a mock-up of multiple cards.

Output only the prompt text, under 1200 words. No preamble.`;

export type SlidePromptContext = {
  slideNumber: number;
  slideTitle: string;
  supportingText: string;
  totalSlides: number;
};

export type TransformImagePromptParams = {
  post_angle: string;
  image_prompt: string | null;
  visual_direction: string;
  suggested_format: SuggestedFormat;
  title?: string | null;
  /** Carousel: one slide; visual_direction + image_prompt refer to that slide. */
  slideContext?: SlidePromptContext;
};

/**
 * Internal layer: turns post-pack copy into a single DALL·E prompt.
 * Does not pass visual_direction through verbatim — the model distills it.
 */
export async function transformImagePromptForPostPack(
  params: TransformImagePromptParams,
  openai: OpenAI,
): Promise<string> {
  const formatLine = params.slideContext
    ? `Output format intent: carousel slide ${params.slideContext.slideNumber} of ${params.slideContext.totalSlides} — one still image for this slide only (not a multi-slide collage inside the image).`
    : params.suggested_format === "carousel"
      ? "Output format intent: carousel — one strong still frame (single image)."
      : "Output format intent: static post — one scroll-stopping square feed image.";

  const userBlock = params.slideContext
    ? [
        params.title ? `Context title: ${params.title}` : null,
        `Post angle: ${params.post_angle}`,
        `Slide ${params.slideContext.slideNumber} of ${params.slideContext.totalSlides}: ${params.slideContext.slideTitle}`,
        params.slideContext.supportingText
          ? `Supporting copy idea (do not render as text in the image): ${params.slideContext.supportingText}`
          : null,
        params.image_prompt ? `Image brief: ${params.image_prompt}` : null,
        `Visual direction for this slide (distill — do NOT reproduce as a shot list): ${params.visual_direction}`,
        formatLine,
      ]
    : [
        params.title ? `Post title (context only): ${params.title}` : null,
        `Post angle: ${params.post_angle}`,
        params.image_prompt ? `Optional image brief (use if helpful, do not paste blindly): ${params.image_prompt}` : null,
        `Visual direction notes (distill — do NOT reproduce as a shot list): ${params.visual_direction}`,
        formatLine,
      ];

  const userContent = userBlock.filter(Boolean).join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.35,
    max_tokens: 700,
    messages: [
      { role: "system", content: TRANSFORMER_SYSTEM },
      { role: "user", content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const cleaned = raw.replace(/^["']|["']$/g, "").trim();
  if (!cleaned) {
    return buildFallbackImagePrompt(params);
  }
  return cleaned.length > MAX_DALLE_PROMPT ? cleaned.slice(0, MAX_DALLE_PROMPT) : cleaned;
}

/**
 * If the transformer fails or returns empty, use a safe minimal prompt (no raw visual_direction dump).
 */
export function buildFallbackImagePrompt(params: TransformImagePromptParams): string {
  const theme = params.post_angle.trim();
  const brief = params.image_prompt?.trim();
  const base = [
    "Premium social media still image, single clear focal subject, clean composition, soft natural or studio light.",
    "No text, no typography, no captions, no logos, no watermarks, no UI, no app screens, no dashboards, no charts.",
    `Theme: ${theme}.`,
  ];

  if (params.slideContext) {
    base.push(
      `Slide ${params.slideContext.slideNumber} of ${params.slideContext.totalSlides}: ${params.slideContext.slideTitle}.`,
      brief ? `Visual idea: ${brief}.` : "Editorial quality, negative space.",
      "One still image for this carousel slide only.",
    );
  } else {
    base.push(
      brief ? `Visual idea: ${brief}.` : "Editorial quality, negative space, modern brand-safe aesthetic.",
      params.suggested_format === "carousel"
        ? "Single strong still frame suitable for social."
        : "Square feed post, scroll-stopping simplicity.",
    );
  }

  const out = base.join(" ");
  return out.length > MAX_DALLE_PROMPT ? out.slice(0, MAX_DALLE_PROMPT) : out;
}
