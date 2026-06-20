# New Feature Playbook

## 1. Purpose

This playbook defines the standard process for designing, evaluating, building, testing, and releasing any new Intentionally feature.

Every feature should help users find the right person, support healthier relationships, care about users, respect autonomy, emotions, safety, and time, and reward meaningful progress rather than compulsive usage.

## 2. When to Use This Playbook

Use this playbook for any new product feature, major UX change, AI capability, safety flow, monetisation mechanic, or user-facing experiment.

Small bug fixes may use a lighter process, but should still respect the Constitution.

## 3. Feature Idea Summary

Document the feature in plain language:

- What is being proposed?
- Who is it for?
- Where does it appear in the journey?
- What user behaviour or outcome should it support?
- What should it not do?

## 4. Constitution Check

Evaluate the feature against the Constitution and decision framework.

The feature should clearly answer:

- Does this help users find the right person?
- Does this encourage genuine connection?
- Does this improve relationship quality?
- Does this respect users' emotions, autonomy, safety, privacy, and time?
- Could this unintentionally encourage unhealthy behaviour?

If the feature conflicts with the mission, redesign or reject it.

## 5. User Problem

Define the real user problem.

The problem should be grounded in evidence where possible, such as user testing, analytics, support feedback, research, or repeated observed behaviour.

Avoid building for internal preference, novelty, or one person's opinion alone.

## 6. Success Outcome

Define the desired user outcome before designing the solution.

A strong success outcome should describe healthier relationship progress, not just engagement.

Examples:

- Users feel clearer about what happens next.
- Users complete a Vibe Check with less pressure.
- Users feel safer deciding whether to continue.
- Users move from ambiguity to a respectful next step.

## 7. Research and Competitor Check

Review relevant evidence before implementation.

Include:

- User research and testing notes
- Analytics signals
- Safety risks observed in similar flows
- Competitor patterns worth learning from
- Competitor patterns Intentionally should avoid

Competitor research should inform judgment, not justify copying.

## 8. UX/UI Review

Review the proposed experience against the UX/UI principles.

Check that the feature is:

- Calm and emotionally safe
- Mobile-first
- Clear about the next step
- Consistent with brand colours, typography, spacing, and component patterns
- Free of unnecessary friction or decision overload
- Accessible and easy to understand

Every screen should help users feel more in control, not more overwhelmed.

## 9. Healthy Dopamine Check

Confirm the feature rewards meaningful progress, not compulsive usage.

The feature may create delight, anticipation, or reward only when it supports genuine connection and user wellbeing.

Avoid:

- Casino-style mechanics
- Streak pressure
- Fake urgency
- Infinite reward loops
- Shame-based notifications
- Popularity contests

Prefer subtle celebration of mutual effort and healthy milestones.

## 10. Safety and Ethics Review

Identify safety, privacy, consent, and emotional risks.

Review:

- What could make a user feel pressured?
- What could expose private information too early?
- What could enable harassment, manipulation, or coercion?
- What happens if a user wants to pause, pass, block, report, or leave?
- What accountability exists for repeated or serious breaches of trust?

Safety is part of product quality and must be designed into the flow.

## 11. Analytics Events Required

Define measurement before release.

Events should help evaluate trust, safety, onboarding quality, relationship progress, and feature clarity.

Document:

- Event names
- Trigger points
- Properties
- Success metrics
- Guardrail metrics
- How the data will be reviewed

Avoid measuring only clicks, views, or time spent.

## 12. Technical Design Checklist

Before implementation, confirm:

- Existing patterns and components have been reused where possible
- Data model changes are necessary and explicitly approved
- Authentication and protected routes remain secure
- Supabase access respects privacy and row-level security
- Loading, empty, and error states are handled
- The implementation is minimal and maintainable
- The feature can be tested safely

Do not add new architecture unless it clearly reduces complexity or risk.

## 13. QA Checklist

Test the feature across:

- Mobile, tablet, and desktop
- Android Chrome and iOS Safari where relevant
- Light brand theme and browser dark-mode settings
- Keyboard navigation and focus states
- Loading, empty, error, and success states
- Protected and unauthenticated routes
- No horizontal overflow
- No blocked primary actions or overlapping fixed controls

QA should verify the product journey, not just technical rendering.

## 14. Beta Testing Checklist

Before broader release, test with real or representative users.

Capture:

- What users expected
- Where users hesitated
- What felt unsafe, unclear, or awkward
- Whether the feature helped meaningful progress
- Whether the feature created pressure or confusion
- Whether multiple users saw the same issue

Use evidence from repeated behaviour before optimising.

## 15. Release Checklist

Before launch, confirm:

- Constitution check passed
- Safety and ethics review completed
- UX/UI review completed
- Analytics events implemented
- QA passed
- Rollback path exists
- Support or feedback path is ready
- Release notes or internal summary are written

Do not release if the feature meaningfully harms trust, safety, or user autonomy.

## 16. Post-Launch Review

Review the feature after release.

Assess:

- Did it solve the intended user problem?
- Did it improve meaningful relationship progress?
- Did it create unexpected safety or emotional risks?
- Did analytics match user research?
- What should be improved, removed, or left alone?

Post-launch decisions should be based on evidence, not momentum.

## 17. Go / No-Go Decision

Make an explicit decision:

- Go
- Go with guardrails
- Redesign
- Pause for research
- Reject

A feature should only go forward if it supports Intentionally's mission, respects users, and can be delivered safely and sustainably.
