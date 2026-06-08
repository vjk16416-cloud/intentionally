# Button Audit

Date: 8 June 2026

Scope: static audit of visible buttons and links across the current Intentionally web app. No code changes were made as part of this audit.

Status key:
- Working: the control performs a useful client action, server action, or route navigation now.
- Needs fix: the control is visible but dead, misleading, or routes to a weak placeholder.
- Future backend: the control has a visible interaction now, but the real product behaviour still needs backend/service integration.
- Disabled: the control is intentionally disabled until required input/state is present.

## Next Fix Checklist

- [ ] Fix `/date-plan/demo-demo-match` `Share this plan` visual-only buttons.
- [ ] Fix `/qa/demo-demo-match` safety shield button.
- [ ] Fix `/qa/demo-demo-match` microphone button.
- [ ] Fix `/qa/demo-demo-match` outcome `Continue` and `Pass privately` demo behaviour.
- [ ] Fix `/onboarding/neighbourhood` `Choose from list for now`.
- [ ] Fix `/schedule/demo-demo-match` demo slot routing issue.

## Summary

High priority fixes:
- `/date-plan/demo-demo-match`: each `Share this plan` button is dead. Add a local confirmation/bottom sheet now, then wire to real date proposal backend later.
- `/qa/demo-demo-match` and real `/qa/[sessionId]`: microphone and safety controls are visual-only. They should open local UI states or be disabled until the live Daily integration/safety flow is ready.
- `/onboarding/neighbourhood`: `Choose from list for now` is visual-only and should either focus/scroll the existing list or be removed.

Medium priority fixes:
- `/discover`: `View all` in the Q&A queue navigates to a single demo Q&A rather than a queue/all view. Route to the most useful current destination or open a simple queue sheet.
- `/discover`: the running-late and reminder notices are local-only. Acceptable for MVP demo, but need backend reminders/reschedule logic before real users.
- `/qa/demo-demo-match`: `Skip` behaves exactly like `Next`. That is acceptable for a demo but may read as misleading.

Low priority fixes:
- `/onboarding/phone`: `Skip for now` uses `window.location.href` instead of a Next link/router transition. It works, but should be made consistent.
- Bottom navigation: `Profile` routes to `/onboarding/profile`, which is an edit step rather than a profile/settings page. Works, but the destination is semantically rough.

## Global / Shared

| Page/route | Button/link label | Current behaviour | Status | Recommended action | Priority |
|---|---|---|---|---|---|
| App header | `Intentionally` | Navigates to `/discover`. | Working | Keep. | Low |
| App header | `Verify` | Navigates to `/verify` when user is not ID verified. | Working | Keep until a fuller account/settings area exists. | Low |
| App header | `Sign out` | Submits the sign-out server action. | Working | Keep. | Low |
| Public `/` | `Get started` | Navigates to `/login`. | Working | Keep. | Low |

## `/login`

| Page/route | Button/link label | Current behaviour | Status | Recommended action | Priority |
|---|---|---|---|---|---|
| `/login` | `Email` | Switches login form to email mode. | Working | Keep. | Low |
| `/login` | `Phone` | Switches login form to phone mode. | Working | Keep. | Low |
| `/login` | `Send secure sign-in link` | Submits OTP/magic-link request through auth action. Copy says secure link even though product brief says OTP-only. | Needs fix | Align copy/behaviour with OTP-only email flow before beta. | Medium |
| `/login` | `Send SMS code` | Submits phone OTP request. | Working | Keep. | Low |
| `/login` | `Use a different email` | Returns to the request form. | Working | Keep. | Low |
| `/login` | `Change number` | Returns to phone request stage. | Working | Keep. | Low |
| `/login` | `Verify` | Submits phone OTP verification. | Working | Keep. | Low |

## Onboarding

