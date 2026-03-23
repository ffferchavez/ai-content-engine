import { APIError } from "openai";

/** Map vendor errors to user-safe messages (route / API layer). */
export function mapImageProviderError(err: unknown): string {
  if (err instanceof APIError) {
    if (err.status === 429) return "The AI is busy. Wait a minute and try again.";
    if (err.status === 401) return "API key is invalid. Check your image provider credentials.";
    if (err.status === 400 && err.message?.includes("content_policy"))
      return "This prompt was rejected by the image model. Try adjusting your brief and visual direction.";
    if (err.message) return err.message;
  }
  if (err instanceof Error) {
    if (err.message.includes("OPENAI_API_KEY")) return "OPENAI_API_KEY is not set";
    return err.message;
  }
  return "Image generation failed. Try again.";
}
