/** Per-user cap for image generation (separate from text generation). */
const buckets = new Map<string, number[]>();

const WINDOW_MS = 60_000;
const MAX_IMAGE_REQUESTS = 15;

export function allowPostPackImageGenerate(userId: string): boolean {
  const now = Date.now();
  const key = `img:${userId}`;
  const prev = buckets.get(key) ?? [];
  const recent = prev.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_IMAGE_REQUESTS) {
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}