| Page/route | Button/link label | Current behaviour | Status | Recommended action | Priority |
|---|---|---|---|---|---|
| All onboarding data steps | `Continue` | Submits the current step action via `StepNav`. | Working | Keep. | Low |
| All onboarding edit steps | `Cancel` | Navigates back to `/onboarding/review` when editing with `?return=review`. | Working | Keep. | Low |
| Onboarding steps after first | `Back` | Navigates to the previous onboarding step. | Working | Keep. | Low |
| `/onboarding/profile` | `Continue` | Saves display name and DOB. | Working | Keep. | Low |
| `/onboarding/identity` | Gender/seeking option cards | Native radio/checkbox labels update form state. | Working | Keep. | Low |
| `/onboarding/photos` | `+ Add` | Opens file picker and uploads selected photo to Supabase Storage. | Working | Keep. | Low |
| `/onboarding/photos` | `Remove` | Deletes selected photo from Supabase Storage and local list. | Working | Keep. | Low |
| `/onboarding/photos` | `Continue` | Disabled until 2-6 photos are present and upload is idle. | Disabled | Keep. | Low |
| `/onboarding/intention` | Intention option cards | Native radio labels update form state. | Working | Keep. | Low |
| `/onboarding/prompt` | `Continue` | Saves selected prompt and answer. | Working | Keep. | Low |
| `/onboarding/neighbourhood` | `Choose from list for now` | No click handler; visual-only. | Needs fix | Make it focus/scroll the city/neighbourhood selectors, or remove it. | High |
| `/onboarding/neighbourhood` | Distance slider | Updates distance UI/local form value. | Working | Keep, but note distance is not currently part of the locked discover filter. | Low |
| `/onboarding/neighbourhood` | Distance chips (`Local`, `Nearby`, `Flexible`, `Wider`) | Update distance UI/local form value. | Working | Keep or demote if distance remains non-functional in matching. | Low |
| `/onboarding/availability` | `Clear` | Clears selected availability. | Working | Keep. | Low |
| `/onboarding/availability` | Quick picks | Add predefined availability blocks. | Working | Keep. | Low |
| `/onboarding/availability` | Day chips | Switch active day. | Working | Keep. | Low |
| `/onboarding/availability` | Time block buttons | Toggle selected availability blocks. | Working | Keep. | Low |
| `/onboarding/availability` | `Continue` | Disabled until minimum availability is met. | Disabled | Keep. | Low |
| `/onboarding/trusted-contact` | `Continue` | Saves trusted contact details. | Working | Keep. | Low |
| `/onboarding/phone` | `Send code` | Requests phone-change OTP; disabled while pending or if number is empty. | Working | Keep. | Low |
| `/onboarding/phone` | `Skip for now` | Imperatively navigates to `/onboarding/review`. | Working | Prefer a `Link` or router navigation for consistency. | Low |
| `/onboarding/phone` | `Change number` | Returns to phone request stage. | Working | Keep. | Low |
| `/onboarding/phone` | `Verify` | Submits phone OTP verification. | Working | Keep. | Low |
| `/onboarding/review` | `Edit` links | Navigate to each onboarding section with `?return=review`. | Working | Keep. | Low |
| `/onboarding/review` | `Enter Intentionally` | Navigates to `/onboarding/done`. | Working | Keep. | Low |
| `/onboarding/done` | `Start browsing` | Navigates to `/discover`. | Working | Keep. | Low |

## `/discover`

| Page/route | Button/link label | Current behaviour | Status | Recommended action | Priority |
|---|---|---|---|---|---|
| `/discover` | `Pass` | Calls `passProfile`; in demo mode advances the deck locally. Disabled while pending. | Working | Keep. | Low |
| `/discover` | `Like` | Calls `likeProfile`; in demo mode opens match modal. Disabled while pending or daily like limit reached. | Working | Keep. | Low |
| `/discover` | `Schedule` on new match cards | Opens local match modal with selected demo match card. | Working | Keep. | Low |
| `/discover` match modal | `Schedule your Q&A` | Navigates to `/schedule/{matchId}`. | Working | Keep. | Low |
| `/discover` match modal | `Continue browsing` | Dismisses modal and advances deck. | Working | Keep. | Low |
| Pending match banner | `View` | Opens match modal for first pending match. | Working | Keep. | Low |
| Upcoming Q&A queue | `View all` | Navigates to `/qa/demo-demo-match`, not an actual queue/list. | Needs fix | Route to a queue screen if one exists; otherwise open a simple local queue bottom sheet. | Medium |
| Michael upcoming Q&A | `Reschedule` | Navigates to `/schedule/demo-demo-match`. | Working | Keep. | Low |
| Michael upcoming Q&A | `Join Q&A` | Navigates to `/qa/demo-demo-match`. | Working | Keep. | Low |
| Michael upcoming Q&A | `Running late?` | Opens bottom sheet. | Working | Keep. | Low |
| Running-late sheet | `10 minutes` | Closes sheet and shows local status notice. | Future backend | Later send/update lateness state for both users. | Medium |
| Running-late sheet | `15 minutes` | Closes sheet and shows local status notice. | Future backend | Later send/update lateness state for both users. | Medium |
| Running-late sheet | `30 minutes` | Closes sheet and shows local status notice. | Future backend | Later send/update lateness state for both users. | Medium |
| Running-late sheet | `Reschedule` | Navigates to `/schedule/demo-demo-match`. | Working | Keep. | Low |
| Running-late sheet | `Cancel` | Closes bottom sheet. | Working | Keep. | Low |
| Sophia upcoming Q&A | `Reschedule` | Shows local status notice explaining future slot picker. | Future backend | Wire to real session-specific scheduling/reschedule flow later. | Medium |
| Sophia upcoming Q&A | `Remind me` | Shows local status notice explaining reminders. | Future backend | Wire to real reminder preference/action later, or disable if reminders are automatic only. | Medium |
| Bottom navigation | `Discover` | Navigates to `/discover`. | Working | Keep. | Low |
| Bottom navigation | `Q&A` | Navigates to `/qa/demo-demo-match`. | Working | Keep while demo-first; later route to real upcoming Q&A/session list. | Medium |
| Bottom navigation | `Messages` | Navigates to `/chat/demo-demo-match`. | Working | Keep while demo-first; later route to real conversations list. | Medium |
| Bottom navigation | `Profile` | Navigates to `/onboarding/profile`. | Working | Later replace with profile/settings route. | Low |

