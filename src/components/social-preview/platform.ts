/** Platform-inspired previews: route Facebook vs Instagram-style chrome from free-text platform field. */
export function isFacebookPlatform(platform: string | null | undefined): boolean {
  if (!platform) return false;
  const p = platform.toLowerCase();
  return p.includes("facebook") || p.includes(" fb") || p === "fb";
}
