# Intentionally Second-Brain Mirror

Status: Mirror index, not an independent source of truth  
Last synced: 2026-09-03  
Canonical project brain: `Intentionally_ChatGPT_Safe` in Google Drive

## Authority model

For product, UX, safety, technical-direction and roadmap conflicts, use this order:

1. `08_Decisions/Decision Log.md`
2. `00_Start_Here/Current App State.md`
3. `00_Start_Here/Start Here.md`
4. Relevant feature notes
5. Roadmap notes
6. Research notes
7. Older prompts or loose notes

Locked documents remain authoritative within their stated scope. If two sources disagree, record the contradiction as an open question rather than resolving it by assumption.

GitHub is authoritative for implementation evidence such as code, migrations, tests, CI configuration, branch state and commit history. Repository evidence does not silently create or replace a product decision.

## Core context set

Agents working on Intentionally should use the Drive vault versions of:

- `00_Start_Here/Start Here.md`
- `00_Start_Here/Current App State.md`
- `08_Decisions/Decision Log.md`
- `08_Decisions/Open Questions.md`
- `08_Decisions/Known Risks.md`
- `07_AI_Agent_Instructions/AI Agent Instructions.md.md`
- `10_Context_Packs/Agent Context Packs.md.md`
- `02_User_Journey/Core Journey.md`
- `05_Technical/Technical Notes.md`
- `06_Roadmap/MVP Roadmap.md`
- `12_Agent_Reviews/Agent Review Board.md`
- `12_Agent_Reviews/Technical Lead Review.md`

This file mirrors the authority rules and current headline state so coding agents do not mistake repository notes for Founder-approved product truth.

## Current headline state mirrored from Drive

The latest canonical Drive `Current App State.md` reviewed on 2026-08-22 still treats Intentionally as a prototype / controlled-test build rather than production-ready launch software.

- Intentionally is a mobile-first MVP for intentional dating.
- Core journey: onboarding → discovery → Q&A invite/session → mutual continue/pass → chat unlock → date planning → safety → analytics.
- Discovery profile cards are not blurred by default.
- Discover records interest only. A Vibe Check follows mutual interest and a match.
- Soft Reveal belongs mainly inside Q&A / Vibe Check.
- Chat unlocks only after both people choose Continue.
- Date planning follows chat unlock.
- Safety is part of the whole journey.
- Avoid complex AI matchmaking, AI dating coaching, social feeds, heavy gamification and other scope that delays the core journey.

## Founder-approved decisions currently relevant to implementation

The Drive Decision Log reviewed on 2026-08-22 records, among other active decisions:

- `DEC-017`: Mutual Continue → Chat Unlock → Date Planning must use an atomic, idempotent server-side unlock boundary and status-backed access control.
- `DEC-019`: Email authentication should use one email containing both a 6-digit verification code and secure sign-in link. Either method may authenticate the user. Social login and broader auth redesign are out of scope for this blocker.
- `DEC-020`: Discover must not offer a direct pre-match Vibe Check action.
- `DEC-021`: CI must provide and validate `APP_URL` so automated production-build verification is reproducible.

Do not treat later repository implementation evidence as a new Founder decision unless it is also recorded in the canonical Drive decision system.

## Latest verified repository implementation evidence

The repository has moved materially beyond the 2026-08-22 Drive snapshot. The following is implementation evidence, not a replacement product decision.

### Main branch reconciliation

On 2026-08-30, PR #20 (`Promote reconciled staging and security hardening`) was merged to `main`.

The resulting main commit was:

`caf902640ef076c23d4221596bc66328ff9ed326`

This reconciliation promoted the verified staged product journey while preserving the security hardening already present on `main`.

### Discovery → Match → Q&A

Current `main` includes the reconciled Discovery-to-Q&A journey:

- Discover evaluates profile interest rather than offering a direct pre-match Vibe Check.
- Mutual-interest-first behaviour is preserved.
- Match and scheduling flows are reconciled with current security changes.
- Regression coverage exists for the Discovery and Q&A invitation journey.

### Mutual Continue → Chat Unlock

Current `main` preserves the guarded atomic chat-unlock boundary.

- Chat unlock depends on both users choosing Continue.
- The server-side unlock boundary is retained through the 2026-08-30 reconciliation.
- Chat access and the transition remain covered by regression gates.

### Daily Vibe Check security

PR #16 (`Reconcile and secure Daily Vibe Check access`) was merged to `main` on 2026-08-30.

