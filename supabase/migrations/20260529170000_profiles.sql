-- Profiles table. Extends auth.users 1:1.
--
-- A row is created automatically by the handle_new_user trigger on
-- auth.users insert (see §5 of AGENTS.md). At that point the user has
-- only verified their phone, so columns populated during onboarding are
-- nullable until the user reaches the corresponding step. The
-- application layer (and a future "onboarding complete" check) is
-- responsible for enforcing that they're set before app routes unlock.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  date_of_birth date check (date_of_birth is null or date_of_birth <= (now() - interval '18 years')),
  gender text check (gender in ('woman', 'man', 'non-binary')),
  seeking text[] check (
    seeking is null
    or (
      array_length(seeking, 1) between 1 and 3
      and seeking <@ array['woman', 'man', 'non-binary']
    )
  ),
  intention text check (intention in ('long-term', 'short-term', 'figuring-it-out')),
  bio_prompt_key text,
  bio_answer text check (bio_answer is null or char_length(bio_answer) <= 200),
  photos text[] check (photos is null or array_length(photos, 1) between 2 and 6),
  neighbourhood text,
  id_verified boolean not null default false,
  id_verified_at timestamptz,
  paused boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_visible_idx
  on public.profiles (id)
  where id_verified = true and paused = false;

-- Updated-at trigger.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Create a profile row whenever a new auth.users row is inserted.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Row-level security: any authenticated user can see verified, unpaused
-- profiles; users can only read/update their own row otherwise.
alter table public.profiles enable row level security;

create policy "profiles are readable when verified and unpaused"
on public.profiles for select
to authenticated
using (id_verified = true and paused = false);

create policy "users can read their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
