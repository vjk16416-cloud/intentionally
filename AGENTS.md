# Intentionally — MVP Build Brief

**Document for AI coding agent (Codex / Claude Code) and contractor use.**
**Version:** v1.0 — 14 May 2026
**Filename convention:** Save at repo root as `AGENTS.md`. Codex reads this automatically every session. (Claude Code also reads it.)

---

## 0. How to use this document

This is the single source of truth for the Intentionally MVP build. If anything in a chat instruction conflicts with this document, **this document wins** unless the founder explicitly says "override AGENTS.md."

When in doubt about scope, default to **NO**. The MVP is intentionally narrow. Every feature is a funnel step where users can drop off; we have more steps than Hinge already.

If you (the agent) find yourself about to build something not listed in scope below, **stop and ask the founder first.**

---

## 1. Product context

### What we're building
Intentionally is a video-first dating app. Matches must complete a mandatory 10-minute live video Q&A — 3 therapist-designed questions, with a real-time blur on whoever is listening — before chat unlocks. Both parties must opt in after the Q&A for the conversation to continue. Every user is ID-verified before their first Q&A (the Stripe Identity gate fires at Q&A scheduling entry — *not* at signup; see §6.1). A trusted contact is mandatory. Phone numbers are only revealed 3 hours before a confirmed date.

### The thesis
Swipe culture produces low-signal matches because text is a weak interview format. By forcing one structured, time-bounded human interaction earlier in the funnel, we should produce higher-quality matches with fewer ghosts, fewer bad first dates, and more relationships per 100 matches than incumbents.

### Target audience
Late-20s to mid-30s, big-city, dating-app-fatigued. **London-primary** — London is the density / seeding / marketing focus and will be the only actively seeded market for MVP. Working hypothesis for MVP copy: "London, 26–34, dating-app-fatigued, willing to pay for better signal." Final wedge audience to be locked before beta.

Other UK cities (~20, see §5 / the `MARKETS` const) are **open-for-signup but NOT yet seeded** — they exist so we don't turn people away at the door, not because we expect an active match pool there. Users outside London should not expect matches until we deliberately seed those cities. Do not invest engineering or copy in those markets ahead of London hitting the wedge metrics above.

### What success looks like for the MVP
Beta with 50–100 invited users in one London neighbourhood. We're hunting these three numbers:

- **≥75%** of matched pairs attend their scheduled Q&A
- **≥40%** of completed Q&As result in mutual unlock
- **≥20%** of unlocks lead to a first date within 14 days

Miss these and the product needs surgery, not more features. **Do not build new features before these metrics are hit.**

---

## 2. CRITICAL — Out of scope for MVP

Do not build any of the following without explicit founder approval. If a chat message asks for one, push back and reference this section.

- **AI-powered video segmentation blur** (Zoom-style). MVP uses CSS `filter: blur(24px)` only.
- Native mobile apps (iOS / Android). MVP is **responsive web**, PWA-ready.
- Reputation score / accountability score
- Q&A recap cards
- In-Q&A reactions or emoji
- Question skip / swap
- Date concierge or venue booking
- Personality snapshot questionnaire
- Profile prompt rotation
- Mood check-in or SOS escalation (basic trusted contact only)
- Referral network
- Q&A coaching tips
- Premium / paid tier
- Live location sharing
- Custom admin dashboard (use Supabase Studio directly)
- Push notifications (use email + SMS only)
- Custom analytics dashboard (use PostHog default UI)
- Internationalisation (English only, GBP only, GMT/BST only)

**If we revisit any of the above, the right home for the safety/retention ones is later in the build sequence, not onboarding:** mood check-in / SOS escalation belongs alongside Step 9 (date planning + phone reveal — the natural place for safety nudges); reputation / accountability score belongs alongside Step 10 (reporting + closing matches, where we already have the signal). Neither belongs anywhere near signup.

---