Current implementation evidence includes:

- private Daily rooms
- two-person participant limits
- unique participant identity handling
- short-lived room-scoped meeting tokens created server-side
- Intentionally participant authorisation before token creation
- fail-closed behaviour when secure token creation fails
- authenticated Intentionally `/qa/[sessionId]` links rather than raw Daily room URLs in the relevant flow
- dedicated Daily security regression checks

This materially addresses the earlier Drive risk that the Daily video room itself might be joinable by anyone holding the raw room URL. Treat the canonical Drive blocker text as stale implementation status until the Drive record is formally reconciled.

### Profile and chat security hardening

Repository evidence from 2026-08-25 to 2026-08-30 includes:

- privacy-safe Discover age handling
- private profile-photo storage behaviour
- tightened public/authenticated database grants
- explicit server-side chat input validation
- security regression checks in CI

### Email authentication implementation

Current `main` implements the Founder-approved dual-path email-authentication experience in the login UI:

- one email is described as containing both a secure sign-in link and a 6-digit code
- users may enter the 6-digit email code
- resend behaviour is implemented
- wrong/expired-code error messaging is handled in the UI
- authenticated callback routing preserves safe intended destinations
- incomplete users are routed to onboarding
- unsafe external `next` redirects are rejected

This is implementation evidence only. Do not mark `DEC-019` fully verified until the deployed real-email code path, secure-link path, resend behaviour, expired/wrong-code behaviour and intended post-auth routing have been exercised end-to-end.

### Q&A reminder scheduling

As of the 2026-09-03 sync, PR #21 (`Fix reliable Q&A reminder scheduling`) remains open as a draft.

Its goal is to make one-hour Q&A reminders schedulable every 15 minutes while preserving `CRON_SECRET` protection and avoiding a Vercel Pro dependency.

Observed verification state:

- GitHub `Project Check` run #330 completed successfully on the current `main` commit.
- The latest observed Vercel commit statuses on `main` were failing because of a Vercel build-rate-limit condition, not because the GitHub Project Check reported a code failure.

Do not call reminder scheduling complete until PR #21 is reviewed, merged and deployed with fresh exact-head verification.

## Current practical project position

Based on canonical Drive product decisions plus newer repository implementation evidence, Intentionally should now be treated as being in a **finish verification and prepare controlled testing** stage rather than a feature-expansion stage.

Do not widen MVP scope.

Highest-value remaining work is:

1. Finish and deploy reliable Q&A reminder scheduling.
2. Verify the real deployed email code + secure-link authentication paths end-to-end.
3. Run authenticated mobile-first core-journey QA with fresh visual evidence where relevant.
4. Resolve the Founder/Product/Safety decision for where phone verification becomes mandatory before wider beta.
5. Reconcile the newer GitHub implementation evidence back into Drive `Current App State.md`, `Decision Log.md` and `Open Questions.md` as appropriate.
6. Run fresh MVP Progress, Technical Lead, Safety/Trust and Demo Readiness reviews using the smallest useful review set.

## Beta readiness boundary

Do not describe Intentionally as private-beta-ready merely because the core code exists.

Green for controlled real-user testing requires at minimum:

- reliable deployed authentication proof
- secure Vibe Check access
- reliable Q&A scheduling/reminders for the intended test flow
- authenticated core-journey QA
- no unresolved high-severity safety blocker for the tested journey
- clear loading, empty and error states on the tested paths
- Founder approval to begin the controlled test

## Sync rules

1. Founder-approved product decisions are recorded in the Drive Decision Log first.
2. Unresolved questions belong in the Drive Open Questions register.
3. GitHub documentation should defer to the Drive authority order rather than create a competing hierarchy.
4. Verified implementation evidence can inform a Drive Current App State update, but does not become a product decision by itself.
5. When a Drive change materially affects coding-agent behaviour, update this mirror and relevant repository guidance in the same documentation PR where practical.
6. Never use this mirror to overwrite a newer Drive decision.
7. When GitHub implementation moves ahead of Drive documentation, label that evidence explicitly and schedule a reconciliation rather than silently rewriting Founder-approved product truth.

## Green means done

- Root repository guidance points to this authority model.
- Claude and other coding agents can find the latest mirrored project status from the repository root.
- No repository file claims to outrank the Drive Decision Log or Current App State for product truth.
- Repository-only facts are clearly labelled as implementation evidence.
- Open questions remain open until Founder approval.
- The core MVP journey is represented consistently across Drive and GitHub guidance.
