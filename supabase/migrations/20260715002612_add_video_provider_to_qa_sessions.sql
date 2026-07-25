-- Provider-neutral video fields for Daily rollback and LiveKit rollout.
-- Existing Daily columns stay in place so already-confirmed sessions remain
-- joinable during the provider transition.

alter table public.qa_sessions
  add column video_provider text not null default 'daily',
  add column video_room_name text,
  add constraint qa_sessions_video_provider_check check (
    video_provider in ('daily', 'livekit')
  );

update public.qa_sessions
set
  video_provider = 'daily',
  video_room_name = daily_room_name;
