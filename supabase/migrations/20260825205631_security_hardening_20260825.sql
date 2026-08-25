-- Security hardening identified by the August 2026 production audit.
-- Keep trigger-only privileged functions out of the Data API, pin function
-- search paths, and explicitly deny direct client access to feedback data.

-- handle_new_user is invoked only by the auth.users trigger. It must not be
-- callable through PostgREST/RPC by anonymous or signed-in application users.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- set_updated_at does not need a caller-controlled search path.
alter function public.set_updated_at() set search_path = '';

-- User-testing feedback is written/read only through server-side service-role
-- code. RLS already denies rows because no policies exist; revoke table grants
-- as defence in depth so it is not exposed directly to anon/authenticated roles.
revoke all on table public.user_testing_feedback from anon, authenticated;
