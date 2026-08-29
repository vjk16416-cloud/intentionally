# Intentionally Release Governance Design

**Date:** 2026-08-29

## Purpose

Intentionally should reach a real Private Beta rather than remain in continuous pre-launch development. This design defines a hard Private Beta release boundary while preserving a disciplined learning-and-iteration path toward Public V1.

The core rule is:

> Definition of Done closes a release, not the product.

Intentionally may continue to improve after beta, but a completed beta release is not retrospectively expanded because a new idea appears.

## Current release target

**Intentionally Private Beta**

Private Beta is done when a controlled group of invited users can safely complete the intended dating journey end to end without developer intervention, while core safety, privacy, moderation and operational controls work as described.

## Private Beta Definition of Done

Private Beta is complete only when all of the following are true:

1. Invited users can create/sign into an account and complete the minimum profile, photos and preferences needed for discovery.
2. Discovery surfaces valid profiles and allows the intended interest/pass flow without duplicate or broken-state domination.
3. Matching creates the correct match state only when product rules are satisfied.
4. Matched users can schedule, confirm, cancel or reschedule the structured Q&A session.
5. Both users can enter the correct Q&A session, complete the intended 10-minute flow, receive the agreed 4–5 prompts, experience the correct staged reveal/unblur logic, reconnect safely and finish cleanly.
6. Post-session approve/decline choices remain private until the product rules allow disclosure.
7. Mutual approval unlocks chat; non-mutual approval does not expose inappropriate information.
8. Basic chat persists and is accessible only to authorised matched users.
9. Transcript generation/storage follows the approved retention policy; deletion behaviour is tested and the UI/policy promise matches implementation.
10. Compatibility guidance is non-deterministic and non-blocking; AI failure does not break the core dating journey.
11. Date progression works at the minimum level needed to move a successful match toward real-world intent, including safe postpone/decline handling.
12. Sensitive personal information is not revealed earlier than the explicitly approved product stage.
13. Block and report controls are reachable at relevant stages and work end to end.
14. Any advertised SOS/emergency capability either works as described or is removed from the beta UI.
15. User-data isolation protects profile, match, session, transcript and chat data.
16. Account deletion, beta privacy information and beta terms are live and accurate.
17. Authorised operators can invite/disable users, investigate reports and identify major failed-session/application errors without requiring a large internal admin platform.
18. Critical automated/Playwright journeys pass.
19. No known P0 safety, security, privacy or core-journey defect remains open.
20. Founder acceptance passes using two controlled accounts across the complete journey:
   `Signup → Profile → Discovery → Match → Schedule → Q&A → Mutual approval → Chat → Date progression`.
21. A small controlled beta cohort can be invited with a defined feedback/support route.
22. Once invitations begin, non-blocking feature work freezes and the product enters a learning period.

## Not in Private Beta

The following must not block the first Private Beta unless a later explicit founder/CTO decision reclassifies one as a release blocker:

- mass-market App Store or growth-launch polish
- every social authentication provider
- rich messaging extras such as reactions, GIF ecosystems or decorative effects
- sophisticated compatibility modelling
- large-scale autonomous AI matching
- full growth/viral/referral systems
- monetisation optimisation beyond what is strictly required for the chosen beta model
- enterprise-grade internal moderation tooling
- scale optimisation without evidence that beta usage requires it
- broad analytics beyond what is needed to understand core funnel and failures
- public-launch acquisition campaigns

## Release classification

Every new request must receive exactly one classification before entering active work:

- **Release blocker**: required to meet the current Private Beta Definition of Done.
- **Important / next release**: valuable but does not block the current beta.
- **Nice to have**: backlog only.
- **Experiment**: only built when the hypothesis and success signal are explicit.
- **Reject / duplicate**: intentionally not built.

Safety, security and privacy defects can always be promoted to release-blocker status when evidence warrants it.

## Completion evidence

A task can be called Done only when there is observable evidence appropriate to the task, such as:

- green automated/Playwright tests
- merged pull request
- production-like or production verification
- safety/privacy test result
- screenshot or acceptance evidence
- moderation workflow check
- beta acceptance checklist
- decision record

Code written but not verified is not Done.

## Post-beta operating model

After the first Private Beta release, Intentionally enters a learning-led iteration cycle:

`Private Beta → observe → fix blockers → small beta iteration → observe → validate → Public V1 → V1.x`

During beta, new work should normally come from:

1. safety, security or privacy findings
2. defects preventing the core journey
3. observed user drop-off or confusion
4. repeated feedback that materially affects the product hypothesis
5. small experiments with explicit success criteria

Beta should not turn into an uncontrolled feature-request queue.

## Public V1 transition

Public V1 is a separate future release with its own Definition of Done. Private Beta completion does not silently become Public V1 scope. Evidence from beta will determine what Public V1 actually requires.

## System responsibilities

### GitHub

GitHub is the technical source of truth for implementation, merged code, tests, safety/security evidence, deployment evidence and release tags.

### Leantime

Leantime is the execution source of truth for the release goal, milestones, active tasks, owners, blockers, due dates and status.

### ChatGPT Work

ChatGPT Work acts as the CTO/founder reasoning and review layer: scope classification, planning, decision records, beta reviews, status reconciliation and founder-facing explanations.

### Knowledge Bank

The knowledge bank stores durable product briefs, research, user-learning summaries, policy decisions, specifications and reference documents. It is not the task tracker.

## Sync rules

- New feature idea → classify before creating active work.
- New safety/privacy blocker → add to Leantime immediately and link technical issue/PR when implementation begins.
- PR merged → technical implementation may be complete, but Leantime task becomes Done only when completion evidence passes.
- Milestone Definition of Done met → close milestone and do not reopen it for polish.
- Private Beta Definition of Done met → deploy/freeze the beta release, invite the controlled cohort and move into learning mode.
- Material release-scope change → update this release contract first, then update Leantime and implementation plans.
- Beta learning → feeds the next beta release or future Public V1 backlog; it does not automatically reopen the released beta.

## Founder operating rules

1. Safety, security, privacy and core-journey blockers take precedence over polish.
2. Prefer one active product milestone at a time.
3. Done requires evidence.
4. New ideas do not extend the beta by default.
5. Once Private Beta ships, the team learns from real usage and makes small evidence-led changes rather than returning to open-ended pre-launch development.

## Success criterion

This governance system succeeds when Intentionally can actually reach a safe controlled Private Beta, learn from real users and progress toward Public V1 through deliberate small releases instead of continuous scope expansion.