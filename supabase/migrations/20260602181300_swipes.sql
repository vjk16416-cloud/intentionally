-- Swipes per §5 of AGENTS.md, plus the reciprocal-like trigger that
-- materialises matches.
--
-- One row per (swiper, swipee) — the unique constraint makes
-- duplicate swipes a no-op rather than an error, and the
-- swiper != swipee check prevents self-swipes at the DB level.
--
-- The swipes_swipee_like partial index speeds up the trigger's
-- reciprocal-like lookup: "given this new like from A→B, does a
-- like from B→A exist?". It also makes the discover feed's
-- not-already-swiped filter cheap.

create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles (id) on delete cascade,
  swipee_id uuid not null references public.profiles (id) on delete cascade,
  direction text not null check (direction in ('like', 'pass')),
  created_at timestamptz not null default now(),
  unique (swiper_id, swipee_id),
  check (swiper_id <> swipee_id)
);

create index swipes_swiper_idx on public.swipes (swiper_id);
create index swipes_swipee_like_idx
  on public.swipes (swipee_id, swiper_id)
  where direction = 'like';

alter table public.swipes enable row level security;

create policy "users can insert their own swipes"
on public.swipes for insert
to authenticated
with check (auth.uid() = swiper_id);

create policy "users can read their own swipes"
on public.swipes for select
to authenticated
using (auth.uid() = swiper_id);

-- Reciprocal-like trigger.
--
-- On insert of a 'like' swipe, check whether the swipee has already
-- liked the swiper; if so, create the matches row with the
-- (user_a < user_b) ordering. The "on conflict do nothing" handles
-- the race where both users like in the same instant — only one
-- match row materialises.
--
-- SECURITY DEFINER so it can (a) read the other user's swipe even
-- if RLS would otherwise hide it, and (b) write to matches, which
-- has no client-insert policy.

create or replace function public.handle_swipe()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ua uuid;
  ub uuid;
begin
  if new.direction = 'like' then
    if exists (
      select 1 from public.swipes
      where swiper_id = new.swipee_id
        and swipee_id = new.swiper_id
        and direction = 'like'
    ) then
      if new.swiper_id < new.swipee_id then
        ua := new.swiper_id;
        ub := new.swipee_id;
      else
        ua := new.swipee_id;
        ub := new.swiper_id;
      end if;

      insert into public.matches (user_a, user_b)
      values (ua, ub)
      on conflict (user_a, user_b) do nothing;
    end if;
  end if;
  return new;
end;
$$;

create trigger on_swipe_insert
after insert on public.swipes
for each row execute function public.handle_swipe();
