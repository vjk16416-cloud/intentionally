-- Matches per §5 of AGENTS.md.
--
-- Created by the swipe trigger (next migration) on reciprocal likes.
-- Status transitions in later steps happen via server-side service-
-- role updates, so no client update or insert policy here — clients
-- only read their own matches.
--
-- The (user_a < user_b) check + unique pair makes match identity
-- symmetric (A→B and B→A produce the same row), which simplifies
-- look-ups and prevents duplicates under a race.

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending_qa' check (
    status in ('pending_qa', 'qa_scheduled', 'qa_complete', 'unlocked', 'closed')
  ),
  closed_reason text check (
    closed_reason is null
    or closed_reason in ('mutual_pass', 'a_passed', 'b_passed', 'expired', 'reported')
  ),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

create index matches_user_a_idx on public.matches (user_a);
create index matches_user_b_idx on public.matches (user_b);

alter table public.matches enable row level security;

create policy "users can read their own matches"
on public.matches for select
to authenticated
using (auth.uid() = user_a or auth.uid() = user_b);
