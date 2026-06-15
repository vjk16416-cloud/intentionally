import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js";
import {
  Bug,
  Heart,
  MessageSquareWarning,
  ShieldCheck,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";
import {
  BROWSER_OPTIONS,
  DEVICE_OPTIONS,
  FEEDBACK_PRIORITY_OPTIONS,
  FEEDBACK_TAG_OPTIONS,
  getFeedbackPriorityTags,
  WOULD_USE_OPTIONS,
  type FeedbackPriorityTag,
  type FeedbackWouldUse,
  type UserTestingFeedback,
} from "@/lib/user-testing/feedback";
import { cn } from "@/lib/utils";

import { updateFeedbackAnalysis } from "./actions";

export const dynamic = "force-dynamic";

type FeedbackSearchParams = {
  bugs?: string;
  lowRating?: string;
  safety?: string;
  wouldUse?: string;
  priority?: string;
  tag?: string;
  device?: string;
  browser?: string;
  hasLookback?: string;
  hasVideoNotes?: string;
  hasAudioNotes?: string;
};

type FeedbackSummary = {
  total: number;
  averageRating: number | null;
  wouldUseCounts: Record<FeedbackWouldUse, number>;
};

type FeedbackResult =
  | {
      status: "available";
      feedback: UserTestingFeedback[];
      filteredFeedback: UserTestingFeedback[];
      summary: FeedbackSummary;
    }
  | { status: "unavailable"; message: string };

const tagStyles: Record<FeedbackPriorityTag, string> = {
  bug: "bg-[#efd0ca] text-[#7a2118]",
  "UX confusion": "bg-[#f1dfbd] text-[#6a4b16]",
  "safety/trust concern": "bg-[#e2e8dc] text-[#2f3a2b]",
  "positive reaction": "bg-[#dbe7ea] text-[#23434a]",
  "feature request": "bg-muted text-muted-foreground",
  "Q&A issue": "bg-[#f1dfbd] text-[#6a4b16]",
  "onboarding issue": "bg-muted text-muted-foreground",
  "discover issue": "bg-muted text-muted-foreground",
  "chat issue": "bg-muted text-muted-foreground",
  "date planning issue": "bg-muted text-muted-foreground",
  "video/mic insight": "bg-primary text-primary-foreground",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAverage(value: number | null) {
  return value === null ? "No rating yet" : value.toFixed(1);
}

function isOption<T extends readonly string[]>(
  value: string | undefined,
  options: T,
): value is T[number] {
  return Boolean(value && (options as readonly string[]).includes(value));
}

function countByWouldUse(feedback: UserTestingFeedback[]) {
  return feedback.reduce<Record<FeedbackWouldUse, number>>(
    (counts, item) => {
      counts[item.would_use] += 1;
      return counts;
    },
    { Yes: 0, Maybe: 0, No: 0 },
  );
}

function buildSummary(feedback: UserTestingFeedback[]): FeedbackSummary {
  const ratingTotal = feedback.reduce((total, item) => total + item.rating, 0);

  return {
    total: feedback.length,
    averageRating:
      feedback.length === 0 ? null : ratingTotal / feedback.length,
    wouldUseCounts: countByWouldUse(feedback),
  };
}

function tagsFor(feedback: UserTestingFeedback) {
  return getFeedbackPriorityTags(feedback);
}

function hasTag(feedback: UserTestingFeedback, tag: FeedbackPriorityTag) {
  return tagsFor(feedback).includes(tag);
}

function filterFeedback(
  feedback: UserTestingFeedback[],
  filters: FeedbackSearchParams,
) {
  const wouldUse = isOption(filters.wouldUse, WOULD_USE_OPTIONS)
    ? filters.wouldUse
    : "";
  const priority = isOption(filters.priority, FEEDBACK_PRIORITY_OPTIONS)
    ? filters.priority
    : "";
  const tag = isOption(filters.tag, FEEDBACK_TAG_OPTIONS) ? filters.tag : "";
  const device = isOption(filters.device, DEVICE_OPTIONS) ? filters.device : "";
  const browser = isOption(filters.browser, BROWSER_OPTIONS)
    ? filters.browser
    : "";

  return feedback.filter((item) => {
    if (filters.bugs === "1" && !hasTag(item, "bug")) return false;
    if (filters.lowRating === "1" && item.rating > 5) return false;
    if (filters.safety === "1" && !hasTag(item, "safety/trust concern")) {
      return false;
    }
    if (wouldUse && item.would_use !== wouldUse) return false;
    if (priority && item.priority !== priority) return false;
    if (tag && !hasTag(item, tag)) return false;
    if (device && item.device !== device) return false;
    if (browser && item.browser !== browser) return false;
    if (filters.hasLookback === "1" && !item.lookback_session_url) {
      return false;
    }
    if (filters.hasVideoNotes === "1" && !item.video_recording_notes) {
      return false;
    }
    if (filters.hasAudioNotes === "1" && !item.audio_recording_notes) {
      return false;
    }

    return true;
  });
}

async function getFeedback(
  filters: FeedbackSearchParams,
): Promise<FeedbackResult> {
  try {
    const supabase = createSupabaseServiceClient(
      SUPABASE_URL,
      getServiceRoleKey(),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const { data, error } = await supabase
      .from("user_testing_feedback")
      .select(
        [
          "id",
          "created_at",
          "tester_name",
          "tester_email",
          "device",
          "browser",
          "rating",
          "confusion",
          "liked",
          "bugs",
          "safety_feedback",
          "qa_feedback",
          "improvements",
          "would_use",
          "permission_given",
          "lookback_session_url",
          "video_recording_notes",
          "audio_recording_notes",
          "transcript_notes",
          "key_quotes",
          "hesitation_points",
          "observed_bugs",
          "observed_positive_reactions",
          "observed_safety_concerns",
          "observed_qa_confusion",
          "recommended_follow_up_action",
          "priority",
          "tags",
        ].join(", "),
      )
      .order("created_at", { ascending: false })
      .limit(500)
      .returns<UserTestingFeedback[]>();

    if (error) {
      return {
        status: "unavailable",
        message:
          "Feedback could not be loaded. Confirm the user_testing_feedback migration has been applied and Supabase server keys are configured.",
      };
    }

    const feedback = (data ?? []).map((item) => ({
      ...item,
      priority: item.priority ?? "Low",
      tags: item.tags ?? [],
    }));

    return {
      status: "available",
      feedback,
      filteredFeedback: filterFeedback(feedback, filters),
      summary: buildSummary(feedback),
    };
  } catch {
    return {
      status: "unavailable",
      message:
        "Feedback could not be loaded. Confirm the Supabase environment variables are configured.",
    };
  }
}

function repeatedSnippets(
  feedback: UserTestingFeedback[],
  fields: Array<keyof UserTestingFeedback>,
) {
  const snippets = feedback
    .flatMap((item) =>
      fields.map((field) => String(item[field] ?? "").trim()).filter(Boolean),
    )
    .filter((value) => !["no", "none", "nothing", "n/a", "na"].includes(value.toLowerCase()));

  const counts = new Map<string, number>();
  for (const snippet of snippets) {
    const key = snippet.toLowerCase().slice(0, 120);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([text, count]) => ({ text, count }));
}

function getInsightSummary(feedback: UserTestingFeedback[]) {
  const highPriority = feedback.filter((item) => item.priority === "High");
  const lowRating = feedback.filter((item) => item.rating <= 5);
  const safetyConcerns = feedback.filter((item) =>
    hasTag(item, "safety/trust concern"),
  );
  const qaIssues = feedback.filter((item) => hasTag(item, "Q&A issue"));
  const recordingInsights = feedback.filter((item) =>
    hasTag(item, "video/mic insight"),
  );

  return {
    repeatedIssues: repeatedSnippets(feedback, [
      "confusion",
      "bugs",
      "observed_bugs",
      "observed_qa_confusion",
      "hesitation_points",
    ]),
    liked: repeatedSnippets(feedback, [
      "liked",
      "observed_positive_reactions",
    ]),
    beforeNextRound:
      highPriority[0]?.recommended_follow_up_action ||
      highPriority[0]?.improvements ||
      lowRating[0]?.improvements ||
      "No urgent fix is clear yet. Keep collecting responses until a pattern repeats.",
    understandsQa:
      qaIssues.length === 0
        ? "No repeated Q&A confusion tagged yet."
        : `${qaIssues.length} response(s) mention Q&A journey confusion.`,
    feelsSafe:
      safetyConcerns.length === 0
        ? "No repeated safety or trust concern tagged yet."
        : `${safetyConcerns.length} response(s) mention safety or trust concerns.`,
    recording:
      recordingInsights.length === 0
        ? "No video or mic observations have been added yet."
        : `${recordingInsights.length} response(s) include video or mic observations.`,
  };
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-[1.25rem] border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{helper}</p>
    </article>
  );
}

function TagBadge({ tag }: { tag: FeedbackPriorityTag }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tagStyles[tag])}>
      {tag}
    </span>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-[1.75rem] border border-dashed border-border bg-card/70 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <MessageSquareWarning className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {message}
      </p>
    </section>
  );
}

