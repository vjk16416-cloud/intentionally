revoke insert, update, delete on table public.chats from authenticated;
revoke delete on table public.date_plan_preferences from authenticated;
revoke insert, update, delete on table public.matches from authenticated;
revoke update, delete on table public.messages from authenticated;
revoke insert, delete on table public.profiles from authenticated;
revoke update, delete on table public.qa_outcomes from authenticated;
revoke insert, update, delete on table public.qa_sessions from authenticated;
revoke update, delete on table public.swipes from authenticated;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
