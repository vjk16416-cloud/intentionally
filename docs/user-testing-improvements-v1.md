# User testing improvements v1

Source: User Testing Recording 2 transcript and follow-up notes.

Purpose: turn tester feedback into a prioritised improvement checklist before beta. This document is documentation only; it does not imply implementation order beyond the priority labels below.

## Critical fixes before beta

| Status | Priority | Issue | Evidence from testing | Recommended action |
|---|---|---|---|---|
| [ ] | Critical | Fix or verify trusted contact step appearing twice | Tester encountered trusted contact in a way that suggested repetition or unclear progression. This creates friction in a safety-critical step. | Reproduce the onboarding path from signup through review. Confirm whether the trusted contact page is duplicated, being revisited after review, or simply unclear. Fix route flow or copy accordingly. |
| [ ] | Critical | Explain trusted contact/SOS clearly | Tester needed clearer explanation of why a trusted contact is required and what will happen with that information. | Add concise copy explaining that the trusted contact is a safety requirement, when they would be contacted, and that this is not an always-on SOS feature in MVP. |
| [ ] | Critical | Improve SMS verification wording | Tester feedback showed uncertainty around phone/SMS verification and why it is needed. | Rewrite SMS verification copy to explain phone verification, privacy, and future safety/date coordination use in plain language. |
| [ ] | Critical | Investigate black profile photo issue | Tester saw or reported a black profile photo state, which can make profiles look broken or empty. | Reproduce photo upload and display on the tested device/browser. Check image format, object URL previews, Supabase public URL rendering, and fallback styling. |
| [ ] | Critical | Check iPhone HEIC photo upload support | Tester feedback raised concern that iPhone-native photos may not upload or render correctly. | Test HEIC upload from iPhone Safari and iOS photo library. Decide whether to support HEIC directly, convert client-side/server-side, or add clear accepted-format guidance. |

## High-priority UX/copy improvements

| Status | Priority | Issue | Evidence from testing | Recommended action |
|---|---|---|---|---|
| [ ] | High | Replace “Private profiles” copy | Tester feedback indicated the phrase is unclear or may imply the wrong privacy model. | Replace with copy that clearly communicates controlled visibility, safety, or intentional matching without suggesting profiles are hidden from matches. |
| [ ] | High | Improve gender option wording and research competitor norms | Tester noticed gender wording as an area needing refinement. This is sensitive and affects trust early in onboarding. | Review Hinge, Bumble, Feeld, Tinder, and HER wording patterns. Update options and helper copy so users understand both identity and matching preference fields. |
| [ ] | High | Improve “You and them” copy | Tester feedback suggested this phrase felt awkward or unclear. | Rewrite to a warmer, clearer label such as “Who you want to meet” or “Your match preferences,” depending on screen context. |
| [ ] | High | Rewrite photo upload guidance | Tester feedback suggested existing photo guidance feels awkward or insufficient. | Replace with direct guidance: upload clear, recent photos; include face visibility; avoid group-only photos; explain why photos matter for trust. |
| [ ] | High | Clarify Q&A blur behaviour | Tester needed a clearer mental model for when and why blur happens during Q&A. | Add a short explanation before scheduling/joining: the listener is softly blurred while the other person answers, then roles switch. |
| [ ] | High | Fix match notification spacing/copy | Tester noticed layout/copy roughness in the match notification. | Tighten spacing, CTA hierarchy, and copy so the next action is obvious: schedule the Q&A. |
| [ ] | High | Rework availability quick-pick options | Tester feedback suggested availability shortcuts may not map well to real schedules. | Review quick-pick labels and defaults. Prefer plain options such as weekday evenings, weekend mornings, weekend afternoons, and custom. |

## Product questions to validate

| Status | Priority | Issue | Evidence from testing | Recommended action |
|---|---|---|---|---|
| [ ] | Medium | Add or consider 2-3 prompts instead of one | Tester feedback suggested one prompt may not be enough to understand a person. | Test whether multiple prompts improve profile confidence without making onboarding feel long. Compare completion and profile-like rates. |
| [ ] | Medium | Expand London neighbourhood/borough options | Tester feedback indicated location options may feel too narrow or not match how London users identify where they live. | Review London neighbourhood list against boroughs and common dating-app location language. Add missing high-signal areas where needed. |
| [ ] | Medium | Rework distance options | Tester feedback raised uncertainty around distance/location expectations. | Validate whether MVP should show neighbourhood only, borough, rough distance, or no distance. Avoid false precision if distance is not live. |
| [ ] | Medium | Review hardcoded MVP/demo matches like Michael/Sophia | Tester noticed or may be confused by demo-like names and scenarios. | Audit hardcoded demo content. Keep useful demo states for development, but make sure real-user beta does not expose fake-feeling matches in core flows. |

## Bugs to investigate

| Status | Priority | Issue | Evidence from testing | Recommended action |
|---|---|---|---|---|
| [ ] | Critical | Trusted contact step appears twice | Tester journey suggested the trusted contact step may repeat. | Confirm route sequence, completion checks, review return behaviour, and any redirects from protected layout. Add a regression note once confirmed. |
| [ ] | Critical | Black profile photo issue | Tester saw a black or blank photo display state. | Inspect upload previews, stored photo URLs, supported file types, image optimisation, and CSS overlays. Test on the same device/browser from Recording 2 if possible. |
| [ ] | High | iPhone HEIC upload support | Tester/device context suggests iPhone photos may fail or display incorrectly. | Run a device test with HEIC images and document the current supported format behaviour. |
| [ ] | Medium | Hardcoded Michael/Sophia demo content visible | Tester feedback included concern about MVP/demo matches. | Search app surfaces for hardcoded demo names and confirm which are intentionally demo-only versus visible in real authenticated flows. |

## Later polish

| Status | Priority | Issue | Evidence from testing | Recommended action |
|---|---|---|---|---|
| [ ] | Low | Review long dash/AI-looking punctuation | Tester feedback flagged copy punctuation as potentially AI-generated or over-polished. | Replace overused long dashes with shorter sentences or commas. Do one copy pass across onboarding, Discover, Q&A, and date planning. |
| [ ] | Low | Improve profile and onboarding microcopy consistency | Several comments point to wording friction across onboarding and safety explanations. | Create a small voice-and-tone pass after critical copy fixes, keeping wording direct, human, and low-pressure. |
| [ ] | Low | Polish demo/beta state labels | Tester feedback around demo matches suggests beta surfaces should distinguish demo/test states from real product states. | Add internal checklist for removing or hiding demo labels/content before real tester sessions and beta invites. |

## Cross-check in analytics and session replay

For each item above, compare qualitative feedback with behavioural evidence:

- Lookback: what the tester said, where they hesitated, and the timestamp of the issue.
- PostHog: whether the expected event fired before or after the issue.
- Clarity: whether the screen recording shows visual hesitation, dead clicks, rage clicks, scrolling past CTAs, or layout confusion.

Suggested checks:

- SMS verification wording: compare `login_clicked` to `onboarding_started`.
- Trusted contact duplication: review onboarding path completion and any repeated page visits in Clarity.
- Photo upload guidance and HEIC support: watch photo upload attempts and note failed previews or abandoned upload steps.
- Match notification spacing/copy: compare `match_created` to `schedule_clicked`.
- Q&A blur explanation: compare `qa_started` to `qa_finished`, then review Clarity for hesitation around Q&A entry.
- Date/demo match confusion: review whether testers mention fake-feeling matches before or after seeing Michael/Sophia demo surfaces.
