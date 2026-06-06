-- Real chats unlocked after both Q&A participants choose to continue.

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index chats_match_id_idx on public.chats (match_id);
create index messages_chat_id_created_at_idx on public.messages (chat_id, created_at);
create index messages_sender_id_idx on public.messages (sender_id);

alter table public.chats enable row level security;
alter table public.messages enable row level security;

create policy "matched users can read chats"
on public.chats for select
to authenticated
using (
  exists (
    select 1
    from public.matches m
    where m.id = chats.match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);

create policy "matched users can read messages"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.chats c
    join public.matches m on m.id = c.match_id
    where c.id = messages.chat_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);

create policy "matched users can send messages"
on public.messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.chats c
    join public.matches m on m.id = c.match_id
    where c.id = messages.chat_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);
