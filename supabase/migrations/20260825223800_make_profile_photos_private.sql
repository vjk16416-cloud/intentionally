-- Keep profile photos behind authenticated/signed delivery.
-- Application code already stores object paths and issues short-lived signed URLs.
update storage.buckets
set public = false,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']::text[]
where id = 'profile-photos';