## 3. Tech stack (locked)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 + React 19 (App Router) + TypeScript | Founder-friendly hosting on Vercel; type safety reduces agent errors |
| Styling | Tailwind CSS + shadcn/ui | Matches existing prototype aesthetic |
| Database / Auth / Realtime / Storage | Supabase | One service, generous free tier, EU region |
| Video | Daily.co (prebuilt UI) | ~£0.004/min, no WebRTC to maintain |
| ID verification | Stripe Identity | £1.50/check, redirect flow |
| Transactional email | Resend | Cheap, dev-friendly |
| SMS | Twilio | For OTP, reminders, and phone reveal |
| Analytics | PostHog Cloud (EU) | Funnel analysis we need |
| Error tracking | Sentry | |
| Hosting | Vercel | |
| Cron jobs | Vercel Cron | For phone reveal, Q&A reminders |
| Package manager | pnpm | |
| Node version | 20.x LTS | |

**Do not introduce other dependencies without explicit approval.** Specifically: no ORMs (Supabase client is enough), no state libraries beyond React state + URL state, no UI library other than shadcn/ui, no auth library other than Supabase Auth.

---

## 4. Repo structure & conventions

```
/app
  /(public)             # Marketing, auth pages
  /(app)                # Authenticated app, protected layout
  /api                  # Route handlers (webhooks, cron)
/components
  /ui                   # shadcn primitives
  /screens              # Whole-screen components
/lib
  /supabase             # Supabase client + generated types
  /daily                # Daily.co helpers
  /stripe               # Stripe Identity helpers
  /twilio               # SMS helpers
  /resend               # Email templates + send helpers
  /qa                   # Q&A logic (questions, scheduling, state machine)
  /utils
/types                  # Shared TS types
/supabase
  /migrations           # SQL migrations, numbered
  /seed.sql             # Seed data for local dev
/reference              # READ-ONLY: original prototype JSX, design assets
/tests
  /e2e                  # Playwright
AGENTS.md               # This file
README.md
.env.local.example
```

