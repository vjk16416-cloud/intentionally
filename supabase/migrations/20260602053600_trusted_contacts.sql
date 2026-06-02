-- Trusted contacts. One row per user (see §5 of AGENTS.md).
--
-- Required for onboarding completion: a user cannot reach /discover
-- without a trusted contact on file. The application layer enforces
-- this; the DB enforces only that user_id is unique so each user has
-- at most one trusted contact in MVP.

create table public.trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null,
  phone_e164 text not null check (phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  relationship text check (
    relationship is null
    or relationship in ('friend', 'family', 'partner', 'other')
  ),
  created_at timestamptz not null default now()
);

alter table public.trusted_contacts enable row level security;

create policy "users can read their own trusted contact"
on public.trusted_contacts for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert their own trusted contact"
on public.trusted_contacts for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update their own trusted contact"
on public.trusted_contacts for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete their own trusted contact"
on public.trusted_contacts for delete
to authenticated
using (auth.uid() = user_id);
