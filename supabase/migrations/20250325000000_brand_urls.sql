-- Optional structured URLs for brand context (future crawling). Empty object by default.
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS brand_urls jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.brands.brand_urls IS
  'Structured website/social URLs (website, instagram, facebook, linkedin, custom[]). Used as brand context; fetching not implemented in v1.';
