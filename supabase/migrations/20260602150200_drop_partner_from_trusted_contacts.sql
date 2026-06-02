-- Drop 'partner' from the relationship CHECK on trusted_contacts.
--
-- The original constraint was column-inline so Postgres named it
-- automatically (conventionally trusted_contacts_relationship_check).
-- Rather than hard-code that name, we look up the CHECK constraint by
-- finding the one on public.trusted_contacts whose definition still
-- references 'partner', drop it, and re-add an explicitly-named
-- replacement. Safer across envs and obvious about its intent.

do $$
declare
  constraint_name text;
begin
  select c.conname into constraint_name
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'trusted_contacts'
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) like '%partner%';

  if constraint_name is null then
    raise exception
      'Could not find a CHECK constraint on public.trusted_contacts referencing partner.';
  end if;

  execute format(
    'alter table public.trusted_contacts drop constraint %I',
    constraint_name
  );
end $$;

alter table public.trusted_contacts
  add constraint trusted_contacts_relationship_check
  check (
    relationship is null
    or relationship in ('friend', 'family', 'other')
  );
