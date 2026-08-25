# Security Audit - 25 August 2026

## Scope

This review covers the current `main` branch and the live Intentionally Supabase project. It checks authentication, server-side authorisation, RLS and database permissions, storage, admin and developer routes, secret handling, frontend exposure, input validation, SQL injection risk, error handling, build-log practices, and exposed user data.

## Executive status

The application has working authentication, participant/owner-scoped RLS on core user data, protected founder routes, protected cron/webhook paths, server-only privileged keys, and server-side validation on the reviewed public feedback flow. No live API key or service-role value was found in the current repository tree.

The audit is **not fully closed**. The main remaining risks are data minimisation in Discover, public profile-photo storage, least-privilege database grants, Supabase leaked-password protection, and a full Git-history secret scan.

## Checklist

| Area | Status | Evidence / action |
| --- | --- | --- |
| Hardcoded API keys or database secrets in current tree | PASS | `.env*` files are ignored except the placeholder example. Service-role and third-party secrets are server environment variables. Current-tree searches found no live-key patterns reviewed in this pass. |
| Publishable Supabase key / JWT-like client key | PASS | The frontend uses the Supabase publishable key as intended. Privileged service-role credentials are not exposed through `NEXT_PUBLIC_*`. |
| Authentication | PASS | Authenticated app routes use Supabase server auth. Sensitive founder access uses `auth.getUser()` plus a server-side founder allow-list. |
| Server-side authorisation | PASS | Core mutations rely on authenticated server actions and RLS. Founder feedback mutations independently call `requireFounder()`. Cron and Stripe webhook routes have separate server-side authentication. |
| Cross-user access to matches, chat, Q&A, trusted contacts | PASS | Live RLS policies restrict these rows to the owner or match participants. |
| Profile discovery data minimisation | OPEN | Active profiles can be read by authenticated users and the Discover feed explicitly returns exact `date_of_birth`. The UI should receive age or age-band instead of exact DOB, and sensitive profile fields should be separated from discoverable fields. |
| Database RLS | PASS | RLS is enabled on all reviewed `public` tables. |
| Database least-privilege grants | HARDEN | Several legacy tables retain broader `anon` / `authenticated` base privileges than necessary. RLS still applies, but grants should be reduced to the exact CRUD operations required by the application. |
| User testing feedback table | PASS | Direct `anon` / `authenticated` table access was revoked. Public submission is handled by a validated server action using the service role. |
| Storage buckets | OPEN | `profile-photos` is public. Upload/delete operations are owner-folder scoped, but a known object URL can be fetched outside the authenticated discovery flow. SVG is also currently an allowed upload MIME type. Move to private delivery or an authenticated media route and remove SVG unless it is genuinely required. |
| Admin routes | PASS | `/admin/*` is protected by the founder layout and server-side founder check. |
| Debug/internal tools in production | PASS | Internal demo reset is explicitly disabled when `NODE_ENV=production`. Internal testing shortcuts are disabled by default in production and require explicit enablement plus an allow-list. |
| Cron endpoints | PASS | `/api/cron/*` uses a server-only bearer secret. |
| Stripe webhook | PASS | Stripe Identity webhook signatures are verified before privileged database mutation. |
| Verbose user-facing errors | PASS | Reviewed app error states and API responses use generic messages rather than rendering stack traces or raw database errors. Internal logs can contain diagnostic details and should remain access-controlled. |
| Build logs leaking secrets | PASS WITH LIMITATION | The checked workflow consumes GitHub Actions secrets without echoing their values. This was a workflow/config review, not a retrospective scan of every historical build log. |
| Secrets in Git history | UNVERIFIED | Current-tree searches did not find live secret patterns, but the connected GitHub tooling does not provide a conclusive full-history secret scan. Run a dedicated history scanner before public launch. |
| Secrets in frontend JavaScript | PASS | Reviewed privileged keys are server-only. Public Supabase and analytics identifiers are intentionally client-visible. |
| Server-side input validation | PARTIAL | The public feedback path has enum, length, numeric-range and URL validation. Some other actions, such as chat sending, still rely on basic non-empty checks plus database/RLS constraints and should add explicit length/type validation. |
| SQL injection | PASS | No application-owned raw SQL execution path was found in the reviewed runtime code. Supabase/PostgREST parameterised query APIs are used. Dynamic SQL observed in the database belongs to Supabase Storage internals with allow-listed sort values. |
| Exposed data | OPEN | Exact DOB is returned in Discover and public storage URLs can expose profile images outside the signed-in journey. |
| Supabase leaked-password protection | OPEN | Supabase Security Advisor reports leaked-password protection disabled. Enable it in Auth settings. |

## Remediation already present

- Security hardening migration `20260825205631_security_hardening_20260825.sql` revokes direct client access to `user_testing_feedback`, restricts execution of `handle_new_user()`, and hardens the `set_updated_at()` function search path.
- Founder admin routes and admin mutations independently enforce founder access.
- Internal demo reset returns 403 in production.
- Service-role, Stripe, Resend and cron secrets are server-side environment variables.

## Priority actions

### P0 / before broader production access

1. Stop returning exact date of birth to Discover clients. Store sensitive DOB separately or expose only a derived age/age-band through a deliberately limited data surface.
2. Replace public profile-photo delivery with authenticated/private delivery, or an application-controlled media route. Remove SVG upload support unless there is a documented requirement.

### P1

1. Reduce `anon` and `authenticated` table grants to the minimum CRUD operations actually used, while retaining RLS.
2. Enable Supabase leaked-password protection.
3. Add explicit maximum length and identifier validation to messaging and other remaining free-text server actions.

### P2 / release assurance

1. Run a dedicated Git-history secret scanner and rotate/revoke anything it discovers.
2. Periodically scan CI logs and Supabase Security Advisor results.
3. Add automated tests for cross-user IDOR/BOLA attempts against representative protected tables and server actions.

## Release decision

**Security review status: CONDITIONAL / remediation required.** Core authentication and row-level authorisation are in place, but the exact-DOB and public-profile-photo exposures should be closed before treating the application as production-hardened.
