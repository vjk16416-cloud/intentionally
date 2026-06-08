# PostHog Dashboard Connection Plan

This is the Phase 2 plan for replacing `/admin/analytics` mock counts with real PostHog aggregate event counts. Do not implement this until explicitly approved.

References:
- PostHog Query API: https://posthog.com/docs/api/query
- PostHog API overview and authentication: https://posthog.com/docs/api

## Required Server-Only Env Vars

Add names only to `.env.local.example`; never commit values.

```bash
POSTHOG_PERSONAL_API_KEY=
POSTHOG_PROJECT_ID=
POSTHOG_HOST=
```

Expected values:
- `POSTHOG_PERSONAL_API_KEY`: PostHog personal API key with the narrowest read/query scope available, ideally `query:read`.
- `POSTHOG_PROJECT_ID`: numeric PostHog project ID.
- `POSTHOG_HOST`: private PostHog app host, for example `https://eu.posthog.com` for EU Cloud or `https://us.posthog.com` for US Cloud. Do not use the public ingestion host (`*.i.posthog.com`) for private query requests.

## Safest API Approach

Use PostHog's private Query API from server code only:

```text
POST {POSTHOG_HOST}/api/projects/{POSTHOG_PROJECT_ID}/query/
Authorization: Bearer {POSTHOG_PERSONAL_API_KEY}
Content-Type: application/json
```

Request body should use a `HogQLQuery` and return aggregate counts only:

```json
{
  "query": {
    "kind": "HogQLQuery",
    "query": "SELECT event, count() AS count FROM events WHERE event IN (...) AND timestamp >= now() - INTERVAL 30 DAY GROUP BY event"
  },
  "name": "intentionally-admin-analytics-counts"
}
```

Implementation guidance:
- Put the fetch helper in a server-only module such as `lib/posthog/server.ts`.
- Add `import "server-only";` if the project allows adding that tiny dependency, or keep the helper exclusively imported by server components and avoid exporting it to client modules.
- Use `cache: "no-store"` or a short `next.revalidate` window. For MVP, prefer `next: { revalidate: 300 }` to avoid hammering PostHog while keeping the dashboard fresh enough.
- Use a timeout via `AbortController` so the admin page does not hang on PostHog latency.
- Validate the response shape before rendering; treat malformed responses as unavailable data.
- Do not request persons, session recordings, properties, paths, URLs, emails, names, message bodies, or distinct IDs.

## Events To Fetch

Fetch only these event names:

```ts
[
  "login_clicked",
  "onboarding_started",
  "onboarding_completed",
  "profile_liked",
  "profile_passed",
  "match_created",
  "schedule_clicked",
  "qa_started",
  "qa_finished",
  "qa_continue_clicked",
  "qa_pass_privately_clicked",
  "chat_message_sent",
  "date_plan_shared",
]
```

The query should return a row per event name and count. The UI should backfill missing events with `0` so cards remain stable.

## 7-Day And 30-Day Aggregation Logic

Run two aggregate queries, or one query with conditional aggregates. Keep the implementation simple unless latency becomes a problem.

Recommended simple approach:
- Query last 7 days: `timestamp >= now() - INTERVAL 7 DAY`
- Query last 30 days: `timestamp >= now() - INTERVAL 30 DAY`
- Group by `event`
- Map results into the existing dashboard shape.

Preferred HogQL shape:

```sql
SELECT
  event,
  countIf(timestamp >= now() - INTERVAL 7 DAY) AS last_7_days,
  countIf(timestamp >= now() - INTERVAL 30 DAY) AS last_30_days
FROM events
WHERE event IN (...)
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY event
```

Dashboard calculations:
- Metric cards use the exact event counts.
- Funnel story should map events to steps:
  - Login: `login_clicked`
  - Onboarding: `onboarding_completed`
  - Like: `profile_liked`
  - Match: `match_created`
  - Schedule: `schedule_clicked`
  - Q&A started: `qa_started`
  - Q&A finished: `qa_finished`
  - Chat: `chat_message_sent`
  - Date plan shared: `date_plan_shared`
- Drop-off from step A to step B:

```ts
dropOff = previousCount === 0 ? 0 : Math.max(0, 100 - Math.round((currentCount / previousCount) * 100));
```

Important caveat:
- Some steps are action-count events, not user-unique funnel events. For example, one user can send multiple chat messages. The dashboard should label this as "event-count funnel" until a unique-user funnel is deliberately designed.

## Fallback And Empty States

Handle these states:

1. Missing env vars
   - Render the existing dashboard shell.
   - Show a clear "PostHog is not connected" state.
   - Do not throw in production.

2. API fetch failure, timeout, 401, 403, or 429
   - Render unavailable state with short copy.
   - Keep the page usable.
   - Do not show raw error bodies or secrets.

3. Valid response but all counts are zero
   - Use the existing empty state.
   - Cards can either show `0` or be replaced by the empty state. Prefer stable cards plus an empty state summary.

4. Partial/malformed response
   - Treat missing event rows as `0`.
   - Treat invalid response shape as unavailable.

5. Loading state
   - Because `/admin/analytics` is currently server-rendered, a persistent client loading spinner is not needed.
   - If the fetch moves behind a route handler/client refresh later, add a small loading skeleton matching the card layout.

## Security Rules

- Never expose `POSTHOG_PERSONAL_API_KEY` to client components.
- Never prefix server API keys with `NEXT_PUBLIC_`.
- Never pass PostHog API keys through props, query strings, cookies, or route params.
- Query aggregate counts only.
- Do not request or render:
  - phone numbers
  - emails
  - names
  - message text
  - Q&A transcripts or private answers
  - distinct IDs
  - person properties
  - session recordings
  - URLs or referrers
- Do not add event properties to the dashboard without a separate privacy review.
- If logging errors, log only sanitized status/category information, never response payloads that might contain request details.
- Use a read-only/scoped personal API key and rotate it if exposed.
- Keep `/admin/analytics` access control as a separate product/security decision before real users or wider deployment.

## Implementation Steps

1. Add env names to `.env.local.example`:
   - `POSTHOG_PERSONAL_API_KEY`
   - `POSTHOG_PROJECT_ID`
   - `POSTHOG_HOST`

2. Add a server-only PostHog query helper:
   - `lib/posthog/server.ts`
   - Reads env vars only on the server.
   - Builds the Query API URL.
   - Sends a single aggregate HogQL query for both 7-day and 30-day counts.
   - Returns a typed result like `{ status: "ok", ranges } | { status: "unavailable", reason }`.

3. Centralize dashboard event config:
   - Reuse event names from `lib/analytics/events.ts` where possible.
   - Keep dashboard labels/icons/status rules in the admin dashboard module or move them to `lib/analytics/dashboard.ts` if the page gets too large.

4. Replace static counts in `/admin/analytics`:
   - Keep the existing layout/components.
   - Populate metric cards and funnel from the PostHog helper result.
   - Preserve mock/static fallback only for local development if explicitly desired; otherwise use an unavailable state.

5. Add empty/unavailable states:
   - Missing env vars
   - API failure
   - Zero counts

6. Verify privacy:
   - Confirm `posthog.capture()` usage remains event-name only.
   - Confirm the dashboard query selects only `event` and aggregate count columns.
   - Confirm no API key appears in client bundles.

7. Run checks:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm build`

8. Manual smoke check:
   - Visit `/admin/analytics` locally with missing env vars and confirm the unavailable/empty state.
   - Visit with valid env vars and confirm cards/funnel populate.
   - Confirm browser devtools/network never expose `POSTHOG_PERSONAL_API_KEY`.
