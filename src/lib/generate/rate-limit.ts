/** Simple in-memory limiter (best-effort per server instance). */
const buckets = new Map<string, number[]>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

export function allowGenerate(userId: string): boolean {
  const now = Date.now();
  const prev = buckets.get(userId) ?? [];
  const recent = prev.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    return false;
  }
  recent.push(now);
  buckets.set(userId, recent);
  return true;
}
