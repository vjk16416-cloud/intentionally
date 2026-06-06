-- Private continue/pass decisions after a guided Q&A.
-- One outcome per user per Q&A session.

create table public.qa_outcomes (
  id uuid primary key default gen_random_uuid(),
  qa_session_id uuid not null references public.qa_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  decision text not null check (decision in ('continue', 'pass')),
  created_at timestamptz not null default now(),
  unique (qa_session_id, user_id)
);

create index qa_outcomes_session_id_idx on public.qa_outcomes (qa_session_id);
create index qa_outcomes_user_id_idx on public.qa_outcomes (user_id);

alter table public.qa_outcomes enable row level security;

create policy "participants can read their own q&a outcome"
on public.qa_outcomes for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.qa_sessions qs
    join public.matches m on m.id = qs.match_id
    where qs.id = qa_outcomes.qa_session_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);

create policy "participants can insert their own q&a outcome"
on public.qa_outcomes for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.qa_sessions qs
    join public.matches m on m.id = qs.match_id
    where qs.id = qa_outcomes.qa_session_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);