**Conventions**
- Files: `kebab-case`. Components: `PascalCase`. Functions/variables: `camelCase`. DB tables/columns: `snake_case`.
- Server components by default; mark client with `'use client'`.
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`.
- One feature per branch, PR'd to `main` with a 3-line description (what / how to test / what's deliberately incomplete).
- No `any` types in production code. Use generated Supabase types.

**Testing philosophy** — agents tend to over-test. Do not write unit tests for trivial code. Required tests only:
- Q&A scheduling overlap logic (unit)
- Match creation trigger (SQL test)
- Mutual unlock gating (unit)
- One Playwright e2e covering the full core loop end-to-end

---

## 5. Data model

Postgres via Supabase. All tables have `id uuid primary key default gen_random_uuid()` and `created_at timestamptz default now()` unless noted. **RLS enabled on every user-facing table.**

### `profiles` (extends `auth.users` 1:1, created via trigger on auth signup)

> Columns marked `not null` below are the *final* shape after onboarding. Because the trigger inserts a row at phone-OTP signup — before any onboarding data exists — those columns are nullable in the schema and enforced by the onboarding flow / a "profile complete" check rather than by the DB. `id_verified`, `paused`, `created_at`, and `updated_at` are the only columns truly `not null` at the DB level.

```sql
id uuid references auth.users primary key
display_name text not null
date_of_birth date not null check (date_of_birth <= now() - interval '18 years')
gender text not null                       -- 'woman' | 'man' | 'non-binary'
seeking text[] not null                    -- subset of gender values
intention text not null                    -- 'long-term' | 'short-term' | 'figuring-it-out'
bio_prompt_key text not null               -- key into BIO_PROMPTS const
bio_answer text not null check (char_length(bio_answer) <= 200)
photos text[] not null check (array_length(photos, 1) between 2 and 6)
city text not null                         -- one of the seeded UK cities (see lib/onboarding/constants MARKETS)
neighbourhood text not null                -- must belong to the chosen city in MARKETS
id_verified boolean default false
id_verified_at timestamptz
paused boolean default false
updated_at timestamptz default now()
```

**RLS:** any authenticated user can `select` profiles where `paused = false`, plus their own row always. Users can only `update` their own row. Visibility is NOT gated on `id_verified` — that gate fires only at Q&A scheduling entry per §6.1.

### `trusted_contacts`
```sql
user_id uuid references profiles unique
name text not null
phone_e164 text not null
relationship text                          -- 'friend' | 'family' | 'other' (nullable)
```
**RLS:** users can only read/write their own.

### `swipes`
```sql
swiper_id uuid references profiles
swipee_id uuid references profiles
direction text not null                    -- 'like' | 'pass'
unique (swiper_id, swipee_id)
```
**RLS:** users can insert/select their own swipes only. Trigger creates a `matches` row when reciprocal `like` is detected.

### `matches`
```sql
user_a uuid references profiles            -- always the LOWER uuid
user_b uuid references profiles            -- always the HIGHER uuid
status text not null default 'pending_qa'  -- 'pending_qa' | 'qa_scheduled' | 'qa_complete' | 'unlocked' | 'closed'
closed_reason text                         -- 'mutual_pass' | 'a_passed' | 'b_passed' | 'expired' | 'reported'
expires_at timestamptz not null default (now() + interval '7 days')
unique (user_a, user_b)
check (user_a < user_b)
```
**RLS:** only the two users involved can `select`.

### `qa_sessions`
```sql
match_id uuid references matches unique
scheduled_at timestamptz not null
duration_minutes int not null default 10
daily_room_url text                        -- populated on confirmation
daily_room_name text                       -- populated on confirmation
questions jsonb                            -- [{id, text}, ...]; populated on confirmation
status text not null default 'scheduled'   -- 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'
proposed_at timestamptz not null default now()
proposed_by_id uuid not null references profiles
confirmed_at timestamptz                   -- null until the other participant confirms
started_at timestamptz
ended_at timestamptz
no_show_user_id uuid references profiles   -- nullable
```

**RLS:** SELECT scoped to the two participants (via the underlying match). All writes go through the service-role client — no client INSERT/UPDATE policies. The propose/confirm flow uses `proposed_at` / `proposed_by_id` / `confirmed_at` rather than a "proposed" enum state, so the row is only visible-as-scheduled once `confirmed_at IS NOT NULL`.

### `qa_outcomes`
```sql
qa_session_id uuid references qa_sessions
user_id uuid references profiles
choice text not null                       -- 'unlock' | 'pass'
submitted_at timestamptz default now()
unique (qa_session_id, user_id)
```

### `chats`
```sql
match_id uuid references matches unique
unlocked_at timestamptz default now()
```

### `messages`
```sql
chat_id uuid references chats
sender_id uuid references profiles
body text not null check (char_length(body) <= 2000)
```

### `dates`
```sql
match_id uuid references matches
venue text
scheduled_at timestamptz not null
phone_revealed_at timestamptz              -- set by cron 3h before scheduled_at
status text not null default 'confirmed'   -- 'confirmed' | 'completed' | 'cancelled' | 'no_show'
```

### `reports`
```sql
reporter_id uuid references profiles
reported_id uuid references profiles
reason text not null                       -- 'inappropriate' | 'fake' | 'unsafe' | 'no_show' | 'other'
body text
```

---

## 6. User flows

### 6.1 Onboarding (single linear flow, with editable review at the end)
1. Phone OTP (Supabase phone auth via Twilio)
2. Display name + DOB (18+ gate, server-side validated)
3. Gender + seeking
4. Photos (min 2, max 6, Supabase Storage — direct client upload to `{userId}/{uuid}.{ext}`, gated by per-folder RLS)
5. Intention (3 options)
6. Bio prompt (pick 1 of ~12 prompts, answer ≤200 chars)
7. City + neighbourhood (UK only; pick city from the seeded `MARKETS` list, then neighbourhood from that city's list)
8. Trusted contact (name + phone in E.164)
9. **Review** — summary of every section above with per-section "Edit" links. Edits round-trip back to review via `?return=review` (whitelisted in `lib/onboarding/navigation.ts`). Includes the inline ID-verification note. Not a data step; collects nothing.
10. **How-it-works explainer** (at `/onboarding/done`) — primes the core Q&A mechanic (match → 10-min live video → mutual unlock → chat). Placeholder copy, founder review pending. CTA → /discover.

Steps 2–8 each have a Back link to the previous linear step (step 1 has no Back — phone OTP is below the auth boundary). Steps 9 and 10 are flow stops, not data steps, so they're not in `ONBOARDING_STEPS` and the completeness gate doesn't track them; users who skip directly to /discover after step 8 bypass them but the trusted-contact action routes through review in the linear flow.

**ID verification is NOT part of onboarding.** Users browse and match unverified; Stripe Identity is gated separately *before the first Q&A unlocks* (see Step 3 in §10 below). This is a deliberate change from the original ordering — the rationale is that ID verification adds friction at the worst point (signup) and is only load-bearing at the first real face-to-face moment.

Block all app routes when the profile is incomplete or the trusted contact is missing. `id_verified` is checked at Q&A scheduling time, not at the app boundary.

### 6.2 Discover & swipe
Stack of profile cards (existing prototype design). One profile per card showing photos, name, age, intention badge, bio prompt + answer, neighbourhood. Swipe right = like. Swipe left = pass. Tap = expanded view. **Limit: 20 likes per 24h** (anti-spam, not monetisation).

Filter rules: only show profiles where `seeking` and `gender` overlap appropriately, where `city` matches the viewer's `city` (in-person dates require local density — never show cross-city profiles), and where there is no existing swipe row from the viewer.

### 6.3 Match
When B likes A and A has already liked B (or vice versa), both see a match modal. CTA: **"Schedule your Q&A."** Match expires in 7 days if no Q&A scheduled — set by `expires_at`, checked by cron.

### 6.4 Q&A scheduling

**Locked model.** Availability is collected once at onboarding (a 7-day, 30-min-slot grid), used as a discover filter (only show profiles whose availability overlaps the viewer's), and on match the system pre-computes **three mutual slots** biased toward the next 24–48 hours. Match expires in **48 hours** if no slot is booked.

On confirmation:
- Daily.co room created server-side
- 3 questions selected from `/lib/qa/questions.ts`, weighted toward the pair's combined intention
- Match status → `qa_scheduled`
- Calendar invites emailed to both (ICS attachment)

#### Scheduling refinements (lock these in at Step 5)

These are product decisions locked in alongside the core model above. They refine *how* slots are picked, presented, and followed through.

1. **Bias the three offered slots toward the next 24–48 hours**, not spread evenly across the week. Sooner slots convert better; interest decays fast after a match.
2. **Treat a booked slot as a real appointment, not a soft tap.** On booking, generate an add-to-calendar link (ICS) and schedule two reminders: morning-of and one hour before.
3. **Add a small commitment step at the moment of booking** — e.g. a one-line "what are you hoping to talk about?" — to increase psychological investment and follow-through.
4. **T-5 takeover, not a notification.** Five minutes before the Q&A, show both users a full-screen, ring-style "starts in 5 minutes" takeover (like an incoming call) rather than a dismissible system notification.
5. **Symmetric but gentle no-show accountability.** A no-show on a confirmed Q&A slightly deprioritises the no-show's next match in the queue; first offence is not punitive, repeated offences compound. Applied equally to both sides.
6. **Grace reschedule instead of binary show/no-show.** Offer a one-tap "running late / move 10 minutes" option within a short window around the scheduled start, so a minor delay doesn't collapse the session.

**Pre-build validation:** before the full scheduling loop is built, pressure-test the core assumption (that the wedge audience will actually attend a scheduled 10-minute live video call with a stranger) by manually matching ~10 real users and scheduling their Q&As by hand. If attendance is poor under manual conditions, the automated loop won't fix it.

#### Step 5 phasing

Step 5 is phased to honour the validation note above:

- **5a (shipped):** `qa_sessions` table + propose/confirm flow with a plain datetime picker (not the auto-computed 3-slot picker), Daily.co room on confirmation, three questions selected via `lib/qa/select.ts`, qa-scheduled email via Resend (best-effort — phone-OTP users without `auth.users.email` see details in-app at `/qa/[sessionId]`), `/qa/[sessionId]` minimal entry showing the join link. T-5 reminders, ICS, takeover, grace reschedule, no-show accountability, commitment step, SMS, onboarding availability grid, discover availability filter, 48-hour match expiry cron — **NOT in 5a.** Match expiry stays at the 7-day default until 5b's cron lands.
- **PAUSE for manual validation:** founder manually matches ~10 real users and observes attendance before building further.
- **5b (after validation):** full automated scheduling loop — onboarding availability grid (deferred from Step 2), discover availability filter, three-slot picker biased toward 24–48h, 48h match expiry cron, ICS attachments, automatic email reminders, commitment step at booking.
- **5c (after validation):** behavioural-nudge polish — T-5 ring takeover, grace reschedule, gentle no-show accountability, SMS reminders via Twilio.

The `qa_sessions` table has `proposed_at` / `proposed_by_id` / `confirmed_at` columns beyond §5's original listing — these support the propose/confirm flow without adding a "proposed" enum state. Rows are visible-as-scheduled only after `confirmed_at` is set.

### 6.5 Live Q&A (the core moment)

**Layout:**
- Both video tiles side by side on desktop, stacked on mobile
- Top bar: countdown timer + question counter (1/3, 2/3, 3/3)
- Centre overlay: current question text
- Bottom bar: mic toggle, camera toggle, leave (with confirmation)

**Session state machine:**
```
intro (30s)
  → q1_userA_speaks (90s, user A's tile clear, user B's tile blurred)
  → q1_userB_speaks (90s, user B's tile clear, user A's tile blurred)
  → q2_userA_speaks (90s)
  → q2_userB_speaks (90s)
  → q3_userA_speaks (90s)
  → q3_userB_speaks (90s)
