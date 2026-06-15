[![Project Check](https://github.com/vjk16416-cloud/intentionally/actions/workflows/check.yml/badge.svg)](https://github.com/vjk16416-cloud/intentionally/actions/workflows/check.yml)

# Intentionally

Video-first dating app. See [`AGENTS.md`](./AGENTS.md) for the full
build brief — it's the source of truth for scope, stack, and data model.

## Local development

Requirements: Node 20.x and pnpm.

```bash
pnpm install
cp .env.local.example .env.local   # then fill in real values
pnpm dev
```

The app runs on http://localhost:3000.

## Useful scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint (with `/reference` ignored) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:diff` | Diff local migrations against the linked Supabase project |
| `pnpm db:push` | Apply migrations to the linked Supabase project |

## Database migrations

Migrations live in `supabase/migrations/` and are managed through the
Supabase CLI (installed as a devDependency, run via `pnpm exec
supabase ...`). We don't run a local Postgres / Docker stack — all
schema changes go straight to the cloud project.

First-time setup:

```bash
pnpm exec supabase link --project-ref <your-project-ref>
pnpm db:push
```

`supabase link` will prompt for your DB password.

## Environment variables

Documented in [`.env.local.example`](./.env.local.example) — every
variable from AGENTS.md §11 with a placeholder value. Never commit
`.env.local`.

PostHog needs two sets of variables:

- Client tracking: `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and
  `NEXT_PUBLIC_POSTHOG_HOST`
- Founder dashboard queries: `POSTHOG_PERSONAL_API_KEY`,
  `POSTHOG_PROJECT_ID`, and `POSTHOG_HOST`

If the server-only values are missing, the admin analytics page shows a
clear unavailable state instead of failing the app.

Founder dashboard routes under `/admin/*` require a signed-in Supabase
user whose email is listed in `FOUNDER_ADMIN_EMAILS` as a comma-separated
allowlist.

## Project layout

See AGENTS.md §4 for the canonical layout. In Step 1 we've scaffolded:

- `app/(public)/` — landing + login pages (no auth required)
- `app/(app)/` — authenticated routes; layout redirects to `/login`
  if no session
- `app/auth/callback/` — code-exchange handler for code-based auth
- `middleware.ts` — refreshes the Supabase session cookie on every
  non-asset request
- `lib/supabase/` — browser / server / middleware clients
- `supabase/migrations/` — SQL migrations

Later steps will fill in `lib/qa`, `lib/daily`, `lib/stripe`, etc.

## Deployment

Not wired yet. See AGENTS.md §10 for the build sequence — deployment
notes will land alongside Step 11 polish.
