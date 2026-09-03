# Claude Project Context — Intentionally

Use this file as the repository entry point for Claude Code and other Claude-based coding work on Intentionally.

## Read first

Before proposing or making product, UX, safety, technical-direction or roadmap changes, read:

1. [`docs/second-brain/README.md`](./docs/second-brain/README.md)
2. [`AGENTS.md`](./AGENTS.md)
3. The relevant current code, tests, migrations and CI configuration for the task

The canonical project brain is the `Intentionally_ChatGPT_Safe` Google Drive vault. GitHub mirrors important context for coding convenience, but must not silently replace a newer Founder-approved Drive decision.

## Authority order

When product information conflicts, use:

1. Drive `08_Decisions/Decision Log.md`
2. Drive `00_Start_Here/Current App State.md`
3. Drive `00_Start_Here/Start Here.md`
4. Relevant feature notes
5. Roadmap notes
6. Research notes
7. Older prompts or loose notes

GitHub is authoritative for implementation evidence such as code, migrations, tests, CI, branches and commits.

If repository implementation has moved ahead of the Drive record, do not invent a new product decision. Label the difference as implementation evidence and flag the documentation reconciliation.

## Current product journey

Keep work focused on:

onboarding → discovery → Q&A invite/session → mutual continue/pass → chat unlock → date planning → safety → analytics

Do not introduce scope such as complex AI matchmaking, gamification, social feeds, AI dating coaching, excessive onboarding or other features that delay the core journey.

## Current project stage

As mirrored on 2026-09-03, the repository has materially advanced beyond the Drive `Current App State` last reviewed on 2026-08-22.

Treat the project as being in **finish verification and prepare controlled testing**, not feature expansion.

Key implementation evidence already on `main` includes:

- reconciled Discovery → Match → Q&A journey
- guarded atomic Mutual Continue → Chat Unlock behaviour
- private/tokenised Daily Vibe Check access hardening
- privacy-safe Discover/profile-photo handling
- server-side chat input validation and tighter database grants
- dual-path email-authentication UI and callback-routing implementation

Still not green:

- PR #21 reliable Q&A reminder scheduling is not yet merged/deployed
- real deployed email code + secure-link authentication still needs full end-to-end proof before marking the auth decision verified
- authenticated mobile-first core-journey QA remains required
- phone-verification policy still requires Founder/Product/Safety resolution before wider beta
- Drive project-state documents still need reconciliation with newer GitHub evidence

For the detailed evidence, commit references, boundaries and green criteria, read [`docs/second-brain/README.md`](./docs/second-brain/README.md).

## Working rule

Make the smallest safe change that advances the core MVP journey. Preserve existing design and security boundaries. Include loading, empty and error states where relevant. Consider mobile-first behaviour, accessibility, privacy and safety.

Do not mark work complete without relevant verification evidence.
