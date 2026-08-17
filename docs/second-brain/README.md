# Intentionally Second-Brain Mirror

Status: Mirror index, not an independent source of truth  
Last synced: 2026-08-17  
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

- Intentionally is a mobile-first MVP for intentional dating.
- Core journey: onboarding → discovery → Q&A invite/session → mutual continue/pass → chat unlock → date planning → safety → analytics.
- Discovery profile cards are not blurred by default.
- Soft Reveal belongs mainly inside Q&A / Vibe Check.
- Chat unlocks only after both people choose Continue.
- Date planning follows chat unlock.
- Safety is part of the whole journey.
- Avoid complex AI matchmaking, AI dating coaching, social feeds, heavy gamification and other scope that delays the core journey.

## Current verified priorities from Drive review dated 2026-08-11

1. Finish and verify the Founder-approved dual-path email authentication flow.
2. Before real-user live Vibe Checks, verify and enforce independent video-room access control.
3. Before testing relies on them, make Q&A reminders reliable and repair authenticated visual-proof capture.
4. Before wider beta, decide where phone verification becomes mandatory.
5. Address smaller accessibility and documentation drift afterwards.

These priorities are a mirror of the Drive state, not a new decision. Always re-check the Drive vault before acting if this file may be stale.

## Branch observation at sync time

On 2026-08-17, repository `staging` was four commits ahead of `main`, with the latest observed staging commit dated 2026-08-11. Treat branch state as implementation evidence only and re-check it before future work.

## Sync rules

1. Founder-approved product decisions are recorded in the Drive Decision Log first.
2. Unresolved questions belong in the Drive Open Questions register.
3. GitHub documentation should defer to the Drive authority order rather than create a competing hierarchy.
4. Verified implementation evidence can inform a Drive Current App State update, but does not become a product decision by itself.
5. When a Drive change materially affects coding-agent behaviour, update this mirror and relevant repository guidance in the same documentation PR where practical.
6. Never use this mirror to overwrite a newer Drive decision.

## Green means done

- Root repository guidance points to this authority model.
- No repository file claims to outrank the Drive Decision Log or Current App State for product truth.
- Repository-only facts are clearly labelled as implementation evidence.
- Open questions remain open until Founder approval.
- The core MVP journey is represented consistently across Drive and GitHub guidance.
