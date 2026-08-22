-- handle_swipe is a SECURITY DEFINER trigger function, not a public RPC.
-- Trigger execution remains available to swipe inserts; direct role execution
-- is revoked so it cannot be used as an exposed privileged entry point.
revoke all on function public.handle_swipe() from public;
revoke all on function public.handle_swipe() from anon;
revoke all on function public.handle_swipe() from authenticated;
