/**
 * Provider-agnostic image generation (server-only).
 * Core code depends on these types — not on DALL·E or any single vendor.
 */

export type ImageProviderId = "openai" | "gemini";

export type ReferenceImageInput = {
  buffer: Buffer;
  mimeType: string;
  filename?: string;
};

/** Options are intentionally loose; each provider maps them to vendor APIs. */
export type ImageGenerationOptions = {
  /** e.g. 1024x1024 — interpreted per provider */
  size?: string;
  /** e.g. high, medium — interpreted per provider */
  quality?: string;
  /** Optional reference images for edit / multimodal flows. */
  referenceImages?: ReferenceImageInput[];
};

export type GeneratedImageResult = {
  buffer: Buffer;
  mimeType: string;
};

export interface ImageGenerationProvider {
  readonly id: ImageProviderId;
  generateImage(prompt: string, options?: ImageGenerationOptions): Promise<GeneratedImageResult>;
}
