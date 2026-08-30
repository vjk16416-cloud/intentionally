# Security Audit - 25 August 2026

## Scope

This review covers the current Intentionally source tree and the live Intentionally Supabase project. It checks authentication, server-side authorisation, RLS and database permissions, storage, admin and developer routes, secret handling, frontend exposure, input validation, SQL injection risk, error handling, build-log practices, and exposed user data.

## Executive status

Intentionally has working authentication, participant/owner-scoped RLS on core user data, protected founder routes, protected cron/webhook paths, server-only privileged keys, and explicit server-side input validation on the reviewed public feedback and chat flows.

The two P0 privacy findings from the initial audit are fixed. Discover no longer exposes exact date of birth to profile-card clients, and the live `profile-photos` bucket is private with JPEG/PNG/WebP MIME restrictions. Database grants have also been aligned with the RLS operation surface.

The remaining security warning is Supabase leaked-password protection, which cannot be enabled on the organisation's current Free plan. A conclusive full Git-history credential scan also remains a release-assurance item.

## Checklist

| Area | Status | Evidence / action |
| --- | --- | --- |
| Hardcoded API keys or database secrets in current tree | PASS | Local secret files are ignored except placeholder examples. Privileged service-role and third-party secrets remain server environment variables. |
| Publishable Supabase key / client configuration | PASS | Client-visible Supabase configuration is publishable by design. Privileged service-role credentials are not exposed through public environment variables. |
| Authentication | PASS | Authenticated app routes use Supabase server auth. Sensitive founder access uses `auth.getUser()` plus a server-side founder allow-list. |
| Server-side authorisation | PASS | Core mutations use authenticated server actions and RLS. Founder feedback mutations independently enforce founder access. Cron and Stripe webhook routes have separate server-side authentication. |
| Cross-user access to matches, chat, Q&A and trusted contacts | PASS | Live RLS restricts rows to the owner or match participants. |
| Profile discovery data minimisation | FIXED | Direct profile access is owner-scoped, and the Discover server derives an `age` value from DOB rather than returning exact `date_of_birth` in the profile-card payload. |
| Database RLS | PASS | RLS is enabled on all reviewed public tables. |
| Database least-privilege grants | FIXED | Authenticated grants now match the intended RLS operation surface: for example, `messages` is INSERT/SELECT, `profiles` SELECT/UPDATE, and `matches`/`qa_sessions` SELECT only. Trigger-only `set_updated_at()` is not executable by `PUBLIC`, `anon` or `authenticated`. |
| User testing feedback table | PASS / DENY BY DEFAULT | Direct client table grants were revoked. RLS is enabled with no client policy, intentionally denying direct browser access. Public submission is handled through the validated server action. |
| Storage buckets | FIXED | The live `profile-photos` bucket is private and restricted to JPEG, PNG and WebP. Public object delivery and SVG upload support from the initial finding have been removed. |
| Admin routes | PASS | `/admin/*` is protected by the founder layout and server-side founder check. |
| Debug/internal tools in production | PASS | Internal demo reset is disabled in production; testing shortcuts are disabled by default and require explicit enablement plus allow-listing. |
| Cron endpoints | PASS | `/api/cron/*` uses a server-only bearer secret. |
| Stripe webhook | PASS | Stripe Identity webhook signatures are verified before privileged mutation. |
| Verbose user-facing errors | PASS | Reviewed user-facing failures use generic messages rather than stack traces or raw database details. |
| Build logs leaking secrets | PASS WITH LIMITATION | Reviewed workflows consume secrets without intentionally echoing values. This is not a retrospective scan of every historical build log. |
| Secrets in Git history | UNVERIFIED | No current-tree live-secret pattern was identified in the reviewed pass, but a dedicated full-history credential scanner has not been completed through the connected tooling. |
| Secrets in frontend JavaScript | PASS | Reviewed privileged keys remain server-only. Public Supabase and analytics identifiers are intentionally client-visible. |
| Server-side input validation | FIXED ON REVIEWED PATHS | Public feedback already validates enums, lengths, numeric ranges and URLs. Chat now validates type, UUID-shaped chat ID, non-empty content and a 1,000-character maximum on the server, with the client sharing the same maximum constant. The regression test passed together with typecheck, lint, security checks and build in CI. |
| SQL injection | PASS | No application-owned raw SQL execution path was found in reviewed runtime code. Supabase/PostgREST parameterised query APIs are used. |
| Exposed data | FIXED FOR INITIAL P0 FINDINGS | Exact DOB is not returned by the Discover card surface and profile photos are no longer publicly addressable through a public bucket. |
| Supabase leaked-password protection | BLOCKED BY PLAN | Security Advisor reports leaked-password protection disabled. The organisation is on Supabase Free; do not mark this fixed until the project moves to a plan supporting the feature and the control is enabled. |

## Remediation completed

- Restricted Discover profile privacy and stopped returning exact DOB to profile-card clients.
- Made the live profile-photo bucket private and limited uploads to JPEG, PNG and WebP.
- Revoked direct client access to `user_testing_feedback`; public submission remains behind a validated server action.
- Restricted client execution of security-sensitive and trigger-only database functions.
- Reduced authenticated table privileges to operations actually supported by the product's RLS policies.
- Added explicit server-side chat validation for input type, chat UUID, non-empty content and maximum length.
- Added regression coverage for chat validation and kept the UI/server maximum length in one shared constant.
- Re-ran Supabase Security Advisor after database changes. Remaining results are the expected leaked-password warning and an informational no-policy notice for the intentionally direct-deny `user_testing_feedback` table.

## Remaining actions

### P1 / authentication hardening

1. If the project moves to a Supabase plan that supports it, enable leaked-password protection and rerun Security Advisor.

### P2 / release assurance

1. Run a dedicated Git-history credential scanner and rotate/revoke any actual credential it discovers.
2. Periodically scan CI logs and Supabase Security Advisor results.
3. Add automated second-user negative tests for representative cross-user IDOR/BOLA attempts against protected tables and server actions.

## Release decision

**Security review status: PASS WITH PLAN-LEVEL AND RELEASE-ASSURANCE ITEMS OUTSTANDING.** The initial P0 data-minimisation and public-storage findings are closed, the reviewed database grant surface is tightened, and explicit chat validation is in place. Leaked-password protection remains blocked by the current Supabase plan, and full-history credential scanning remains outstanding.