outro (30s)
  → route both users to /qa/{sessionId}/outcome
```

Total: 10 minutes hard cap. The blur is applied via a CSS class toggled by the state machine — `filter: blur(24px)` on whoever is currently listening, **rendered locally in each user's browser** (we don't transmit a blurred stream from the server).

**Edge cases:**
- One user fails to join within 3 minutes of start → session marked `no_show`, `no_show_user_id` logged. Show-up user sees an apology screen and a "find another match" CTA.
- One user drops mid-session → session marked `completed` if both got through ≥2 questions, otherwise `cancelled`. Remaining user routed to the apology screen.
- No no-show penalties in MVP (we observe rates first before designing enforcement).

### 6.6 Outcome & mutual unlock
Each user sees a private screen: **"Would you like to keep talking to [Name]?"** Two buttons: **Unlock chat** / **Pass**.

- **5-minute decision window**, after which non-response counts as pass
- Neither user sees the other's choice until both have chosen or window expires
- Both unlock → chat opens, both emailed
- Either passes → match closes silently ("This match has closed") — **never reveal who passed**

### 6.7 Chat
Supabase realtime. Text only. No images, no voice notes, no read receipts in MVP. Prominent **"Plan a date"** CTA in the header.

### 6.8 Date planning & phone reveal
Either user proposes: venue (free text), date/time. The other confirms or counter-proposes. Once confirmed:
- `dates` row created with `scheduled_at`
- Vercel cron job runs every 5 minutes, finds dates where `scheduled_at - 3 hours <= now()` and `phone_revealed_at is null`, sends both users an SMS with the other's phone number + venue details, sets `phone_revealed_at`
- Numbers also appear in the chat header from that moment

### 6.9 Reporting & blocking
"Report" button on profile, in chat header, and on Q&A outcome screen. Form: reason dropdown + optional body. Submitting a report closes the match. Founder reviews reports manually via Supabase Studio in MVP.

---

## 7. The Q&A questions

Stored in `/lib/qa/questions.ts` as a typed const. ~30 questions, each tagged with which intention(s) it suits. Therapist review pending — these are placeholders to start.

```ts
export const QA_QUESTIONS = [
  { id: 'q01', text: "What's something you used to believe strongly that you've changed your mind on?", intentions: ['long-term', 'figuring-it-out'] },
  { id: 'q02', text: "When you imagine your life going well in two years, what's a small ordinary thing in that picture?", intentions: ['long-term'] },
  { id: 'q03', text: "What's a kind of conversation you wish you had more often?", intentions: ['long-term', 'short-term', 'figuring-it-out'] },
  { id: 'q04', text: "What's a small thing that's been on your mind this week?", intentions: ['short-term', 'figuring-it-out'] },
  { id: 'q05', text: "What does a really good Sunday look like for you?", intentions: ['short-term', 'figuring-it-out'] },
  // ... ~25 more, founder + therapist to finalise
] as const;
```

Selection logic: from the pool matching the pair's combined intentions, randomly pick 3 without repeats. Track which questions a user has seen so they don't repeat across sessions.

---

## 8. Third-party setup

### Supabase
- Project name: `intentionally-mvp`
- Region: EU (London if available)
- Phone auth enabled (Twilio configured)
- Storage bucket `profile-photos`: **public-read** bucket. Paths are `{userId}/{uuid}.{ext}` (opaque, non-enumerable). RLS on `storage.objects` restricts INSERT/UPDATE/DELETE — and the auto-added SELECT policy — to the owner's folder; public-URL reads bypass RLS so cross-user photo display works in /discover. Revisit and tighten to signed read URLs before real-user launch (so paused / deleted profiles can have photo access revoked).
- pg_cron extension enabled (for match expiry; phone reveal uses Vercel Cron instead)

### Daily.co
- Free tier covers MVP volume
- Rooms created server-side at Q&A confirmation
- Room properties:
  ```
  enable_prejoin_ui: false
  enable_chat: false
  enable_screenshare: false
  exp: scheduled_at + 15 min (epoch seconds)
  ```

### Stripe Identity
- Verification session created server-side; document-only, allows UK driving licence and passport, requires live capture and matching selfie. `metadata.user_id` is the link back to our user — we do not store Stripe session IDs in our DB.
- After Stripe's hosted UI closes, the user lands on `/verify/return`. That page reads the current `id_verified` and either shows success + Continue, or "processing — refresh in a moment" (the webhook is asynchronous; the return URL may arrive first).
- Webhook to `/api/webhooks/stripe-identity` verifies the Stripe signature, then on `identity.verification_session.verified` sets `profiles.id_verified = true`. `id_verified_at` is preserved across re-verifications so it reflects the *first* verified time.
- The gate enforcement point is the entry to Q&A scheduling (Step 5 in §10), **not** the app boundary. `lib/verification.ts` exposes `isUserVerified()` for that. Until Step 5 lands, unverified users see a "Verify ID" link in the (app) header.
- Test mode used until beta launch. Local dev uses Stripe CLI to forward events: `stripe listen --forward-to localhost:3000/api/webhooks/stripe-identity --events identity.verification_session.verified,identity.verification_session.requires_input,identity.verification_session.canceled`. The CLI prints a separate `whsec_` for local — `STRIPE_IDENTITY_WEBHOOK_SECRET` in `.env.local` holds whichever is appropriate per environment.

### Twilio
- SMS only (Supabase wraps OTP)
- Sender: UK long-code or alphanumeric sender ID
- Used for: T-5 Q&A reminder, T-3h phone reveal

### Resend
- Domain: `intentionally.app` (placeholder — founder to confirm before launch). **5a uses `onboarding@resend.dev` instead**: works without DNS verification but only delivers to the Resend account holder's email. Switch to `intentionally.app` (or whatever sender domain) before real-user beta.
- Templates planned: `welcome`, `match-created`, `qa-scheduled`, `qa-reminder-5min`, `mutual-unlock`, `phone-revealed`, `match-closed`. **5a ships only `qa-scheduled`** (plain text, placeholder copy). The rest follow in their owning steps.
- Phone-OTP users don't have an email on `auth.users` by default — the scheduling action treats sends as best-effort and surfaces the same details in-app at `/qa/[sessionId]`. Email collection at onboarding (or post-onboarding) is a 5b/beta decision.

### PostHog
- EU region. Initialised in `app/layout.tsx` (client side).

### Sentry
- Both server and client. Source maps uploaded on Vercel build.

---

## 9. Design system

The existing prototype (`/reference/intentionally-app.jsx`) is the canonical source for visual language. Pull tokens from it:

- Primary colour: from prototype `C.primary`
- Font: Plus Jakarta Sans (body), Caveat (accent)
- Border radius: generous — `rounded-2xl` default for cards, `rounded-full` for pills/buttons
- Card shadow: subtle, single layer
- Spacing: generous — this is a calm app, not a dense one

Rebuild screens as proper React components using shadcn/ui primitives, but the visual language must match the prototype. **Show the founder a screenshot comparison for each rebuilt screen before merging.**

Mobile-first. Required breakpoints: 375px, 414px, 768px, 1024px. The swipe deck and Q&A live screen need to feel native — no jank, no horizontal scrollbars, no layout shift when video tiles load.

---

## 10. Build sequence

Ship in this order. Each step is a PR. Don't start step N+1 until step N is merged and tested.

| # | Milestone | Demo to founder? |
|---|---|---|
| 1 | Scaffold + Supabase auth + protected layout + `profiles` table | |
| 2 | Onboarding flow (name/DOB, gender + seeking, photos, intention, bio prompt, neighbourhood, trusted contact, done) | |
| 3 | Stripe Identity integration — verification flow + webhook + **pre-Q&A** gate (not an onboarding step; see §6.1) | |
| 4 | Discover + swipe + match (feed, swipe action, match trigger, match modal) | ✅ |
| 5 | Q&A scheduling (availability picker, slot confirmation, Daily.co room creation, reminders) | |
| 6 | Live Q&A screen (Daily.co embed, question state machine, blur, timer, outro) | |
| 7 | Outcome + mutual unlock (private decision, chat creation, notifications) | ✅ |
| 8 | Chat (realtime messages, conversation list) | |
| 9 | Date planning + phone reveal (propose/confirm + cron) | |
| 10 | Reporting + closing matches | |
| 11 | Polish + Playwright e2e covering the full loop | ✅ Ready for beta |

---

## 11. Environment variables

Documented in `.env.local.example`. Never commit `.env.local`.

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Daily.co
DAILY_API_KEY=

# Stripe Identity
STRIPE_SECRET_KEY=
STRIPE_IDENTITY_WEBHOOK_SECRET=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Resend
RESEND_API_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# App
APP_URL=
CRON_SECRET=
```

