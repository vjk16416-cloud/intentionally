import {
  CalendarDays,
  CheckCircle2,
  Heart,
  LogIn,
  MessageSquareText,
  MousePointerClick,
  Send,
  Sparkles,
  Timer,
  UserRoundCheck,
  UsersRound,
  XCircle,
} from "lucide-react";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

type AnalyticsMetricKey =
  | "loginClicked"
  | "onboardingStarted"
  | "onboardingCompleted"
  | "profileLiked"
  | "profilePassed"
  | "matchCreated"
  | "scheduleClicked"
  | "qaStarted"
  | "qaFinished"
  | "qaContinueClicked"
  | "qaPassPrivatelyClicked"
  | "chatMessageSent"
  | "datePlanShared";

type AnalyticsMetric = {
  key: AnalyticsMetricKey;
  label: string;
  value: number;
  helper: string;
  icon: ComponentType<{ className?: string }>;
};

type FunnelStep = {
  label: string;
  value: number;
};

type AnalyticsRange = {
  label: string;
  caption: string;
  metrics: AnalyticsMetric[];
  funnel: FunnelStep[];
};

type RagStatus = "Good" | "Watch" | "Needs attention";

type RecommendedAction = {
  label: string;
  title: string;
  why: string;
  suggestedAction: string;
  status: RagStatus;
};

const last7Days: AnalyticsRange = {
  label: "Last 7 days",
  caption: "Mock data until the PostHog API is connected.",
  metrics: [
    {
      key: "loginClicked",
      label: "Login clicks",
      value: 42,
      helper: "login_clicked",
      icon: LogIn,
    },
    {
      key: "onboardingStarted",
      label: "Onboarding started",
      value: 31,
      helper: "onboarding_started",
      icon: UserRoundCheck,
    },
    {
      key: "onboardingCompleted",
      label: "Onboarding completed",
      value: 24,
      helper: "onboarding_completed",
      icon: CheckCircle2,
    },
    {
      key: "profileLiked",
      label: "Likes",
      value: 118,
      helper: "profile_liked",
      icon: Heart,
    },
    {
      key: "profilePassed",
      label: "Passes",
      value: 76,
      helper: "profile_passed",
      icon: XCircle,
    },
    {
      key: "matchCreated",
      label: "Matches",
      value: 19,
      helper: "match_created",
      icon: UsersRound,
    },
    {
      key: "scheduleClicked",
      label: "Schedule clicks",
      value: 15,
      helper: "schedule_clicked",
      icon: CalendarDays,
    },
    {
      key: "qaStarted",
      label: "Q&A started",
      value: 10,
      helper: "qa_started",
      icon: Timer,
    },
    {
      key: "qaFinished",
      label: "Q&A finished",
      value: 8,
      helper: "qa_finished",
      icon: Sparkles,
    },
    {
      key: "qaContinueClicked",
      label: "Continue clicked",
      value: 5,
      helper: "qa_continue_clicked",
      icon: CheckCircle2,
    },
    {
      key: "qaPassPrivatelyClicked",
      label: "Pass privately clicked",
      value: 3,
      helper: "qa_pass_privately_clicked",
      icon: XCircle,
    },
    {
      key: "chatMessageSent",
      label: "Chat messages sent",
      value: 28,
      helper: "chat_message_sent",
      icon: MessageSquareText,
    },
    {
      key: "datePlanShared",
      label: "Date plans shared",
      value: 4,
      helper: "date_plan_shared",
      icon: Send,
    },
  ],
  funnel: [
    { label: "Login clicks", value: 42 },
    { label: "Onboarding completed", value: 24 },
    { label: "Likes", value: 118 },
    { label: "Matches", value: 19 },
    { label: "Schedule clicks", value: 15 },
    { label: "Q&A started", value: 10 },
    { label: "Q&A finished", value: 8 },
    { label: "Chat messages sent", value: 28 },
    { label: "Date plans shared", value: 4 },
  ],
};

