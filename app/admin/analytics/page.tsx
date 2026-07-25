import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  HeartHandshake,
  MessageSquareText,
  ShieldCheck,
  Video,
} from "lucide-react";

import {
  buildFunnel,
  isEmptyAnalyticsRange,
  percentage,
  type AnalyticsRangeKey,
} from "@/lib/analytics/dashboard";
import {
  getPostHogDashboardCounts,
  type DashboardEventKey,
  type PostHogDashboardCounts,
} from "@/lib/posthog/server";

export const dynamic = "force-dynamic";

const numberFormatter = new Intl.NumberFormat("en-GB");

type MetricCardProps = {
  title: string;
  value: number | null;
  detail: string;
  icon: typeof Video;
};

function formatCount(value: number) {
  return numberFormatter.format(value);
}

function formatPercentage(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

function MetricCard({ title, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {formatPercentage(value)}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{detail}</p>
    </article>
  );
}

function CountCard({
  title,
  value,
  detail,
  unavailable = false,
}: {
  title: string;
  value?: number;
  detail: string;
  unavailable?: boolean;
}) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">
        {unavailable ? "Unavailable" : formatCount(value ?? 0)}
      </p>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{detail}</p>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function eventCount(
  counts: PostHogDashboardCounts,
  key: DashboardEventKey,
  range: AnalyticsRangeKey,
) {
  return counts[key][range];
}

function Dashboard({ counts, range }: { counts: PostHogDashboardCounts; range: AnalyticsRangeKey }) {
  const funnel = buildFunnel(counts, range);
  const scheduled = eventCount(counts, "scheduleConfirmed", range);
  const started = eventCount(counts, "qaStarted", range);
  const completed = eventCount(counts, "qaCompleted", range);
  const mutualContinue = eventCount(counts, "mutualContinue", range);
  const chatUnlocked = eventCount(counts, "chatUnlocked", range);
  const datePlans = eventCount(counts, "datePlanCreated", range);
  const showUpRate = percentage(started, scheduled);
  const completionRate = percentage(completed, started);
  const mutualContinueRate = percentage(mutualContinue, completed);
  const chatUnlockRate = percentage(chatUnlocked, mutualContinue);
  const datePlanCreationRate = percentage(datePlans, chatUnlocked);

  return (
    <>
      <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
        <SectionHeading eyebrow="Private beta health" title="Meaningful journey progress">
          Event counts for the selected 30-day window. These are journey actions,
          not time-spent or engagement targets.
        </SectionHeading>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard title="Vibe Check show-up" value={showUpRate} detail={`${formatCount(started)} started from ${formatCount(scheduled)} confirmed.`} icon={Video} />
          <MetricCard title="Vibe Check completion" value={completionRate} detail={`${formatCount(completed)} completed from ${formatCount(started)} started.`} icon={CheckCircle2} />
          <MetricCard title="Mutual Continue" value={mutualContinueRate} detail={`${formatCount(mutualContinue)} mutual outcomes from ${formatCount(completed)} completed.`} icon={HeartHandshake} />
          <MetricCard title="Chat unlock" value={chatUnlockRate} detail={`${formatCount(chatUnlocked)} chats unlocked after mutual Continue.`} icon={MessageSquareText} />
          <MetricCard title="Date-plan creation" value={datePlanCreationRate} detail={`${formatCount(datePlans)} first preferences created after chat unlock.`} icon={CalendarDays} />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
        <SectionHeading eyebrow="Funnel" title="The locked MVP journey">
          Each stage uses its confirmed outcome. A dash means there was no prior-stage activity from which to calculate a rate.
        </SectionHeading>
        <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {funnel.map((step, index) => (
            <li key={step.key} className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{index + 1}. {step.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{formatCount(step.value)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {index === 0 ? "First measured step" : `${formatPercentage(step.conversion)} from previous step`}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
        <SectionHeading eyebrow="Vibe Check health" title="Show-up, completion and recovery">
          The dashboard records confirmed starts and completions. Cancellation and no-show data remain unavailable until the application records those state changes.
        </SectionHeading>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CountCard title="Sessions confirmed" value={scheduled} detail="Confirmed schedule outcomes." />
          <CountCard title="Sessions started" value={started} detail="Recorded once when a confirmed session starts." />
          <CountCard title="Sessions completed" value={completed} detail="Recorded once when an in-progress session completes." />
          <CountCard title="Cancelled or no-show" detail="No state-transition instrumentation is currently available." unavailable />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
        <SectionHeading eyebrow="Safety" title="Safety workflow visibility">
          Safety remains a product priority. This dashboard does not present a zero as evidence of safety when the underlying reporting workflow is unavailable.
        </SectionHeading>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <CountCard title="Safety reports" detail="Reporting is not implemented in the current product flow." unavailable />
          <CountCard title="Unresolved incidents" detail="Incident tracking and resolution are not implemented in the current product flow." unavailable />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
        <SectionHeading eyebrow="Operational failures" title="Where the journey cannot continue">
          Counts are captured without message content, Q&A answers, contact details or private decision reasoning.
        </SectionHeading>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CountCard title="Scheduling failures" value={eventCount(counts, "scheduleFailed", range)} detail="Video-room reservation or confirmation failures." />
          <CountCard title="Connection failures" value={eventCount(counts, "qaConnectionFailed", range)} detail="Q&A connection failures reported by the client." />
          <CountCard title="Media permission failures" value={eventCount(counts, "qaMediaPermissionFailed", range)} detail="Camera or microphone permission failures." />
          <CountCard title="Verification failures" value={eventCount(counts, "verificationFailed", range)} detail="Identity-verification failures reported by the provider." />
        </div>
      </section>
    </>
  );
}

export default async function FounderAnalyticsPage() {
  const posthog = await getPostHogDashboardCounts();

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Founder analytics</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Private beta health</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              A focused view of the locked MVP journey: onboarding through safety. It contains aggregate product-learning data only.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Founder-only route
          </span>
        </div>
      </header>

      {posthog.status === "unavailable" ? (
        <section className="rounded-[1.75rem] border border-amber-600/30 bg-amber-50 p-5 text-amber-950 shadow-sm sm:p-6" role="status">
          <div className="flex gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Source unavailable</h2>
              <p className="mt-2 text-sm leading-6">{posthog.message}</p>
              <p className="mt-2 text-sm leading-6">No metrics are shown as zero while the source is unavailable.</p>
            </div>
          </div>
        </section>
      ) : isEmptyAnalyticsRange(posthog.counts, "last30Days") ? (
        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6" role="status">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">No private-beta activity yet</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">PostHog is connected, but no tracked Founder Analytics v1 events were received in the last 30 days.</p>
            </div>
          </div>
        </section>
      ) : (
        <Dashboard counts={posthog.counts} range="last30Days" />
      )}

      <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
        <SectionHeading eyebrow="Data quality" title="Interpret the dashboard carefully">
          PostHog provides the active 30-day event source. Existing historical aliases are read for continuity; all new captures use the canonical event names. Clarity is not used as a dashboard data source and is disabled unless explicitly enabled. Recording masking, retention and consent remain Founder decisions and must be confirmed before private beta.
        </SectionHeading>
      </section>
    </main>
  );
}