---

## 12. Analytics events

PostHog events to instrument. **Only these events** in MVP — do not add exploratory events.

| Event | When fired | Properties |
|---|---|---|
| `signup_started` | First OTP submit | — |
| `id_verification_started` | Stripe Identity redirect | — |
| `id_verification_completed` | Webhook success | `latency_seconds` |
| `onboarding_completed` | Final onboarding step | `time_to_complete_minutes` |
| `swipe_like` / `swipe_pass` | Swipe action | `swipee_id` |
| `match_created` | Match row created | `match_id` |
| `qa_scheduled` | Both confirmed | `match_id`, `lead_time_hours` |
| `qa_reminder_sent` | T-5 SMS sent | `match_id`, `channel` |
| `qa_joined` | User joins Daily room | `match_id`, `joined_within_seconds` |
| `qa_completed` | Outro reached | `match_id`, `dropouts` |
| `qa_no_show` | One side fails to join | `match_id`, `no_show_user_id` |
| `outcome_unlock` / `outcome_pass` | Outcome submit | `match_id` |
| `chat_unlocked` | Both unlocked | `match_id`, `time_to_first_decision_seconds` |
| `first_message_sent` | First chat message | `match_id` |
| `date_proposed` | Date proposed | `match_id` |
| `date_confirmed` | Date confirmed | `match_id`, `lead_time_hours` |
| `phone_revealed` | Cron sends SMS | `match_id` |
| `report_submitted` | Report form submitted | `reason` |

