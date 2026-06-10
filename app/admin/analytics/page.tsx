import {
  CalendarDays,
  CheckCircle2,
  Eye,
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

import {
  getPostHogDashboardCounts,
  type DashboardEventKey,
  type PostHogDashboardCounts,
  type PostHogDashboardResult,
} from "@/lib/posthog/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AnalyticsMetric = {
  key: DashboardEventKey;
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

type FunnelTransition = {
  from: string;
  to: string;
  previousValue: number;
  currentValue: number;
  conversion: number;
  dropOff: number;
};

type HealthMetric = {
  label: string;
  value: number;
  detail: string;
  status: RagStatus;
};

const metricConfig = [
  {
    key: "loginClicked",
    label: "Login clicks",
    helper: "login_clicked",
    icon: LogIn,
  },
  {
    key: "onboardingStarted",
    label: "Onboarding started",
    helper: "onboarding_started",
    icon: UserRoundCheck,
  },
  {
    key: "onboardingCompleted",
    label: "Onboarding completed",
    helper: "onboarding_completed",
    icon: CheckCircle2,
  },
  {
    key: "discoverViewed",
    label: "Discover views",
    helper: "discover_viewed",
    icon: Eye,
  },
  {
    key: "profileLiked",
    label: "Likes",
    helper: "profile_liked",
    icon: Heart,
  },
  {
    key: "profilePassed",
    label: "Passes",
    helper: "profile_passed",
    icon: XCircle,
  },
  {
    key: "matchCreated",
    label: "Matches",
    helper: "match_created",
    icon: UsersRound,
  },
  {
    key: "scheduleClicked",
    label: "Schedule clicks",
    helper: "schedule_clicked",
    icon: CalendarDays,
  },
  {
    key: "datePlanViewed",
    label: "Date plan views",
    helper: "date_plan_viewed",
    icon: CalendarDays,
  },
  {
    key: "qaStarted",
    label: "Q&A started",
    helper: "qa_started",
    icon: Timer,
  },
  {
    key: "visibilitySelected",
    label: "Visibility selected",
    helper: "visibility_selected",
    icon: Eye,
  },
  {
    key: "qaQuestionAnswered",
    label: "Questions answered",
    helper: "qa_question_answered",
    icon: MessageSquareText,
  },
  {
    key: "qaFinished",
    label: "Q&A finished",
    helper: "qa_finished",
    icon: Sparkles,
  },
  {
    key: "continueSelected",
    label: "Continue selected",
    helper: "continue_selected",
    icon: CheckCircle2,
  },
  {
    key: "passPrivatelySelected",
    label: "Pass privately selected",
    helper: "pass_privately_selected",
    icon: XCircle,
  },
  {
    key: "chatSent",
    label: "Chat messages sent",
    helper: "chat_sent",
    icon: MessageSquareText,
  },
  {
    key: "datePlanShared",
    label: "Date plans shared",
    helper: "date_plan_shared",
    icon: Send,
  },
] as const satisfies readonly Omit<AnalyticsMetric, "value">[];

const funnelConfig = [
  ["loginClicked", "Login clicks"],
  ["onboardingCompleted", "Onboarding completed"],
  ["discoverViewed", "Discover views"],
  ["profileLiked", "Likes"],
  ["matchCreated", "Matches"],
  ["scheduleClicked", "Schedule clicks"],
  ["datePlanViewed", "Date plan views"],
  ["qaStarted", "Q&A started"],
  ["visibilitySelected", "Visibility selected"],
  ["qaQuestionAnswered", "Questions answered"],
  ["qaFinished", "Q&A finished"],
  ["chatSent", "Chat messages sent"],
  ["datePlanShared", "Date plans shared"],
] as const satisfies readonly [DashboardEventKey, string][];

function buildAnalyticsRange({
  label,
  caption,
  counts,
  countKey,
}: {
  label: string;
  caption: string;
  counts: PostHogDashboardCounts;
  countKey: "last7Days" | "last30Days";
}): AnalyticsRange {
  const metrics = metricConfig.map((metric) => ({
    ...metric,
    value: counts[metric.key][countKey],
  }));

  return {
    label,
    caption,
    metrics,
    funnel: funnelConfig.map(([key, stepLabel]) => ({
      label: stepLabel,
      value: counts[key][countKey],
    })),
  };
}

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

function statusClassName(status: RagStatus) {
  if (status === "Good") {
    return "bg-[#e2e8dc] text-[#2f3a2b]";
  }

  if (status === "Watch") {
    return "bg-[#f1dfbd] text-[#6a4b16]";
  }

  return "bg-[#efd0ca] text-[#7a2118]";
}

function getMetricValue(range: AnalyticsRange, key: DashboardEventKey) {
  return range.metrics.find((metric) => metric.key === key)?.value ?? 0;
}

function rateStatus(value: number, good: number, watch: number): RagStatus {
  if (value >= good) return "Good";
  if (value >= watch) return "Watch";

  return "Needs attention";
}

function productHealthStatus(metrics: HealthMetric[]): RagStatus {
  if (metrics.some((metric) => metric.status === "Needs attention")) {
    return "Needs attention";
  }

  if (metrics.some((metric) => metric.status === "Watch")) {
    return "Watch";
  }

  return "Good";
}

function getFunnelTransitions(steps: FunnelStep[]): FunnelTransition[] {
  return steps.slice(1).map((step, index) => {
    const previous = steps[index];
    const conversion = conversionRate(step.value, previous.value);

    return {
      from: previous.label,
      to: step.label,
      previousValue: previous.value,
      currentValue: step.value,
      conversion,
      dropOff: Math.max(0, 100 - conversion),
    };
  });
}

function getBiggestDropOff(steps: FunnelStep[]) {
  return getFunnelTransitions(steps).reduce(
    (biggest, transition) =>
      transition.dropOff > biggest.dropOff ? transition : biggest,
    {
      from: steps[0]?.label ?? "Start",
      to: steps[1]?.label ?? "Next",
      previousValue: steps[0]?.value ?? 0,
      currentValue: steps[1]?.value ?? 0,
      conversion: 0,
      dropOff: 0,
    },
  );
}

function getStrongestEngagementSignal(range: AnalyticsRange) {
  const qaFinished =
    range.metrics.find((metric) => metric.key === "qaFinished")?.value ?? 0;
  const chatMessages =
    range.metrics.find((metric) => metric.key === "chatSent")?.value ?? 0;
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

function getHealthMetrics(range: AnalyticsRange): HealthMetric[] {
  const loginClicks = getMetricValue(range, "loginClicked");
  const onboardingCompleted = getMetricValue(range, "onboardingCompleted");
  const discoverViews = getMetricValue(range, "discoverViewed");
  const likes = getMetricValue(range, "profileLiked");
  const matches = getMetricValue(range, "matchCreated");
  const scheduleClicks = getMetricValue(range, "scheduleClicked");
  const datePlanViews = getMetricValue(range, "datePlanViewed");
  const qaStarted = getMetricValue(range, "qaStarted");
  const visibilitySelected = getMetricValue(range, "visibilitySelected");
  const qaQuestionAnswered = getMetricValue(range, "qaQuestionAnswered");
  const qaFinished = getMetricValue(range, "qaFinished");
  const continueSelected = getMetricValue(range, "continueSelected");
  const passPrivatelySelected = getMetricValue(range, "passPrivatelySelected");
  const chatMessages = getMetricValue(range, "chatSent");
  const datePlans = getMetricValue(range, "datePlanShared");

  const onboarding = conversionRate(onboardingCompleted, loginClicks);
  const discoverToLike = conversionRate(likes, discoverViews);
  const likeToMatch = conversionRate(matches, likes);
  const matchToSchedule = conversionRate(scheduleClicks, matches);
  const scheduleToDatePlanView = conversionRate(datePlanViews, scheduleClicks);
  const qaVisibility = conversionRate(visibilitySelected, qaStarted);
  const qaAnswerRate = conversionRate(qaQuestionAnswered, qaStarted);
  const qaCompletion = conversionRate(qaFinished, qaStarted);
  const decisionTotal = continueSelected + passPrivatelySelected;
  const continueRate =
    decisionTotal === 0 ? 0 : conversionRate(continueSelected, decisionTotal);
  const chatActivation = conversionRate(chatMessages, qaFinished);
  const datePlanShare = conversionRate(datePlans, chatMessages);

  return [
    {
      label: "Onboarding completion",
      value: onboarding,
      detail: `${formatNumber(onboardingCompleted)} completed from ${formatNumber(
        loginClicks,
      )} login clicks.`,
      status: rateStatus(onboarding, 75, 55),
    },
    {
      label: "Discover engagement",
      value: discoverToLike,
      detail: `${formatNumber(likes)} likes from ${formatNumber(
        discoverViews,
      )} Discover views.`,
      status: rateStatus(discoverToLike, 25, 10),
    },
    {
      label: "Like to match rate",
      value: likeToMatch,
      detail: `${formatNumber(matches)} matches from ${formatNumber(likes)} likes.`,
      status: rateStatus(likeToMatch, 25, 12),
    },
    {
      label: "Match to schedule rate",
      value: matchToSchedule,
      detail: `${formatNumber(scheduleClicks)} schedule clicks from ${formatNumber(
        matches,
      )} matches.`,
      status: rateStatus(matchToSchedule, 65, 40),
    },
    {
      label: "Date plan interest",
      value: scheduleToDatePlanView,
      detail: `${formatNumber(datePlanViews)} date plan views from ${formatNumber(
        scheduleClicks,
      )} schedule clicks.`,
      status: rateStatus(scheduleToDatePlanView, 70, 35),
    },
    {
      label: "Visibility selection rate",
      value: qaVisibility,
      detail: `${formatNumber(visibilitySelected)} visibility selections from ${formatNumber(
        qaStarted,
      )} Q&As started.`,
      status: rateStatus(qaVisibility, 90, 60),
    },
    {
      label: "Q&A answer rate",
      value: qaAnswerRate,
      detail: `${formatNumber(qaQuestionAnswered)} questions answered from ${formatNumber(
        qaStarted,
      )} Q&As started.`,
      status: rateStatus(qaAnswerRate, 75, 50),
    },
    {
      label: "Q&A completion rate",
      value: qaCompletion,
      detail: `${formatNumber(qaFinished)} finished from ${formatNumber(
        qaStarted,
      )} Q&As started.`,
      status: rateStatus(qaCompletion, 75, 55),
    },
    {
      label: "Continue rate",
      value: continueRate,
      detail: `${formatNumber(continueSelected)} Continue selections and ${formatNumber(
        passPrivatelySelected,
      )} Pass privately selections.`,
      status: rateStatus(continueRate, 65, 40),
    },
    {
      label: "Chat activation rate",
      value: chatActivation,
      detail: `${formatNumber(chatMessages)} chat messages after ${formatNumber(
        qaFinished,
      )} finished Q&As.`,
      status: rateStatus(chatActivation, 100, 40),
    },
    {
      label: "Date plan share rate",
      value: datePlanShare,
      detail: `${formatNumber(datePlans)} date plans from ${formatNumber(
        chatMessages,
      )} chat messages.`,
      status: rateStatus(datePlanShare, 20, 8),
    },
  ];
}

function HealthCard({ metric }: { metric: HealthMetric }) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {metric.label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {metric.value}%
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            statusClassName(metric.status),
          )}
        >
          {metric.status}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {metric.detail}
      </p>
    </article>
  );
}

