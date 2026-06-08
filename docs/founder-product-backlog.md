# Founder product backlog

This master backlog combines user testing improvements, the MVP roadmap, PostHog funnel findings, and Microsoft Clarity review themes.

Inputs:

- `docs/user-testing-improvements-v1.md`
- `docs/user-testing-feedback.md`
- `docs/button-audit.md`
- `docs/analytics-events.md`
- `docs/posthog-dashboard-plan.md`
- `docs/clarity-setup.md`
- MVP build sequence and acceptance criteria in `AGENTS.md`
- Current analytics readout: app health good, 27 active users, 82% onboarding completion, 69% Q&A completion, 58% chat activation, biggest bottleneck after first Q&A, highest opportunity improving Q&A completion by 10% to increase chats by about 18%.

## Current focus

Top 10 tasks before private beta:

1. Fix or verify trusted contact step appearing twice.
2. Improve SMS verification wording.
3. Explain trusted contact and SOS/safety model clearly.
4. Investigate black profile photo issue.
5. Check iPhone HEIC photo upload support.
6. Clarify Q&A blur behaviour before scheduling/joining.
7. Fix match notification spacing and copy.
8. Improve Q&A completion flow where users drop after first Q&A.
9. Replace unclear “Private profiles” copy.
10. Review hardcoded MVP/demo matches such as Michael and Sophia before real tester sessions.

## Master backlog

