create table if not exists public.user_testing_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tester_name text check (tester_name is null or char_length(tester_name) <= 200),
  tester_email text check (tester_email is null or char_length(tester_email) <= 200),
  device text not null check (device in ('Desktop', 'iPhone', 'Android', 'Other')),
  browser text not null check (browser in ('Chrome', 'Safari', 'Edge', 'Firefox', 'Other')),
  rating integer not null check (rating between 1 and 10),
  confusion text not null check (char_length(confusion) between 1 and 1500),
  liked text not null check (char_length(liked) between 1 and 1500),
  bugs text not null check (char_length(bugs) between 1 and 1500),
  safety_feedback text not null check (char_length(safety_feedback) between 1 and 1500),
  qa_feedback text not null check (char_length(qa_feedback) between 1 and 1500),
  improvements text not null check (char_length(improvements) between 1 and 1500),
  would_use text not null check (would_use in ('Yes', 'Maybe', 'No')),
  permission_given boolean not null default false,
  lookback_session_url text check (
    lookback_session_url is null
    or lookback_session_url ~* '^https?://'
  ),
  video_recording_notes text check (
    video_recording_notes is null
    or char_length(video_recording_notes) <= 5000
  ),
  audio_recording_notes text check (
    audio_recording_notes is null
    or char_length(audio_recording_notes) <= 5000
  ),
  transcript_notes text check (
    transcript_notes is null
    or char_length(transcript_notes) <= 5000
  ),
  key_quotes text check (
    key_quotes is null
    or char_length(key_quotes) <= 5000
  ),
  hesitation_points text check (
    hesitation_points is null
    or char_length(hesitation_points) <= 5000
  ),
  observed_bugs text check (
    observed_bugs is null
    or char_length(observed_bugs) <= 5000
  ),
  observed_positive_reactions text check (
    observed_positive_reactions is null
    or char_length(observed_positive_reactions) <= 5000
  ),
  observed_safety_concerns text check (
    observed_safety_concerns is null
    or char_length(observed_safety_concerns) <= 5000
  ),
  observed_qa_confusion text check (
    observed_qa_confusion is null
    or char_length(observed_qa_confusion) <= 5000
  ),
  recommended_follow_up_action text check (
    recommended_follow_up_action is null
    or char_length(recommended_follow_up_action) <= 5000
  ),
  priority text not null default 'Low' check (priority in ('High', 'Medium', 'Low')),
  tags text[] not null default '{}'::text[] check (
    tags <@ array[
      'bug',
      'UX confusion',
      'safety/trust concern',
      'positive reaction',
      'feature request',
      'Q&A issue',
      'onboarding issue',
      'discover issue',
      'chat issue',
      'date planning issue',
      'video/mic insight'
    ]::text[]
  )
);

alter table public.user_testing_feedback
  add column if not exists lookback_session_url text,
  add column if not exists video_recording_notes text,
  add column if not exists audio_recording_notes text,
  add column if not exists transcript_notes text,
  add column if not exists key_quotes text,
  add column if not exists hesitation_points text,
  add column if not exists observed_bugs text,
  add column if not exists observed_positive_reactions text,
  add column if not exists observed_safety_concerns text,
  add column if not exists observed_qa_confusion text,
  add column if not exists recommended_follow_up_action text,
  add column if not exists priority text not null default 'Low',
  add column if not exists tags text[] not null default '{}'::text[];

alter table public.user_testing_feedback enable row level security;

create index if not exists user_testing_feedback_created_at_idx
  on public.user_testing_feedback (created_at desc);

create index if not exists user_testing_feedback_priority_idx
  on public.user_testing_feedback (priority);

create index if not exists user_testing_feedback_tags_idx
  on public.user_testing_feedback using gin (tags);