function SelectFilter({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  options: readonly string[];
}) {
  return (
    <label className="space-y-1.5 text-sm font-semibold">
      <span>{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxFilter({
  label,
  name,
  checked,
}: {
  label: string;
  name: string;
  checked: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-sm font-medium">
      <input
        type="checkbox"
        name={name}
        value="1"
        defaultChecked={checked}
        className="h-4 w-4 accent-foreground"
      />
      {label}
    </label>
  );
}

function FilterPanel({ filters }: { filters: FeedbackSearchParams }) {
  return (
    <form className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-4">
        <CheckboxFilter label="Bugs mentioned" name="bugs" checked={filters.bugs === "1"} />
        <CheckboxFilter label="Low rating, 1 to 5" name="lowRating" checked={filters.lowRating === "1"} />
        <CheckboxFilter label="Safety/trust concern" name="safety" checked={filters.safety === "1"} />
        <CheckboxFilter label="Has Lookback link" name="hasLookback" checked={filters.hasLookback === "1"} />
        <CheckboxFilter label="Has video notes" name="hasVideoNotes" checked={filters.hasVideoNotes === "1"} />
        <CheckboxFilter label="Has audio notes" name="hasAudioNotes" checked={filters.hasAudioNotes === "1"} />
        <SelectFilter label="Would use" name="wouldUse" value={filters.wouldUse} options={WOULD_USE_OPTIONS} />
        <SelectFilter label="Priority" name="priority" value={filters.priority} options={FEEDBACK_PRIORITY_OPTIONS} />
        <SelectFilter label="Tag" name="tag" value={filters.tag} options={FEEDBACK_TAG_OPTIONS} />
        <SelectFilter label="Device" name="device" value={filters.device} options={DEVICE_OPTIONS} />
        <SelectFilter label="Browser" name="browser" value={filters.browser} options={BROWSER_OPTIONS} />
        <div className="flex items-end">
          <Button type="submit" className="h-11 w-full rounded-2xl">
            Filter
          </Button>
        </div>
      </div>
    </form>
  );
}

function InsightSummary({ feedback }: { feedback: UserTestingFeedback[] }) {
  const insight = getInsightSummary(feedback);

  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Founder insight summary
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        What to learn before the next test
      </h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <InsightList title="Top repeated issues" items={insight.repeatedIssues} />
        <InsightList title="Top liked moments" items={insight.liked} />
        <InsightText title="Fix before next round" value={insight.beforeNextRound} />
        <InsightText title="Q&A journey" value={insight.understandsQa} />
        <InsightText title="Safety and trust" value={insight.feelsSafe} />
        <InsightText title="Video/mic observations" value={insight.recording} />
      </div>
    </section>
  );
}

function InsightList({
  title,
  items,
}: {
  title: string;
  items: Array<{ text: string; count: number }>;
}) {
  return (
    <div className="rounded-[1.25rem] bg-background p-4">
      <p className="text-sm font-semibold">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          No repeated pattern yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.text} className="text-sm leading-6 text-muted-foreground">
              {item.count > 1 ? `${item.count}x ` : ""}
              {item.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InsightText({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-background p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

function CommonThemes({ feedback }: { feedback: UserTestingFeedback[] }) {
  const groups = [
    { title: "Common bugs", fields: ["bugs", "observed_bugs"] },
    { title: "Common UX confusion", fields: ["confusion", "hesitation_points"] },
    { title: "Common safety/trust concerns", fields: ["safety_feedback", "observed_safety_concerns"] },
    { title: "Common positive reactions", fields: ["liked", "observed_positive_reactions"] },
    { title: "Common Q&A feedback", fields: ["qa_feedback", "observed_qa_confusion"] },
  ] as const;

  return (
    <section className="grid gap-3 lg:grid-cols-5">
      {groups.map((group) => (
        <InsightList
          key={group.title}
          title={group.title}
          items={repeatedSnippets(feedback, [...group.fields])}
        />
      ))}
    </section>
  );
}

function FeedbackText({ title, value }: { title: string; value: string | null }) {
  if (!value) return null;

  return (
    <div className="rounded-[1.25rem] bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{value}</p>
    </div>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string | null;
}) {
  return (
    <label className="space-y-1.5 text-sm font-semibold">
      <span>{label}</span>
      <textarea
        name={name}
        rows={3}
        maxLength={5000}
        defaultValue={defaultValue ?? ""}
        className="min-h-24 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </label>
  );
}

function AnalysisForm({ feedback }: { feedback: UserTestingFeedback }) {
  const mergedTags = new Set(tagsFor(feedback));

  return (
    <form action={updateFeedbackAnalysis} className="mt-5 rounded-[1.25rem] border border-border bg-card/60 p-4">
      <input type="hidden" name="id" value={feedback.id} />
      <p className="text-sm font-semibold">Lookback recording analysis</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="space-y-1.5 text-sm font-semibold">
          <span>Lookback session URL</span>
          <Input
            name="lookbackSessionUrl"
            type="url"
            defaultValue={feedback.lookback_session_url ?? ""}
            className="h-11 rounded-2xl bg-background"
          />
        </label>
        <label className="space-y-1.5 text-sm font-semibold">
          <span>Priority</span>
          <select
            name="priority"
            defaultValue={feedback.priority}
            className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {FEEDBACK_PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TextAreaField label="Video recording notes" name="videoRecordingNotes" defaultValue={feedback.video_recording_notes} />
        <TextAreaField label="Mic/audio recording notes" name="audioRecordingNotes" defaultValue={feedback.audio_recording_notes} />
        <TextAreaField label="Transcript or notes paste box" name="transcriptNotes" defaultValue={feedback.transcript_notes} />
        <TextAreaField label="Key tester quotes" name="keyQuotes" defaultValue={feedback.key_quotes} />
        <TextAreaField label="Observed hesitation points" name="hesitationPoints" defaultValue={feedback.hesitation_points} />
        <TextAreaField label="Observed bugs" name="observedBugs" defaultValue={feedback.observed_bugs} />
        <TextAreaField label="Observed positive reactions" name="observedPositiveReactions" defaultValue={feedback.observed_positive_reactions} />
        <TextAreaField label="Observed safety concerns" name="observedSafetyConcerns" defaultValue={feedback.observed_safety_concerns} />
        <TextAreaField label="Observed Q&A confusion" name="observedQaConfusion" defaultValue={feedback.observed_qa_confusion} />
        <TextAreaField label="Recommended follow-up action" name="recommendedFollowUpAction" defaultValue={feedback.recommended_follow_up_action} />
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">Tags</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {FEEDBACK_TAG_OPTIONS.map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold"
            >
              <input
                type="checkbox"
                name="tags"
                value={tag}
                defaultChecked={mergedTags.has(tag)}
                className="h-3.5 w-3.5 accent-foreground"
              />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" className="mt-4 rounded-2xl">
        Save analysis
      </Button>
    </form>
  );
}

function FeedbackCard({ feedback }: { feedback: UserTestingFeedback }) {
  const tags = tagsFor(feedback);

  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">{feedback.tester_name || "Anonymous tester"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {feedback.tester_email || "No email"} - {formatDate(feedback.created_at)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {feedback.device} - {feedback.browser}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {feedback.rating}/10
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            Would use: {feedback.would_use}
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            Priority: {feedback.priority}
          </span>
          {feedback.lookback_session_url ? (
            <a
              href={feedback.lookback_session_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#dbe7ea] px-3 py-1 text-xs font-semibold text-[#23434a]"
            >
              Lookback link
            </a>
          ) : null}
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <FeedbackText title="Confused most" value={feedback.confusion} />
        <FeedbackText title="Liked most" value={feedback.liked} />
        <FeedbackText title="Bugs or breaks" value={feedback.bugs} />
        <FeedbackText title="Safety and trust" value={feedback.safety_feedback} />
        <FeedbackText title="Q&A journey" value={feedback.qa_feedback} />
        <FeedbackText title="Would improve" value={feedback.improvements} />
        <FeedbackText title="Video recording notes" value={feedback.video_recording_notes} />
        <FeedbackText title="Audio recording notes" value={feedback.audio_recording_notes} />
        <FeedbackText title="Transcript/notes preview" value={feedback.transcript_notes} />
        <FeedbackText title="Key quotes" value={feedback.key_quotes} />
        <FeedbackText title="Observed hesitation" value={feedback.hesitation_points} />
        <FeedbackText title="Observed bugs" value={feedback.observed_bugs} />
        <FeedbackText title="Observed positive reactions" value={feedback.observed_positive_reactions} />
        <FeedbackText title="Observed safety concerns" value={feedback.observed_safety_concerns} />
        <FeedbackText title="Observed Q&A confusion" value={feedback.observed_qa_confusion} />
        <FeedbackText title="Recommended follow-up" value={feedback.recommended_follow_up_action} />
      </div>

      <AnalysisForm feedback={feedback} />
    </article>
  );
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<FeedbackSearchParams>;
}) {
  const filters = await searchParams;
  const result = await getFeedback(filters);

  return (
    <main className="px-5 py-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              User testing feedback
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Lookback feedback review
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review written feedback alongside manually pasted Lookback video
              and mic observations. No Lookback API or transcription automation
              is connected.
            </p>
          </div>
          <a
            href="/feedback"
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm"
          >
            Public form: /feedback
          </a>
        </section>

        {result.status === "unavailable" ? (
          <EmptyState title="Feedback unavailable" message={result.message} />
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Total responses" value={String(result.summary.total)} helper="All submitted tester responses." />
              <MetricCard label="Average rating" value={formatAverage(result.summary.averageRating)} helper="Average score out of 10." />
              <MetricCard label="Would use" value={`${result.summary.wouldUseCounts.Yes} / ${result.summary.wouldUseCounts.Maybe} / ${result.summary.wouldUseCounts.No}`} helper="Yes / Maybe / No responses." />
              <MetricCard label="Lookback links" value={String(result.feedback.filter((item) => item.lookback_session_url).length)} helper="Responses with manually added recording links." />
            </section>

            <section className="grid gap-3 md:grid-cols-5">
              <SignalCard icon={Bug} label="Bug reports" value={result.feedback.filter((item) => hasTag(item, "bug")).length} />
              <SignalCard icon={MessageSquareWarning} label="UX confusion" value={result.feedback.filter((item) => hasTag(item, "UX confusion")).length} />
              <SignalCard icon={ShieldCheck} label="Safety/trust" value={result.feedback.filter((item) => hasTag(item, "safety/trust concern")).length} />
              <SignalCard icon={Heart} label="Positive" value={result.feedback.filter((item) => hasTag(item, "positive reaction")).length} />
              <SignalCard icon={Video} label="Video/mic" value={result.feedback.filter((item) => hasTag(item, "video/mic insight")).length} />
            </section>

            <InsightSummary feedback={result.feedback} />
            <CommonThemes feedback={result.feedback} />
            <FilterPanel filters={filters} />

            {result.feedback.length === 0 ? (
              <EmptyState
                title="No feedback yet"
                message="Feedback will appear here after testers complete the public form at /feedback."
              />
            ) : result.filteredFeedback.length === 0 ? (
              <EmptyState
                title="No feedback matches these filters"
                message="Clear one or more filters to return to the full tester feedback list."
              />
            ) : (
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Latest feedback responses
                  </h2>
                  <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Newest first
                  </span>
                </div>
                {result.filteredFeedback.map((feedback) => (
                  <FeedbackCard key={feedback.id} feedback={feedback} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function SignalCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-card p-4 shadow-sm">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <p className="mt-3 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
