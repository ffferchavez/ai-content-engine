/**
 * Two-letter initials from a display name or email (e.g. "Maria Fernandez" → "MF").
 */
export function userInitials(input: {
  name?: string | null;
  email?: string | null;
}): string {
  const name = input.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.[0];
      const b = parts[parts.length - 1]?.[0];
      if (a && b) return `${a}${b}`.toUpperCase();
    }
    if (parts.length === 1) {
      const p = parts[0];
      if (p.length >= 2) return p.slice(0, 2).toUpperCase();
      if (p.length === 1) return `${p[0]}${p[0]}`.toUpperCase();
    }
  }

  const email = input.email?.trim();
  if (email?.includes("@")) {
    const local = email.split("@")[0] ?? "";
    const cleaned = local.replace(/[^a-zA-Z0-9]/g, "");
    if (cleaned.length >= 2) return cleaned.slice(0, 2).toUpperCase();
    if (cleaned.length === 1) return `${cleaned[0]}${cleaned[0]}`.toUpperCase();
  }

  return "??";
}
