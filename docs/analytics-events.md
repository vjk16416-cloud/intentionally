# Analytics Events

Intentionally uses PostHog for explicit button and action tracking only.

Event names are centralized in `lib/analytics/events.ts` so they can be renamed
from one place. Do not send phone numbers, emails, names, messages,
transcripts, private answers, or other user-entered private content with these
events.

| Event | Meaning |
| --- | --- |
| `login_clicked` | User clicks the login OTP request button. |
| `onboarding_started` | User submits the first onboarding basics step. |
| `onboarding_completed` | User clicks the final onboarding CTA to start browsing. |
| `profile_liked` | User clicks Like on a discover profile. |
| `profile_passed` | User clicks Pass on a discover profile. |
| `match_created` | A like action results in a match being shown to the user. |
| `qa_invite_opened` | A matched user opens the Q&A invite path from the match state. |
| `qa_invite_confirmation_opened` | User reviews a selected shared time in the Q&A invite confirmation sheet. |
| `qa_invite_submitted` | User confirms that the selected Q&A invite should be sent. |
| `qa_invite_failed` | The invite action returns an error. Only a coarse error code is tracked, never private content. |
| `qa_invite_duplicate` | An invite attempt resolves to an already-confirmed or duplicate state instead of creating another session. |
| `schedule_clicked` | User clicks a scheduling CTA, proposes a slot, or confirms a proposed slot. |
| `qa_started` | User clicks to start the guided Q&A. |
| `qa_finished` | User clicks the final Q&A action that moves them to the private decision screen. |
| `qa_continue_clicked` | User clicks Continue on the private Q&A decision screen. |
| `qa_pass_privately_clicked` | User clicks Pass privately on the private Q&A decision screen. |
| `chat_message_sent` | User sends a chat message. The message body is not tracked. |
| `date_plan_shared` | User clicks to share a date plan. |
