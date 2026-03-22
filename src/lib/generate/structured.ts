import OpenAI from "openai";
import { getOptionalOpenAIApiKey } from "@/lib/env/server";

export type GeneratedPiece = {
  kind: "post_idea" | "hook" | "caption" | "cta" | "hashtags" | "image_prompt";
  title?: string;
  body: string;
  platform?: string;
};

export type StructuredPackResult = {
  summary: string;
  pieces: GeneratedPiece[];
};

const SYSTEM = `You are a social content assistant. Respond with a single JSON object only, no markdown.
Schema:
{
  "summary": "one short sentence overview",
  "pieces": [
    {
      "kind": "post_idea" | "hook" | "caption" | "cta" | "hashtags" | "image_prompt",
      "title": "optional short label",
      "body": "the text content",
      "platform": "optional e.g. Instagram"
    }
  ]
}
Include at least 2 post_ideas, 2 hooks, 2 captions, 1 cta, 1 hashtags string, 1 image_prompt. Keep copy aligned with the brand voice.`;

function normalizeKind(raw: string): GeneratedPiece["kind"] | null {
  const k = raw.toLowerCase().replace(/\s+/g, "_");
  if (
    k === "post_idea" ||
    k === "hook" ||
    k === "caption" ||
    k === "cta" ||
    k === "hashtags" ||
    k === "image_prompt"
  ) {
    return k;
  }
  return null;
}

function parsePieces(raw: unknown): GeneratedPiece[] {
  if (!Array.isArray(raw)) return [];
  const out: GeneratedPiece[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const kind = typeof o.kind === "string" ? normalizeKind(o.kind) : null;
    const body = typeof o.body === "string" ? o.body.trim() : "";
    if (!kind || !body) continue;
    out.push({
      kind,
      title: typeof o.title === "string" ? o.title.trim() : undefined,
      body,
      platform: typeof o.platform === "string" ? o.platform.trim() : undefined,
    });
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
    params.platform ? `Preferred platform: ${params.platform}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
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
    typeof obj.summary === "string" && obj.summary.trim() ? obj.summary.trim() : "Generated content pack";
  const pieces = parsePieces(obj.pieces);

  if (pieces.length === 0) {
    throw new Error("Model returned no usable pieces");
  }

  return { summary, pieces };
}
