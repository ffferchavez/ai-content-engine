-- Supabase Storage: public bucket for AI-generated post images (Helion Media)
-- Uploads are performed server-side with the service role key (bypasses Storage RLS).
-- Public URLs keep the app simple; for stricter privacy later, switch to a private bucket + signed URLs.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-media',
  'generated-media',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
