-- 48-hour match expiry per the §6.4 refinement (locked in 5a, building
-- toward 5b.4). Sooner converts better; interest decays fast after a
-- match. Was 7 days from the original matches migration; this is the
-- shortened default for all new matches.
--
-- Only the column DEFAULT changes — existing rows keep whatever
-- expires_at they were assigned at creation. The expiry cron in
-- 5b.4 is what actually closes expired matches.

alter table public.matches
  alter column expires_at set default (now() + interval '48 hours');
