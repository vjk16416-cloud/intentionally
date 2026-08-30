[![Project Check](https://github.com/vjk16416-cloud/intentionally/actions/workflows/check.yml/badge.svg)](https://github.com/vjk16416-cloud/intentionally/actions/workflows/check.yml)

# Intentionally

Video-first dating app.

For product, UX, safety, technical-direction and roadmap decisions, the canonical source of truth is the `Intentionally_ChatGPT_Safe` Google Drive vault. GitHub is the source of implementation evidence such as code, migrations, tests, CI, branches and commits.

Start with [`docs/second-brain/README.md`](./docs/second-brain/README.md) for the repository mirror of the authority model, then use [`AGENTS.md`](./AGENTS.md) for coding-agent execution guidance. `AGENTS.md` does not override the Drive Decision Log or Current App State.

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

Migrations live in `supabase/migrations/` and are managed through the Supabase CLI, installed as a devDependency and run via `pnpm exec supabase ...`.

First-time setup:

```bash
pnpm exec supabase link --project-ref <your-project-ref>
pnpm db:push
```

`supabase link` will prompt for your DB password.

Do not treat this README as approval to change the database. Follow the current Drive decisions, the approved delivery workflow and the task-specific implementation plan before applying schema changes.

## Environment variables

Documented in [`.env.local.example`](./.env.local.example). Never commit `.env.local`.

PostHog needs two sets of variables:

- Client tracking: `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`
- Founder dashboard queries: `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID`, and `POSTHOG_HOST`

If the server-only values are missing, the admin analytics page should show a clear unavailable state instead of failing the app.

Founder dashboard routes under `/admin/*` require a signed-in Supabase user whose email is listed in `FOUNDER_ADMIN_EMAILS` as a comma-separated allowlist.

## Project layout

The repository contains:

- `app/(public)/` for public routes such as landing and login
- `app/(app)/` for authenticated product routes
- `app/auth/callback/` for authentication callback handling
- `lib/` for shared application logic and integrations
- `supabase/migrations/` for database migrations
- `e2e/` for end-to-end coverage
- `docs/` for implementation and supporting documentation

For product gates and the canonical journey, use the Drive vault and the repository mirror index rather than inferring behaviour from folder names.

## Deployment

Deployment state is environment-specific and changes over time. Do not use this README as evidence that the app is or is not production-ready.

Before making a deployment claim, verify the current deployment provider and environment, then compare that evidence with the latest Drive `Current App State.md`.

<!-- staging deployment trigger 3 -->
