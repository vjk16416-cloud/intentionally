-- Adds the weekly availability grid to profiles for Step 5b.1.
--
-- Storage shape: int[] of "slot indices". An index is
-- `day_of_week * 48 + half_hour_of_day`, where day is 0..6 (0=Mon)
-- and half_hour is 0..47 (0=00:00, 47=23:30). So Monday 9–11am
-- (4 half-hour slots) is [66, 67, 68, 69]. 336 total possible
-- values per user (7 * 48).
--
-- Why int[] not jsonb: PostgREST's && (array overlap) operator is
-- a clean filter for the discover feed ("show profiles whose
-- availability overlaps mine"). jsonb would force a CAST or a
-- jsonb_array_elements unfold per row.
--
-- Why no separate availability_slots table: trivial volume at MVP
-- scale, and a column keeps the discover join uniform.

alter table public.profiles
  add column availability int[];

-- Guards against bad data via direct DB access. App layer also
-- validates. Empty arrays pass (universal quantifier over ∅ is
-- vacuously true) — the app gate enforces non-empty.
alter table public.profiles
  add constraint profiles_availability_slot_range_check check (
    availability is null
    or (
      0 <= all(availability)
      and 336 > all(availability)
    )
  );

-- GIN index speeds up the && overlap filter in /discover.
create index profiles_availability_gin_idx
  on public.profiles
  using gin (availability);