const last30Days: AnalyticsRange = {
  label: "Last 30 days",
  caption: "Mock data until the PostHog API is connected.",
  metrics: [
    { ...last7Days.metrics[0], value: 184 },
    { ...last7Days.metrics[1], value: 136 },
    { ...last7Days.metrics[2], value: 97 },
    { ...last7Days.metrics[3], value: 463 },
    { ...last7Days.metrics[4], value: 291 },
    { ...last7Days.metrics[5], value: 64 },
    { ...last7Days.metrics[6], value: 47 },
    { ...last7Days.metrics[7], value: 33 },
    { ...last7Days.metrics[8], value: 27 },
    { ...last7Days.metrics[9], value: 18 },
    { ...last7Days.metrics[10], value: 9 },
    { ...last7Days.metrics[11], value: 104 },
    { ...last7Days.metrics[12], value: 14 },
  ],
  funnel: [
    { label: "Login clicks", value: 184 },
    { label: "Onboarding completed", value: 97 },
    { label: "Likes", value: 463 },
    { label: "Matches", value: 64 },
    { label: "Schedule clicks", value: 47 },
    { label: "Q&A started", value: 33 },
    { label: "Q&A finished", value: 27 },
    { label: "Chat messages sent", value: 104 },
    { label: "Date plans shared", value: 14 },
  ],
};

const analyticsRanges = [last7Days, last30Days];

function isEmptyRange(range: AnalyticsRange) {
  return range.metrics.every((metric) => metric.value === 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function conversionRate(current: number, previous: number) {
  if (previous === 0) return 0;

  return Math.round((current / previous) * 100);
}

function dropOffRate(current: number, previous: number) {
  if (previous === 0) return 0;

  return Math.max(0, 100 - conversionRate(current, previous));
}

function metricStatus(metric: AnalyticsMetric): RagStatus {
  if (metric.key === "datePlanShared" || metric.key === "qaPassPrivatelyClicked") {
    return metric.value > 0 ? "Watch" : "Needs attention";
  }

  if (metric.value >= 20) return "Good";
  if (metric.value >= 8) return "Watch";

  return "Needs attention";
}

function statusClassName(status: RagStatus) {
  if (status === "Good") {
    return "bg-[#e2e8dc] text-[#2f3a2b]";
  }

  if (status === "Watch") {
    return "bg-[#f1dfbd] text-[#6a4b16]";
  }

  return "bg-[#efd0ca] text-[#7a2118]";
}

function getBiggestDropOff(steps: FunnelStep[]) {
  return steps.slice(1).reduce(
    (biggest, step, index) => {
      const previous = steps[index];
      const dropOff = dropOffRate(step.value, previous.value);

      if (dropOff > biggest.dropOff) {
        return {
          from: previous.label,
          to: step.label,
          dropOff,
        };
      }

      return biggest;
    },
    { from: steps[0]?.label ?? "Start", to: steps[1]?.label ?? "Next", dropOff: 0 },
  );
}

function getStrongestEngagementSignal(range: AnalyticsRange) {
  const qaFinished =
    range.metrics.find((metric) => metric.key === "qaFinished")?.value ?? 0;
  const chatMessages =
    range.metrics.find((metric) => metric.key === "chatMessageSent")?.value ?? 0;
  const datePlans =
    range.metrics.find((metric) => metric.key === "datePlanShared")?.value ?? 0;

  if (qaFinished > 0 && chatMessages / qaFinished >= 3) {
    return {
      label: "Chat depth after Q&A",
      detail: `${formatNumber(chatMessages)} chat messages from ${formatNumber(
        qaFinished,
      )} completed Q&As.`,
      status: "Good" as const,
    };
  }

  if (datePlans > 0) {
    return {
      label: "Date planning intent",
      detail: `${formatNumber(datePlans)} shared date plans after chat unlock.`,
      status: "Watch" as const,
    };
  }

  return {
    label: "No strong post-Q&A signal yet",
    detail: "Completed Q&As have not turned into enough chat or date intent.",
    status: "Needs attention" as const,
  };
}

function MetricCard({ metric }: { metric: AnalyticsMetric }) {
  const Icon = metric.icon;
  const status = metricStatus(metric);

  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {metric.label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {formatNumber(metric.value)}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold",
            statusClassName(status),
          )}
        >
          {status}
        </span>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
          {metric.helper}
        </span>
      </div>
    </article>
  );
}

