-- Q&A sessions per §5 of AGENTS.md, with proposed_at / proposed_by_id /
-- confirmed_at columns for the propose-then-confirm flow.
--
-- One session per match (unique match_id). Counter-proposals are
-- in-place updates: same row, new scheduled_at, proposed_at refreshed,
-- proposed_by_id flipped to the new proposer, confirmed_at cleared
-- back to null.
--
-- daily_room_url, daily_room_name, and questions populate at
-- confirmation time. Until then they're null — the spec's "not null"
-- shape in §5 is the *post-confirmation* shape, enforced by app
-- logic rather than the DB. The status enum stays as the spec's
-- five values; "proposed vs confirmed" is read off confirmed_at
-- being set (Q2 of the Step 5 plan).
--
-- Writes go through the service-role client only (no INSERT/UPDATE
-- RLS policies), matching the convention used for matches. RLS
-- exposes SELECT to the two participants of the underlying match.

create table public.qa_sessions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches (id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes int not null default 10,
  daily_room_url text,
  daily_room_name text,
  questions jsonb,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'in_progress', 'completed', 'no_show', 'cancelled')
  ),
  proposed_at timestamptz not null default now(),
  proposed_by_id uuid not null references public.profiles (id) on delete cascade,
  confirmed_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  no_show_user_id uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index qa_sessions_match_id_idx on public.qa_sessions (match_id);

alter table public.qa_sessions enable row level security;

create policy "participants can read their q&a sessions"
on public.qa_sessions for select
to authenticated
using (
  exists (
    select 1 from public.matches m
    where m.id = qa_sessions.match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);
