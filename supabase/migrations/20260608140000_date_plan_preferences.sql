-- MVP date plan sharing: each chat participant can share one preferred
-- predefined plan for the match. We store only the option key, not
-- private messages or free-text plan content.

create table public.date_plan_preferences (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, user_id),
  check (plan_key in ('coffee-first', 'walk-and-pastries', 'casual-food'))
);

create index date_plan_preferences_match_id_idx
on public.date_plan_preferences (match_id);

alter table public.date_plan_preferences enable row level security;

create policy "matched users can read date plan preferences"
on public.date_plan_preferences for select
to authenticated
using (
  exists (
    select 1
    from public.matches m
    join public.chats c on c.match_id = m.id
    where m.id = date_plan_preferences.match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);

create policy "matched users can insert own date plan preference"
on public.date_plan_preferences for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.matches m
    join public.chats c on c.match_id = m.id
    where m.id = date_plan_preferences.match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);

create policy "matched users can update own date plan preference"
on public.date_plan_preferences for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.matches m
    join public.chats c on c.match_id = m.id
    where m.id = date_plan_preferences.match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.matches m
    join public.chats c on c.match_id = m.id
    where m.id = date_plan_preferences.match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);