function FounderSummary({ range }: { range: AnalyticsRange }) {
  const biggestDropOff = getBiggestDropOff(range.funnel);
  const engagementSignal = getStrongestEngagementSignal(range);
  const loginClicks =
    range.metrics.find((metric) => metric.key === "loginClicked")?.value ?? 0;
  const onboardingCompleted =
    range.metrics.find((metric) => metric.key === "onboardingCompleted")
      ?.value ?? 0;
  const matches =
    range.metrics.find((metric) => metric.key === "matchCreated")?.value ?? 0;
  const scheduleClicks =
    range.metrics.find((metric) => metric.key === "scheduleClicked")?.value ??
    0;
  const qaFinished =
    range.metrics.find((metric) => metric.key === "qaFinished")?.value ?? 0;

  const insights = [
    `${conversionRate(
      onboardingCompleted,
      loginClicks,
    )}% of login clicks are becoming completed onboarding profiles.`,
    `${formatNumber(matches)} matches led to ${formatNumber(
      scheduleClicks,
    )} schedule clicks, so match intent is converting into Q&A planning.`,
    `${formatNumber(qaFinished)} Q&As were finished; this is the core quality signal to watch before adding features.`,
    `Biggest leak: ${biggestDropOff.from} → ${biggestDropOff.to} has ${biggestDropOff.dropOff}% drop-off.`,
  ];
  const recommendedActions: RecommendedAction[] = [
    {
      label: "Highest priority fix",
      title: "Reduce the Q&A scheduling leak",
      why: "Users are showing interest through likes and matches, but fewer are making it into a booked Q&A.",
      suggestedAction:
        "Review the scheduling screen copy and default slot choices before adding new funnel steps.",
      status: "Needs attention",
    },
    {
      label: "Best growth opportunity",
      title: "Turn completed onboarding into first likes",
      why: "Completed profiles are the closest audience to activation, and profile likes are the first visible intent signal.",
      suggestedAction:
        "Prompt newly onboarded users to like three profiles during their first discover session.",
      status: "Watch",
    },
    {
      label: "Best product learning question",
      title: "Do finished Q&As create enough post-call intent?",
      why: "The MVP thesis depends on completed Q&As leading to chat depth and date planning.",
      suggestedAction:
        "Ask beta users who finished a Q&A what made them continue, pass, or hesitate.",
      status: "Good",
    },
  ];

  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Founder summary
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            What is happening right now
          </h2>
        </div>
        <span className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
          {range.label}
        </span>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="rounded-[1.25rem] bg-background p-4">
          <p className="text-sm font-semibold">Plain-English readout</p>
          <ul className="mt-3 space-y-2">
            {insights.map((insight) => (
              <li
                key={insight}
                className="flex gap-2 text-sm leading-6 text-muted-foreground"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        <SummarySignalCard
          title="Biggest drop-off"
          label={`${biggestDropOff.from} → ${biggestDropOff.to}`}
          detail={`${biggestDropOff.dropOff}% drop-off between these steps.`}
          status={biggestDropOff.dropOff >= 55 ? "Needs attention" : "Watch"}
        />

        <SummarySignalCard
          title="Strongest engagement signal"
          label={engagementSignal.label}
          detail={engagementSignal.detail}
          status={engagementSignal.status}
        />
      </div>

      <div className="mt-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Recommended next actions
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight">
              What to do next
            </h3>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Static recommendations for now, designed to become data-driven when
            the PostHog API is connected.
          </p>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {recommendedActions.map((action) => (
            <RecommendedActionCard key={action.label} action={action} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RecommendedActionCard({ action }: { action: RecommendedAction }) {
  return (
    <article className="rounded-[1.25rem] bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {action.label}
        </p>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            statusClassName(action.status),
          )}
        >
          {action.status}
        </span>
      </div>
      <h4 className="mt-4 text-lg font-semibold tracking-tight">
        {action.title}
      </h4>
      <p className="mt-3 text-sm font-semibold">Why it matters</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {action.why}
      </p>
      <p className="mt-3 text-sm font-semibold">Suggested action</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {action.suggestedAction}
      </p>
    </article>
  );
}

function SummarySignalCard({
  title,
  label,
  detail,
  status,
}: {
  title: string;
  label: string;
  detail: string;
  status: RagStatus;
}) {
  return (
    <article className="rounded-[1.25rem] bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            statusClassName(status),
          )}
        >
          {status}
        </span>
      </div>
      <p className="mt-4 text-xl font-semibold tracking-tight">{label}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </article>
  );
}

function EmptyAnalyticsState({ label }: { label: string }) {
  return (
    <section className="rounded-[1.75rem] border border-dashed border-border bg-card/70 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <MousePointerClick className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight">
        No analytics yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        There are no recorded product actions for {label}. Once events arrive,
        this section will show the funnel, cards, and drop-off rates.
      </p>
    </section>
  );
}

function FunnelPanel({ steps }: { steps: FunnelStep[] }) {
  const baseline = Math.max(...steps.map((step) => step.value), 1);

  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Conversion funnel
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Login → Onboarding → Like → Match → Schedule → Q&A → Chat → Date
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Drop-off shown from previous step
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {steps.map((step, index) => {
          const previous = steps[index - 1];
          const width = Math.max(6, Math.round((step.value / baseline) * 100));
          const dropOff = previous ? dropOffRate(step.value, previous.value) : 0;

          return (
            <div key={step.label} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{step.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {previous
                      ? `${dropOff}% drop-off from ${previous.label}`
                      : "Funnel entry"}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatNumber(step.value)}
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RangeSection({ range }: { range: AnalyticsRange }) {
  if (isEmptyRange(range)) {
    return <EmptyAnalyticsState label={range.label.toLowerCase()} />;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {range.label}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{range.caption}</p>
        </div>
        <div className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm">
          {formatNumber(
            range.metrics.reduce((total, metric) => total + metric.value, 0),
          )}{" "}
          actions
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {range.metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </div>

      <FunnelPanel steps={range.funnel} />
    </section>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="rounded-[2rem] border border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Founder analytics
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Product Analytics
              </h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                A focused MVP view of the action events currently tracked in
                PostHog. Values shown here are static placeholders until the
                PostHog API is connected.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] border border-border bg-background p-2 text-sm font-semibold shadow-sm sm:flex">
              <a
                href="#last-7-days"
                className="rounded-2xl bg-accent px-4 py-3 text-center text-accent-foreground"
              >
                Last 7 days
              </a>
              <a
                href="#last-30-days"
                className="rounded-2xl px-4 py-3 text-center text-muted-foreground hover:bg-muted"
              >
                Last 30 days
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            {
              label: "Data source",
              value: "Mock",
              helper: "No PostHog API secrets are used in this page.",
            },
            {
              label: "Privacy",
              value: "Event counts only",
              helper: "No names, messages, answers, emails, or phone numbers.",
            },
            {
              label: "Scope",
              value: "Button actions",
              helper: "Matches the explicit MVP analytics event list.",
            },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight">
                {item.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.helper}
              </p>
            </article>
          ))}
        </section>

        <FounderSummary range={last7Days} />

        {analyticsRanges.map((range) => (
          <div
            key={range.label}
            id={range.label === "Last 7 days" ? "last-7-days" : "last-30-days"}
            className={cn("scroll-mt-6", "space-y-5")}
          >
            <RangeSection range={range} />
          </div>
        ))}
      </div>
    </main>
  );
}
