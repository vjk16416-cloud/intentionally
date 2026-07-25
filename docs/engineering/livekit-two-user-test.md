# LiveKit two-user Vibe Check test

This checklist must be completed with real non-production LiveKit credentials
and two independent authenticated Intentionally users before production changes
from `VIDEO_PROVIDER=daily` to `VIDEO_PROVIDER=livekit`.

## Preparation

1. Apply `20260715002612_add_video_provider_to_qa_sessions.sql` to the test
   Supabase project. Do not apply it to production as part of this test.
2. Configure the test deployment with `VIDEO_PROVIDER=livekit`, a `wss://`
   `LIVEKIT_URL`, and test-only `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`.
3. Keep the secret server-only. Confirm it does not appear in browser source,
   network request payloads, logs, analytics, or Supabase rows.
4. Create two verified test users who have mutual interest, then schedule and
   confirm one Vibe Check through the existing product flow.
5. Confirm both scheduled and reminder emails link to
   `/qa/[sessionId]` on the Intentionally origin, with no token or provider URL.

Record the browser, device, viewport, session ID, tester initials, and result
for every run. Never record credentials, participant tokens, conversation
content, or private Continue/Pass choices.

## Core two-user run

1. User A opens the scheduled Q&A on device or browser one.
2. User B opens the same scheduled Q&A on a second independent device or
   browser profile.
3. Both select **Prepare to join**, read the preparation screen, and select
   **Join Vibe Check**.
4. Both grant camera and microphone access.
5. Confirm each person sees their own camera in **You** and the other person in
   **Your match**.
6. Confirm both people hear each other and neither hears their own voice played
   back. If autoplay is blocked, confirm **Tap to hear your match** restores
   audio.
7. Advance every guided question on both clients together. Confirm the current
   answerer stays clear, the listener is softened, and Soft Mode softens both
   genuine video tracks.
8. Confirm **Pause for 30 seconds**, Soft Mode, end, and the existing safety
   options remain accessible. Confirm the pause does not reveal a private
   reason to the other user.
9. Complete the questions on both clients and confirm each reaches the private
   Continue/Pass screen.
10. Choose Continue as both users. Confirm chat unlocks only after the second
    Continue and no choice is exposed before mutual Continue.

Repeat the final decision portion with a new session where one user passes.
Confirm no chat is created and the other person is not told who passed.

## Browser and layout matrix

Run the core path in:

- Current Safari with one participant in current Chrome.
- Current Chrome with both participants in separate browser profiles/devices.
- A 390px mobile viewport.
- A 768px tablet viewport.
- A 1440px desktop viewport.

At each width confirm the question remains the focal point, both participant
tiles have readable labels and states, safety controls are reachable, no action
is hidden under navigation, and the page has no unintended horizontal scroll.

## Recovery and permission cases

- **Late join:** User A joins first. Confirm the match tile says the other person
  has not joined, then changes to connected video when User B arrives.
- **Refresh:** Refresh one participant during the call. Confirm the old
  connection closes, a fresh token is requested, and the same authenticated
  identity reconnects without a duplicate participant tile.
- **Temporary network loss:** Interrupt one participant's network, restore it,
  and confirm both see a calm reconnecting state before video and audio recover.
- **Permanent loss:** Keep the network unavailable until reconnection fails.
  Confirm retry, return, and private end paths remain understandable.
- **Camera denied:** Deny camera but allow microphone. Confirm the local user is
  told how to restore camera access, the match never sees a blank black tile,
  and the working microphone is not hidden or left active behind a false global
  failure screen.
- **Microphone denied:** Allow camera but deny microphone. Confirm the local
  camera remains visible with a calm microphone message and retry action.
- **Unsupported media:** Test a browser without required media support and
  confirm the user sees supported-browser guidance and a return action.
- **One user leaves early:** End from one client. Confirm that client disconnects
  immediately, the other sees a disconnected state, and private outcome choices
  are still not exposed.
- **Expired window:** After the scheduled ten minutes plus five-minute grace
  period, confirm neither participant can obtain a fresh token.

## Rollback check

Switch the test environment back to `VIDEO_PROVIDER=daily`, schedule a new Vibe
Check, and confirm it uses its stored Daily URL. Reopen an existing Daily
session after the global switch has changed in either direction and confirm its
stored provider still selects Daily.

Production must remain on Daily until every core, browser, recovery, privacy,
and rollback check above has passed with evidence from two real participants.