## `/schedule/demo-demo-match` and `/schedule/[matchId]`

| Page/route | Button/link label | Current behaviour | Status | Recommended action | Priority |
|---|---|---|---|---|---|
| `/schedule/demo-demo-match` | Demo slot cards (`Tonight`, `Tomorrow`, `Sunday`) | Navigate to `/qa/demo-demo-demo-match` because the demo page prefixes `demo-` to an already demo-prefixed id. | Needs fix | Normalize demo session URL construction so demo schedule links go to the intended Q&A route. | High |
| `/schedule/demo-demo-match` | `Back to Discover` | Navigates to `/discover`. | Working | Keep. | Low |
| `/schedule/[matchId]` confirmed state | `Go to the call` | Navigates to `/qa/{session.id}`. | Working | Keep. | Low |
| `/schedule/[matchId]` no mutual slots | `Edit your availability` | Navigates to `/onboarding/availability?return=/schedule/{matchId}`. | Working | Keep. | Low |
| `/schedule/[matchId]` proposal slots | Slot buttons | Submit `proposeSlot` server action; disabled while pending. | Working | Keep. | Low |
| `/schedule/[matchId]` proposal received | `Confirm this time` | Submits `confirmSlot`, creates room/questions/email best-effort. Disabled while pending. | Working | Keep. | Low |

## `/qa/demo-demo-match` and `/qa/[sessionId]`

| Page/route | Button/link label | Current behaviour | Status | Recommended action | Priority |
|---|---|---|---|---|---|
| `/qa/demo-demo-match` intro | `Start conversation` | Navigates to `?started=true`. | Working | Keep. | Low |
| `/qa/demo-demo-match` room | Exit `×` | Navigates to `/discover`. | Working | Keep. | Low |
| `/qa/demo-demo-match` room | Safety shield | No click handler; visual-only. | Needs fix | Open a simple safety/options sheet or mark disabled until safety flow exists. | High |
| `/qa/demo-demo-match` room | `Skip question` | Navigates to next question/finished state. | Working | Keep if skip remains in demo only; MVP spec says no skip/swap in real Q&A. | Medium |
| `/qa/demo-demo-match` room | Microphone icon | No click handler; visual-only. | Needs fix | Toggle local muted state in demo or mark disabled until Daily controls are wired. | High |
| `/qa/demo-demo-match` room | `Next question` / `Finish` | Navigates through demo question states. | Working | Keep. | Low |
| `/qa/demo-demo-match` outcome | `Continue` | Submits `saveQaOutcome` on the server-rendered route; demo action path should be verified because demo sessions may not have DB rows. | Needs fix | For demo sessions, keep local query-param behaviour or route directly to demo chat; for real sessions, keep server action. | High |
| `/qa/demo-demo-match` outcome | `Pass privately` | Submits `saveQaOutcome`; same demo caveat as Continue. | Needs fix | For demo sessions, use local state/query params or a demo-safe action. | High |
| `/qa/[sessionId]` real room | Daily iframe | Uses Daily room URL when present. | Working | Keep. | Low |
| `/qa/[sessionId]/waiting` | `Back to Discover` | Navigates to `/discover`. | Working | Keep. | Low |

## `/chat/demo-demo-match` and `/chat/[chatId]`

| Page/route | Button/link label | Current behaviour | Status | Recommended action | Priority |
|---|---|---|---|---|---|
| `/chat/demo-demo-match` | `Send` | Adds non-empty message to local demo state; empty draft is ignored. | Working | Keep for demo. | Low |
| `/chat/demo-demo-match` | `Back to Discover` | Navigates to `/discover`. | Working | Keep. | Low |
| `/chat/[chatId]` | `Send` | Submits `sendMessage` server action. | Working | Keep. | Low |
| `/chat/[chatId]` | `Back to Discover` | Navigates to `/discover`. | Working | Keep. | Low |

## `/date-plan/demo-demo-match`

| Page/route | Button/link label | Current behaviour | Status | Recommended action | Priority |
|---|---|---|---|---|---|
| `/date-plan/demo-demo-match` | `Share this plan` | No click handler; visual-only on all date option cards. | Needs fix | Open a local confirmation/bottom sheet now; later wire to date proposal backend. | High |
| `/date-plan/demo-demo-match` | `Back to Chat` | Navigates to `/chat/demo-demo-match`. | Working | Keep. | Low |

## `/verify` and `/verify/return`

| Page/route | Button/link label | Current behaviour | Status | Recommended action | Priority |
|---|---|---|---|---|---|
| `/verify` unverified | `Start verification` | Submits server action to create Stripe Identity session and redirect. Disabled while pending. | Working | Keep. | Low |
| `/verify` verified | `Continue` | Navigates to sanitized return path or `/discover`. | Working | Keep. | Low |
| `/verify/return` verified | `Continue` | Navigates to sanitized return path or `/discover`. | Working | Keep. | Low |
| `/verify/return` processing | `Refresh` | Navigates to the same return-check route. | Working | Keep. | Low |
| `/verify/return` processing | `Start over` | Navigates back to `/verify` with return path. | Working | Keep. | Low |
