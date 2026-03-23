/** Stored in `brands.brand_urls` (jsonb). */
export type BrandUrls = {
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  /** Extra profile or reference URLs (max 5 in forms). */
  custom?: string[];
};

const URL_KEYS = ["website", "instagram", "facebook", "linkedin"] as const;

export function parseBrandUrlsFromDb(raw: unknown): BrandUrls {
  if (raw === null || raw === undefined) return {};
  if (typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const out: BrandUrls = {};
  for (const k of URL_KEYS) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  const custom = o.custom;
  if (Array.isArray(custom)) {
    const list = custom
      .filter((u): u is string => typeof u === "string")
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length) out.custom = list;
  }
  return out;
}

function normalizeHttpUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const href = t.includes("://") ? t : `https://${t}`;
    const u = new URL(href);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

export type BrandUrlsFormResult =
  | { ok: true; brand_urls: BrandUrls }
  | { ok: false; error: string };

/** Build `brand_urls` from Brands form fields (server actions). */
export function brandUrlsFromFormData(formData: FormData): BrandUrlsFormResult {
  const row: BrandUrls = {};

  for (const key of URL_KEYS) {
    const raw = String(formData.get(`url_${key}`) ?? "").trim();
    if (!raw) continue;
    const href = normalizeHttpUrl(raw);
    if (!href) {
      return { ok: false, error: `Invalid URL for ${key}: enter a full link (e.g. https://…).` };
    }
    row[key] = href;
  }

  const customBlock = String(formData.get("url_custom_lines") ?? "");
  const lines = customBlock
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length > 5) {
    return { ok: false, error: "Add at most 5 extra URLs (one per line)." };
  }
  const custom: string[] = [];
  for (const line of lines) {
    const href = normalizeHttpUrl(line);
    if (!href) {
      return { ok: false, error: `Invalid extra URL: ${line}` };
    }
    custom.push(href);
  }
  if (custom.length) row.custom = custom;

  return { ok: true, brand_urls: row };
}

/** Append to OpenAI brand context block (no fetching in v1). */
export function brandUrlsContextBlock(urls: BrandUrls | null | undefined): string {
  if (!urls || typeof urls !== "object") return "";
  const lines: string[] = [];
  if (urls.website) lines.push(`Company website: ${urls.website}`);
  if (urls.instagram) lines.push(`Instagram: ${urls.instagram}`);
  if (urls.facebook) lines.push(`Facebook: ${urls.facebook}`);
  if (urls.linkedin) lines.push(`LinkedIn: ${urls.linkedin}`);
  if (urls.custom?.length) {
    for (const u of urls.custom) lines.push(`Reference URL: ${u}`);
  }
  if (!lines.length) return "";
  return [
    "Brand context sources (saved in your profile; pages are not fetched automatically yet — use as reference only):",
    ...lines,
  ].join("\n");
}
