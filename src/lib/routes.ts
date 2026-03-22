export const protectedPaths = [
  "/dashboard",
  "/brands",
  "/generate",
  "/library",
  "/settings",
] as const;

export function isProtectedPath(pathname: string) {
  return protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
