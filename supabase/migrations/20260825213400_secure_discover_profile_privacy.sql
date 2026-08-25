drop policy if exists "profiles are readable when not paused" on public.profiles;

update storage.buckets
set public = false,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']::text[]
where id = 'profile-photos';