---

## 13. Acceptance criteria for MVP-complete

The MVP is "done" — and ready for the first 10 friends-of-friends beta users — when **all six** are true:

1. **Two seeded test accounts (alice@test, bob@test) can complete the full loop on a single laptop:** signup → ID verified (Stripe test mode) → swipe → match → schedule Q&A → join Q&A → blur correctly toggles on whoever is listening → 10-min timer ends cleanly → both unlock → chat → propose date → confirm date → phone reveal SMS arrives at the correct time.
2. **The Playwright e2e test for that loop passes in CI.**
3. **Founder can invite a real third user via email and they can complete onboarding without dev help.**
4. **PostHog dashboard shows the full funnel** for those three users.
5. **No console errors, no TypeScript errors, no `any` types in production code.**
6. **README explains** how to run locally, how to deploy, and how to seed test data.

Only after all six are green do we open the 50–100 neighbourhood beta.

---

## 14. Working with the agent — operating instructions

- **Re-read this document at the start of every session.** It is the spec.
- **Never introduce a new dependency, library, table, or screen not listed here without asking the founder first.**
- **Prefer obvious working code over clever code.** The founder is non-technical and will read your code. Readability beats brevity. Comments explain *why*, not *what*.
- **After each change**, run `pnpm typecheck` and `pnpm lint` and fix issues before declaring done.
- **PR descriptions in 3 lines**: what it does / what to test / what's deliberately incomplete.
- **When uncertain about UX, ask.** Constraints in this product are deliberate — assume any UX you'd "obviously" add (badges, points, streaks, scores, hearts, swipe limits beyond the stated 20/day) is intentionally absent.
- **Never add features from section 2 (Out of Scope)** even if a chat instruction asks for them in isolation — surface the conflict to the founder first.
- **Treat `/reference` as read-only.** Do not import from it.

---

End of brief.
