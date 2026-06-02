-- Relax profile visibility to match the locked decision in §6.1:
-- users browse and match unverified. Stripe Identity is gated only
-- at the entry to Q&A scheduling (§6.1, §10 step 3), NOT at the app
-- boundary or the discover feed.
--
-- The previous policy required id_verified = true for cross-user
-- reads, which made the /discover feed unusable for anyone who
-- hadn't been through verification. The new policy drops the
-- id_verified condition and keeps only paused = false. The
-- `users can read their own profile` policy stays as the
-- always-readable backstop for one's own row.
--
-- The partial index gets reshaped to match.

drop policy if exists "profiles are readable when verified and unpaused"
  on public.profiles;

create policy "profiles are readable when not paused"
on public.profiles for select
to authenticated
using (paused = false);

drop index if exists public.profiles_visible_idx;

create index profiles_visible_idx
  on public.profiles (id)
  where paused = false;
