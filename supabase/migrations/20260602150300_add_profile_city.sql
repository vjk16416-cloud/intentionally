-- Add `city` to profiles to support multi-market matching.
--
-- Nullable at the DB level, same pattern as the other onboarding
-- columns: the onboarding-complete gate (lib/onboarding/state.ts)
-- enforces that it's set before /discover unlocks. No DB CHECK on
-- the (city, neighbourhood) pair — that validation lives in the
-- server action against the hard-coded MARKETS map so adding a new
-- city is a code-only change.

alter table public.profiles
  add column city text;