function FounderSummary({ range }: { range: AnalyticsRange }) {
  const biggestDropOff = getBiggestDropOff(range.funnel);
  const engagementSignal = getStrongestEngagementSignal(range);
  const healthMetrics = getHealthMetrics(range);
  const healthStatus = productHealthStatus(healthMetrics);
  const loginClicks =
    range.metrics.find((metric) => metric.key === "loginClicked")?.value ?? 0;
  const onboardingCompleted =
    range.metrics.find((metric) => metric.key === "onboardingCompleted")
      ?.value ?? 0;
  const discoverViews =
    range.metrics.find((metric) => metric.key === "discoverViewed")?.value ?? 0;
  const visibilitySelected =
    range.metrics.find((metric) => metric.key === "visibilitySelected")
      ?.value ?? 0;
  const qaQuestionAnswered =
    range.metrics.find((metric) => metric.key === "qaQuestionAnswered")
      ?.value ?? 0;
  const matches =
    range.metrics.find((metric) => metric.key === "matchCreated")?.value ?? 0;
  const scheduleClicks =
    range.metrics.find((metric) => metric.key === "scheduleClicked")?.value ??
    0;
  const qaFinished =
    range.metrics.find((metric) => metric.key === "qaFinished")?.value ?? 0;
  const continueSelected =
    range.metrics.find((metric) => metric.key === "continueSelected")
      ?.value ?? 0;
  const passPrivatelySelected =
    range.metrics.find((metric) => metric.key === "passPrivatelySelected")
      ?.value ?? 0;
  const chatSent =
    range.metrics.find((metric) => metric.key === "chatSent")?.value ?? 0;
  const datePlanViewed =
    range.metrics.find((metric) => metric.key === "datePlanViewed")?.value ?? 0;
  const decisionTotal = continueSelected + passPrivatelySelected;
  const continueRate =
    decisionTotal === 0 ? 0 : conversionRate(continueSelected, decisionTotal);

  const insights = [
    `${conversionRate(
      onboardingCompleted,
      loginClicks,
    )}% of login clicks are becoming completed onboarding profiles.`,
    `${conversionRate(
      matches,
      discoverViews,
    )}% of Discover views are turning into matches.`,
    `${formatNumber(matches)} matches led to ${formatNumber(
      scheduleClicks,
    )} schedule clicks, so match intent is converting into Q&A planning.`,
    `${formatNumber(visibilitySelected)} visibility selections and ${formatNumber(
      qaQuestionAnswered,
    )} answered questions show that people are getting through the room.`,
    `${formatNumber(qaFinished)} Q&As were finished; ${formatNumber(
      chatSent,
    )} chat messages and ${formatNumber(datePlanViewed)} date plan views followed.`,
    `Biggest leak: ${biggestDropOff.from} → ${biggestDropOff.to} has ${biggestDropOff.dropOff}% drop-off.`,
  ];
  const recommendedAction = getRecommendedExperiments(range)[0];

  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Executive summary
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            What is happening right now
          </h2>
        </div>
        <span
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold",
            statusClassName(healthStatus),
          )}
        >
          Product health: {healthStatus}
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

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <SummarySignalCard
          title="Discover activity"
          label={`${formatNumber(discoverViews)} views · ${formatNumber(matches)} matches`}
          detail={`${conversionRate(matches, discoverViews)}% of Discover views are becoming matches.`}
          status={rateStatus(conversionRate(matches, discoverViews), 20, 8)}
        />
        <SummarySignalCard
          title="Decision split"
          label={`${formatNumber(continueSelected)} Continue / ${formatNumber(
            passPrivatelySelected,
          )} Pass`}
          detail={`${continueRate}% of Q&A decisions are Continue. ${formatNumber(
            visibilitySelected,
          )} visibility selections and ${formatNumber(
            qaQuestionAnswered,
          )} answered questions show room engagement.`}
          status={rateStatus(continueRate, 65, 40)}
        />
      </div>

      <SummarySignalCard
        title="Recommended next action"
        label={recommendedAction.title}
        detail={recommendedAction.suggestedAction}
        status={recommendedAction.status}
        className="mt-3"
      />
    </section>
  );
}

