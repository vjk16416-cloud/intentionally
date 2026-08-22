-- Mutual Continue is the only path that can unlock chat and date planning.
-- Keep the chat row and match state in one transaction so concurrent waiting
-- pages receive the same unlocked chat instead of a unique-key dead end.

create or replace function public.unlock_chat_for_match(p_match_id uuid)
returns table (chat_id uuid, created boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  match_status text;
  match_expires_at timestamptz;
  match_user_a uuid;
  match_user_b uuid;
  session_id uuid;
  outcome_count integer;
  participant_continue_count integer;
  resolved_chat_id uuid;
  did_create boolean := false;
begin
  select status, expires_at, user_a, user_b
  into match_status, match_expires_at, match_user_a, match_user_b
  from public.matches
  where id = p_match_id
  for update;

  if not found
    or match_status not in ('qa_scheduled', 'qa_complete', 'unlocked') then
    raise exception 'Match is not available for chat unlock';
  end if;

  -- An already unlocked match keeps its existing chat even after the original
  -- invitation expiry. The expiry applies only to a not-yet-unlocked match.
  if match_status = 'unlocked' then
    select id
    into resolved_chat_id
    from public.chats
    where match_id = p_match_id;

    if found then
      return query select resolved_chat_id, false;
      return;
    end if;
  elsif match_expires_at <= now() then
    raise exception 'Match is not available for chat unlock';
  end if;

  select id
  into session_id
  from public.qa_sessions
  where match_id = p_match_id
    and status = 'completed';

  if not found then
    raise exception 'Completed Q&A session is required for chat unlock';
  end if;

  select
    count(*)::integer,
    count(*) filter (
      where decision = 'continue'
        and user_id in (match_user_a, match_user_b)
    )::integer
  into outcome_count, participant_continue_count
  from public.qa_outcomes
  where qa_session_id = session_id;

  if outcome_count <> 2 or participant_continue_count <> 2 then
    raise exception 'Mutual Continue is required for chat unlock';
  end if;

  insert into public.chats (match_id)
  values (p_match_id)
  on conflict (match_id) do nothing
  returning id into resolved_chat_id;

  if resolved_chat_id is not null then
    did_create := true;
  else
    select id
    into resolved_chat_id
    from public.chats
    where match_id = p_match_id;
  end if;

  update public.matches
  set status = 'unlocked', closed_reason = null
  where id = p_match_id
    and status <> 'unlocked';

  return query select resolved_chat_id, did_create;
end;
$$;

revoke all on function public.unlock_chat_for_match(uuid) from public;
revoke all on function public.unlock_chat_for_match(uuid) from anon;
revoke all on function public.unlock_chat_for_match(uuid) from authenticated;
grant execute on function public.unlock_chat_for_match(uuid) to service_role;

-- Preserve only historical chats whose completed session and outcomes prove the
-- same mutual-Continue invariant. Do not delete records that fail this review;
-- they remain inaccessible instead of being silently treated as legitimate.
update public.matches m
set status = 'unlocked', closed_reason = null
where m.status in ('qa_scheduled', 'qa_complete', 'unlocked')
  and exists (
    select 1
    from public.chats c
    where c.match_id = m.id
  )
  and exists (
    select 1
    from public.qa_sessions qs
    where qs.match_id = m.id
      and qs.status = 'completed'
      and 2 = (
        select count(*)
        from public.qa_outcomes qo
        where qo.qa_session_id = qs.id
      )
      and 2 = (
        select count(*)
        from public.qa_outcomes qo
        where qo.qa_session_id = qs.id
          and qo.decision = 'continue'
          and qo.user_id in (m.user_a, m.user_b)
      )
  );

drop policy if exists "matched users can read chats" on public.chats;
drop policy if exists "participants can read unlocked chats" on public.chats;

create policy "participants can read unlocked chats"
on public.chats for select
to authenticated
using (
  exists (
    select 1
    from public.matches m
    where m.id = chats.match_id
      and m.status = 'unlocked'
      and (m.user_a = (select auth.uid()) or m.user_b = (select auth.uid()))
  )
);

drop policy if exists "matched users can read messages" on public.messages;
drop policy if exists "participants can read messages for unlocked chats" on public.messages;

create policy "participants can read messages for unlocked chats"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.chats c
    join public.matches m on m.id = c.match_id
    where c.id = messages.chat_id
      and m.status = 'unlocked'
      and (m.user_a = (select auth.uid()) or m.user_b = (select auth.uid()))
  )
);

drop policy if exists "matched users can send messages" on public.messages;
drop policy if exists "participants can send messages for unlocked chats" on public.messages;

create policy "participants can send messages for unlocked chats"
on public.messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.chats c
    join public.matches m on m.id = c.match_id
    where c.id = messages.chat_id
      and m.status = 'unlocked'
      and (m.user_a = (select auth.uid()) or m.user_b = (select auth.uid()))
  )
);

drop policy if exists "matched users can read date plan preferences" on public.date_plan_preferences;
drop policy if exists "participants can read date plans for unlocked matches" on public.date_plan_preferences;

create policy "participants can read date plans for unlocked matches"
on public.date_plan_preferences for select
to authenticated
using (
  exists (
    select 1
    from public.matches m
    join public.chats c on c.match_id = m.id
    where m.id = date_plan_preferences.match_id
      and m.status = 'unlocked'
      and (m.user_a = (select auth.uid()) or m.user_b = (select auth.uid()))
  )
);

drop policy if exists "matched users can insert own date plan preference" on public.date_plan_preferences;
drop policy if exists "participants can insert date plans for unlocked matches" on public.date_plan_preferences;

create policy "participants can insert date plans for unlocked matches"
on public.date_plan_preferences for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.matches m
    join public.chats c on c.match_id = m.id
    where m.id = date_plan_preferences.match_id
      and m.status = 'unlocked'
      and (m.user_a = (select auth.uid()) or m.user_b = (select auth.uid()))
  )
);

drop policy if exists "matched users can update own date plan preference" on public.date_plan_preferences;
drop policy if exists "participants can update their own date plans for unlocked match" on public.date_plan_preferences;
drop policy if exists "participants can update their own date plans for unlocked matches" on public.date_plan_preferences;

create policy "participants can update their own date plans for unlocked matches"
on public.date_plan_preferences for update
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.matches m
    join public.chats c on c.match_id = m.id
    where m.id = date_plan_preferences.match_id
      and m.status = 'unlocked'
      and (m.user_a = (select auth.uid()) or m.user_b = (select auth.uid()))
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.matches m
    join public.chats c on c.match_id = m.id
    where m.id = date_plan_preferences.match_id
      and m.status = 'unlocked'
      and (m.user_a = (select auth.uid()) or m.user_b = (select auth.uid()))
  )
);
