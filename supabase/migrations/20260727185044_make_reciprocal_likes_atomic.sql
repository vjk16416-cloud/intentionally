-- Reciprocal likes can arrive in separate concurrent transactions. Lock the
-- canonical pair before reading the other swipe so the second transaction sees
-- the first committed like and creates exactly one pending match.
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
    if new.swiper_id < new.swipee_id then
      ua := new.swiper_id;
      ub := new.swipee_id;
    else
      ua := new.swipee_id;
      ub := new.swiper_id;
    end if;

    perform pg_advisory_xact_lock(
      hashtextextended(ua::text || ':' || ub::text, 0)
    );

    if exists (
      select 1 from public.swipes
      where swiper_id = new.swipee_id
        and swipee_id = new.swiper_id
        and direction = 'like'
    ) then
      insert into public.matches (user_a, user_b)
      values (ua, ub)
      on conflict (user_a, user_b) do nothing;
    end if;
  end if;
  return new;
end;
$$;