function getRecommendedExperiments(range: AnalyticsRange): RecommendedAction[] {
  const biggestDropOff = getBiggestDropOff(range.funnel);
  const healthMetrics = getHealthMetrics(range);
  const weakestHealth =
    healthMetrics.find((metric) => metric.status === "Needs attention") ??
    healthMetrics.find((metric) => metric.status === "Watch") ??
    healthMetrics[0];

  return [
    {
      label: "Experiment 1",
      title: `Repair ${biggestDropOff.from} → ${biggestDropOff.to}`,
      why: `This is the weakest funnel stage at ${biggestDropOff.dropOff}% drop-off.`,
      suggestedAction:
        "Test tighter page copy, a clearer CTA, and one less decision at this exact step.",
      status: biggestDropOff.dropOff >= 55 ? "Needs attention" : "Watch",
    },
    {
      label: "Experiment 2",
      title: `Lift ${weakestHealth.label.toLowerCase()}`,
      why: `${weakestHealth.detail} This metric is currently marked ${weakestHealth.status.toLowerCase()}.`,
      suggestedAction:
        "Run a one-week variant focused only on this metric and compare the next 30-day view.",
      status: weakestHealth.status,
    },
    {
      label: "Experiment 3",
      title: "Increase post-Q&A momentum",
      why: "The MVP thesis depends on finished Q&As turning into chat depth and date intent.",
      suggestedAction:
        "After Q&A completion, test a single lightweight prompt that nudges users toward one concrete next message or date plan.",
      status: "Watch",
    },
  ];
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
  className,
}: {
  title: string;
  label: string;
  detail: string;
  status: RagStatus;
  className?: string;
}) {
  return (
    <article className={cn("rounded-[1.25rem] bg-background p-4", className)}>
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

function AnalyticsUnavailableState({
  result,
}: {
  result: Extract<PostHogDashboardResult, { status: "unavailable" }>;
}) {
  return (
    <section className="rounded-[1.75rem] border border-dashed border-border bg-card/70 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <MousePointerClick className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight">
        Live analytics unavailable
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {result.message}
      </p>
      <p className="mt-4 rounded-full bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground sm:inline-flex">
        Status: {result.reason.replace(/_/g, " ")}
      </p>
    </section>
  );
}

function FunnelPanel({ steps }: { steps: FunnelStep[] }) {
  const baseline = Math.max(...steps.map((step) => step.value), 1);
  const weakest = getBiggestDropOff(steps);

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
          const isWeakest =
            previous?.label === weakest.from && step.label === weakest.to;

          return (
            <div
              key={step.label}
              className={cn(
                "space-y-2 rounded-2xl p-3",
                isWeakest ? "bg-[#efd0ca]/55" : "bg-background/60",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{step.label}</p>
                    {isWeakest ? (
                      <span className="rounded-full bg-[#efd0ca] px-2 py-1 text-[11px] font-semibold text-[#7a2118]">
                        Weakest stage
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {previous
                      ? `${conversionRate(
                          step.value,
                          previous.value,
                        )}% conversion · ${dropOff}% drop-off from ${previous.label}`
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

      <FunnelPanel steps={range.funnel} />
    </section>
  );
}

function ProductHealthCards({ range }: { range: AnalyticsRange }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Product health cards
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Rates that matter
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {getHealthMetrics(range).map((metric) => (
          <HealthCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}

function RecommendedExperiments({ range }: { range: AnalyticsRange }) {
  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Recommended experiments
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Small tests with clear learning value
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Generated from aggregate funnel weaknesses only.
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {getRecommendedExperiments(range).map((action) => (
          <RecommendedActionCard key={action.label} action={action} />
        ))}
      </div>
    </section>
  );
}

function ClarityReviewPrompt({ range }: { range: AnalyticsRange }) {
  const biggestDropOff = getBiggestDropOff(range.funnel);

  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Clarity review prompt
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Watch the {biggestDropOff.from} to {biggestDropOff.to} journey
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              This is the biggest aggregate drop-off in PostHog. Review Clarity
              recordings for friction, hesitation, confusing copy, or broken
              layout around this stage.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#f1dfbd] px-4 py-2 text-sm font-semibold text-[#6a4b16]">
          {biggestDropOff.dropOff}% drop-off
        </span>
      </div>
    </section>
  );
}

export default async function AdminAnalyticsPage() {
  const posthogResult = await getPostHogDashboardCounts();
  const analyticsRanges =
    posthogResult.status === "ok"
      ? [
          buildAnalyticsRange({
            label: "Last 7 days",
            caption: "Live aggregate event counts from PostHog.",
            counts: posthogResult.counts,
            countKey: "last7Days",
          }),
          buildAnalyticsRange({
            label: "Last 30 days",
            caption: "Live aggregate event counts from PostHog.",
            counts: posthogResult.counts,
            countKey: "last30Days",
          }),
        ]
      : [];
  const summaryRange = analyticsRanges[0];
  const unavailableResult =
    posthogResult.status === "unavailable" ? posthogResult : null;

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
                PostHog. Values shown here are aggregate event counts only.
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
              value: posthogResult.status === "ok" ? "PostHog" : "Unavailable",
              helper:
                posthogResult.status === "ok"
                  ? "Fetched server-side through the private Query API."
                  : "Live counts are hidden until the server connection works.",
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

        {summaryRange ? (
          <>
            <FounderSummary range={summaryRange} />
            <RangeSection range={summaryRange} />
            <ProductHealthCards range={summaryRange} />
            <RecommendedExperiments range={summaryRange} />
            <ClarityReviewPrompt range={summaryRange} />
          </>
        ) : unavailableResult ? (
          <AnalyticsUnavailableState result={unavailableResult} />
        ) : null}

        {analyticsRanges.slice(1).map((range) => (
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