| ID | Feature/Issue | Category | Priority | Impact on user | Effort | Status | Release |
|---|---|---|---|---|---|---|---|
| B-001 | Fix or verify trusted contact step appearing twice | Bug | Critical | Removes duplicated safety-step friction and prevents users losing trust during onboarding. | M | Not started | Alpha |
| B-002 | Improve SMS verification wording | Copy | Critical | Helps users understand why phone verification is required and reduces login/onboarding hesitation. | S | Not started | Alpha |
| B-003 | Explain trusted contact and SOS clearly | Safety | Critical | Makes the mandatory safety step feel understandable instead of invasive. | S | Not started | Alpha |
| B-004 | Investigate black profile photo issue | Bug | Critical | Prevents profiles from looking broken or fake during Discover and onboarding review. | M | Not started | Alpha |
| B-005 | Check iPhone HEIC photo upload support | Bug | Critical | Ensures iPhone testers can upload normal camera-roll photos without failure. | M | Not started | Alpha |
| B-006 | Keep PostHog dashboard aggregate-only and server-only | Analytics | Critical | Protects API keys and avoids exposing private user data in admin analytics. | S | Done | Alpha |
| B-007 | Verify Clarity privacy masking before beta | Safety | Critical | Reduces risk of session replay capturing sensitive form, chat, Q&A, or safety-contact content. | S | Not started | Beta |
| B-008 | Complete two-account full-loop beta acceptance test | UX | Critical | Confirms signup, swipe, match, Q&A, chat, date planning, and phone reveal work end to end. | L | Not started | MVP |
| B-009 | Replace “Private profiles” copy | Copy | High | Prevents users misunderstanding who can see their profile or what privacy means. | S | Not started | Alpha |
| B-010 | Improve gender option wording and research competitor norms | Trust | High | Makes identity and preference setup feel respectful, familiar, and clear. | M | Not started | Alpha |
| B-011 | Improve “You and them” copy | Copy | High | Makes match-preference onboarding easier to understand. | S | Not started | Alpha |
| B-012 | Rewrite photo upload guidance | Copy | High | Helps users choose useful trust-building photos and reduces upload confusion. | S | Not started | Alpha |
| B-013 | Clarify Q&A blur behaviour | Trust | High | Reduces uncertainty around the live Q&A mechanic before users commit to a call. | S | Not started | Alpha |
| B-014 | Fix match notification spacing and copy | UX | High | Makes the next step after a match obvious and should improve schedule clicks. | S | Not started | Alpha |
| B-015 | Improve Q&A completion after first Q&A drop-off | Growth | High | Targets the current biggest funnel bottleneck and should increase chat activation. | M | Not started | Beta |
| B-016 | Rework availability quick-pick options | UX | High | Makes scheduling setup feel closer to real user routines. | M | Not started | Beta |
| B-017 | Add commitment step at Q&A booking | Growth | High | Increases psychological commitment and may improve attendance. | M | Pending | MVP |
| B-018 | Add ICS calendar attachment to Q&A scheduled email | UX | High | Makes booked Q&As feel real and easier to attend. | M | Pending | MVP |
| B-019 | Add 48-hour match expiry and reminder cron | Growth | High | Reduces stale matches and nudges users toward timely scheduling. | L | Pending | MVP |
| B-020 | Wire real reminder/reschedule backend for upcoming Q&As | UX | High | Makes running-late, reminder, and reschedule actions reliable for real users. | L | Not started | MVP |
| B-021 | Validate Q&A attendance with manually matched users | Product | High | Confirms the core product assumption before investing in more scheduling polish. | M | Not started | Beta |
| B-022 | Expand London neighbourhood and borough options | UX | Medium | Lets London users choose locations that match how they describe where they live. | M | Not started | Beta |
| B-023 | Rework distance options | UX | Medium | Avoids false precision and sets clearer expectations about local matching. | M | Not started | Beta |
| B-024 | Add or consider 2-3 profile prompts instead of one | Product | Medium | May improve profile confidence and like quality, but could increase onboarding friction. | M | Not started | Beta |
| B-025 | Review hardcoded MVP/demo matches like Michael/Sophia | UX | Medium | Prevents real testers from seeing fake-feeling demo content in core flows. | S | Not started | Alpha |
| B-026 | Fix Discover `View all` route for Q&A queue | Bug | Medium | Prevents navigation to a single demo Q&A when users expect a queue or list. | M | Not started | Beta |
| B-027 | Align login copy with OTP-only behaviour | Copy | Medium | Avoids confusion from “secure sign-in link” wording when the brief says OTP-only. | S | Not started | Alpha |
| B-028 | Route bottom-nav Q&A to real upcoming session/list | UX | Medium | Makes app navigation match real user state instead of demo session state. | M | Not started | Beta |
| B-029 | Decide whether Q&A skip remains demo-only | Product | Medium | Keeps the real Q&A aligned with MVP rules that do not allow question skip/swap. | S | Not started | Beta |
| B-030 | Continue monitoring date plan shared tracking | Analytics | Medium | Confirms the full funnel reaches date-planning behaviour after recent tracking fixes. | S | In progress | Beta |
| B-031 | Add unique-user funnel view later | Analytics | Medium | Improves interpretation beyond raw action counts, especially chat messages. | M | Not started | Post-launch |
| B-032 | Improve Clarity review process around drop-off stages | Analytics | Medium | Connects visual struggle to PostHog funnel drops for faster product decisions. | S | Not started | Beta |
| B-033 | Review long dash and AI-looking punctuation | Copy | Low | Makes product copy feel more human and less generated. | S | Not started | Beta |
| B-034 | Improve profile and onboarding microcopy consistency | Copy | Low | Makes the product tone feel calmer and more coherent. | M | Not started | Beta |
| B-035 | Polish demo/beta state labels | UX | Low | Helps testers distinguish demo/test states from real product behaviour. | S | Not started | Beta |
| B-036 | Revisit optional blur control later | Product | Low | User testing suggested blur comfort may vary, but MVP should keep the locked CSS blur model for now. | M | Not started | Post-launch |
| B-037 | Consider voice/phone option later | Product | Low | Could support users who find video inconvenient, but it is outside the current video-first MVP. | L | Not started | Post-launch |
| B-038 | Polish review page visually | UX | Low | Makes onboarding review feel less dry once core flow issues are resolved. | M | Not started | Beta |
| B-039 | Consider location trust feature later | Trust | Low | Could make location harder to fake, but should wait until core London density is validated. | L | Not started | Post-launch |

## Analytics and replay review rules

- Use PostHog for aggregate action counts and funnel movement only.
- Use Clarity for visual friction review only.
- Use Lookback transcripts to understand what testers said, then verify with PostHog and Clarity.
- Do not collect or display names, emails, phone numbers, chat messages, private Q&A answers, transcripts, or safety-contact details in analytics dashboards.
- Treat the current funnel as an event-count funnel until a unique-user funnel is deliberately designed.
