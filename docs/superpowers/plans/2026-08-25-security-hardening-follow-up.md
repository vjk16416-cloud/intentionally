# Security Hardening Follow-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining fixable Intentionally security-audit findings without changing the intended user journey.

**Architecture:** Align authenticated database grants with the operations already permitted by RLS, keep trigger-only functions non-callable by client roles, and validate chat input through one shared pure helper used by both the server action and client length limit. Supabase leaked-password protection remains a plan-level blocker on the current Free organisation.

**Tech Stack:** Next.js 16, TypeScript, Supabase/Postgres, GitHub Actions, tsx security regression scripts.

**Spec:** `docs/security-audit-2026-08-25.md`

## Global Constraints

- Preserve the staged mutual-interest-first dating journey.
- Keep RLS as the row-level authorisation boundary.
- Do not expose service-role credentials or sensitive profile data to the browser.
- Keep chat message maximum length consistent with the existing 1,000-character UI limit.
- Do not claim leaked-password protection is fixed while the Supabase organisation remains on Free.

---

### Task 1: Chat input validation

**Files:**
- Create: `lib/chat/validation.ts`
- Create: `scripts/test-chat-input-validation.ts`
- Modify: `app/(app)/chat/[chatId]/actions.ts`
- Modify: `app/(app)/chat/[chatId]/chat-message-form.tsx`
- Modify: `package.json`

**Interfaces:**
- Produces: `CHAT_MESSAGE_MAX_LENGTH` and `parseChatMessageInput(chatId, body)`.
- Consumes: `FormData` values supplied to the existing `sendMessage` server action.

- [ ] Write a regression test that rejects blank messages, malformed chat IDs and bodies over 1,000 characters while accepting a valid UUID and a 1,000-character body.
- [ ] Run CI and confirm the new test fails before the helper exists.
- [ ] Add the minimal validation helper and wire it into the server action and textarea limit.
- [ ] Run the security test, typecheck, lint, build and existing CI checks.
- [ ] Commit the passing implementation.

### Task 2: Database least privilege

**Files:**
- Create: one Supabase migration after the live migration version is known.

**Interfaces:**
- Consumes: current RLS policy operation set.
- Produces: authenticated grants that match those permitted operations, plus trigger helpers that are not directly executable by client roles.

- [ ] Record the current grants as the failing baseline.
- [ ] Revoke client DML operations that have no matching RLS policy.
- [ ] Revoke direct execution of trigger-only `set_updated_at()` from `PUBLIC`, `anon` and `authenticated`.
- [ ] Verify grants and function privileges with SQL.
- [ ] Re-run Supabase Security Advisor.

### Task 3: Audit status

**Files:**
- Modify: `docs/security-audit-2026-08-25.md`

- [ ] Mark exact-DOB and profile-photo findings fixed with verified evidence.
- [ ] Mark least-privilege and chat validation fixed after verification.
- [ ] Record leaked-password protection as blocked by the current Free plan rather than fixed.
- [ ] Keep full-history scanning as release assurance unless a conclusive scanner run is completed.
