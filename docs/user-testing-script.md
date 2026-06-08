# Intentionally user testing script

Use this for lightweight MVP usability sessions with invited testers. Keep the session focused on whether people understand the core loop: profile discovery, matching, scheduling a Q&A, chatting after unlock, and sharing a date plan.

## Tester invite message

Hi [Name],

I am testing an early version of Intentionally, a video-first dating app for people who want better signal than endless messaging. Would you be open to a 20-minute remote usability session this week?

You will be asked to try a few core flows and talk through what feels clear, confusing, or awkward. This is not a test of you; it is a test of the product. The app is still early, so rough edges are expected.

If you are happy for the session to be recorded for internal product review, I will ask for consent at the start. No recording will be shared publicly.

Thanks,
[Founder name]

## Consent script for recording

Before we start, I would like to record the screen and audio so I can review where the product is confusing. The recording is only for internal product research and will not be shared publicly.

Please avoid entering real private information during the test. Use test details where possible. You can ask me to pause or stop recording at any time.

Do I have your consent to record this session?

If yes: Thanks. I am starting the recording now.

If no: No problem. We will continue without recording, and I will take notes instead.

## 10-minute task list

1. Land on the app and explain what you think Intentionally is for.
2. Log in or continue through the available test path.
3. Review the onboarding/profile setup screens and say what feels missing or unclear.
4. Open Discover and inspect one profile card.
5. Like one profile and pass on one profile.
6. When a match appears, explain what you expect to happen next.
7. Click the Q&A scheduling CTA and choose a slot if available.
8. Open the Q&A flow and describe what you expect the 10-minute call to feel like.
9. Continue to chat after unlock or use the demo chat path.
10. Click the date planning CTA and share a date plan.

## Questions to ask during testing

- What do you think the app is asking you to do at this step?
- What feels trustworthy or untrustworthy here?
- What would make you hesitate before continuing?
- What information do you expect to see on a profile before liking someone?
- Does the Q&A requirement feel valuable, awkward, or unclear?
- At what point would you expect ID verification to happen?
- What would make you confident enough to schedule a live Q&A?
- Does chat unlocking after Q&A make sense?
- Does sharing a date plan feel too early, too late, or about right?
- Was there any point where you felt lost or unsure what would happen next?

## Post-test feedback form questions

Use a short form after the session so feedback is comparable across testers.

1. How clear was the overall product concept?  
   Scale: 1 very unclear to 5 very clear

2. How comfortable would you feel using a mandatory 10-minute video Q&A before chat?  
   Scale: 1 very uncomfortable to 5 very comfortable

3. Which step felt most confusing?

4. Which step felt most valuable?

5. What information was missing from Discover profiles?

6. What would make you more likely to schedule a Q&A?

7. What would make you more likely to continue chatting after a Q&A?

8. Did anything feel unsafe, too personal, or too soon?

9. If this existed in London today, would you try it with real matches?  
   Options: yes, maybe, no

10. What is one thing you would change before inviting real users?

## What to check in PostHog

Review aggregate event counts only. Do not inspect or export private user data.

- `login_clicked`: Did testers understand how to start?
- `onboarding_started`: Did testers enter onboarding after login?
- `onboarding_completed`: Where did onboarding completion drop?
- `profile_liked` and `profile_passed`: Did testers interact with Discover?
- `match_created`: Did demo or real matching produce the expected next step?
- `schedule_clicked`: Did testers move from match to scheduling?
- `qa_started`: Did testers reach the Q&A entry point?
- `qa_finished`: Did testers understand completion and next step?
- `qa_continue_clicked`: Did testers opt to keep talking?
- `qa_pass_privately_clicked`: Did testers understand private pass?
- `chat_message_sent`: Did testers try chat after unlock?
- `date_plan_shared`: Did testers share a selected date plan?

Useful checks:

- Compare Login -> Onboarding -> Like -> Match -> Schedule conversion.
- Compare Q&A started -> Q&A finished.
- Compare Q&A finished -> Chat message sent.
- Compare Chat message sent -> Date plan shared.
- Note the biggest drop-off stage for follow-up interviews.

## What to check in Microsoft Clarity

Use Clarity for session replay and friction review only. Do not use it to collect or review sensitive text inputs, names, messages, phone numbers, Q&A answers, or private content.

Review:

- First 60 seconds: do testers understand the product and next action?
- Onboarding screens: rage clicks, dead clicks, repeated backtracking, or hesitation.
- Discover: whether testers inspect profile content before Like or Pass.
- Match modal: whether the scheduling CTA is noticed.
- Scheduling/Q&A entry: whether users pause, scroll, or abandon.
- Chat/date planning: whether the date planning CTA is visible and understandable.
- Mobile viewport sessions: any clipped buttons, hidden CTAs, or awkward scrolling.

Prioritise recordings where PostHog shows drop-off at the same journey stage. Use replay notes to explain why the drop-off happened, not just where it happened.
