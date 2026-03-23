import type { BrandUrls } from "@/lib/brands/urls";

/** Row shape for `public.brands` (client-safe fields). */
export type BrandRow = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  voice_notes: string | null;
  target_audience: string | null;
  industry: string | null;
  brand_guidelines: Record<string, unknown> | null;
  /** Website/social/reference URLs for future context use; v1 stores only. */
  brand_urls: BrandUrls;
  default_language: string;
  created_at: string;
  updated_at: string;
};
