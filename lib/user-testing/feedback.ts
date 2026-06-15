export const DEVICE_OPTIONS = ["Desktop", "iPhone", "Android", "Other"] as const;
export const BROWSER_OPTIONS = [
  "Chrome",
  "Safari",
  "Edge",
  "Firefox",
  "Other",
] as const;
export const WOULD_USE_OPTIONS = ["Yes", "Maybe", "No"] as const;
export const FEEDBACK_PRIORITY_OPTIONS = ["High", "Medium", "Low"] as const;
export const FEEDBACK_TAG_OPTIONS = [
  "bug",
  "UX confusion",
  "safety/trust concern",
  "positive reaction",
  "feature request",
  "Q&A issue",
  "onboarding issue",
  "discover issue",
  "chat issue",
  "date planning issue",
  "video/mic insight",
] as const;

export type FeedbackDevice = (typeof DEVICE_OPTIONS)[number];
export type FeedbackBrowser = (typeof BROWSER_OPTIONS)[number];
export type FeedbackWouldUse = (typeof WOULD_USE_OPTIONS)[number];
export type FeedbackPriority = (typeof FEEDBACK_PRIORITY_OPTIONS)[number];
export type FeedbackPriorityTag = (typeof FEEDBACK_TAG_OPTIONS)[number];

export type UserTestingFeedback = {
  id: string;
  created_at: string;
  tester_name: string | null;
  tester_email: string | null;
  device: FeedbackDevice;
  browser: FeedbackBrowser;
  rating: number;
  confusion: string;
  liked: string;
  bugs: string;
  safety_feedback: string;
  qa_feedback: string;
  improvements: string;
  would_use: FeedbackWouldUse;
  permission_given: boolean;
  lookback_session_url: string | null;
  video_recording_notes: string | null;
  audio_recording_notes: string | null;
  transcript_notes: string | null;
  key_quotes: string | null;
  hesitation_points: string | null;
  observed_bugs: string | null;
  observed_positive_reactions: string | null;
  observed_safety_concerns: string | null;
  observed_qa_confusion: string | null;
  recommended_follow_up_action: string | null;
  priority: FeedbackPriority;
  tags: FeedbackPriorityTag[];
};

export type FeedbackInsert = Omit<
  UserTestingFeedback,
  | "id"
  | "created_at"
  | "lookback_session_url"
  | "video_recording_notes"
  | "audio_recording_notes"
  | "transcript_notes"
  | "key_quotes"
  | "hesitation_points"
  | "observed_bugs"
  | "observed_positive_reactions"
  | "observed_safety_concerns"
  | "observed_qa_confusion"
  | "recommended_follow_up_action"
  | "priority"
  | "tags"
>;

export type FeedbackAnalysisUpdate = Pick<
  UserTestingFeedback,
  | "lookback_session_url"
  | "video_recording_notes"
  | "audio_recording_notes"
  | "transcript_notes"
  | "key_quotes"
  | "hesitation_points"
  | "observed_bugs"
  | "observed_positive_reactions"
  | "observed_safety_concerns"
  | "observed_qa_confusion"
  | "recommended_follow_up_action"
  | "priority"
  | "tags"
>;

const REQUIRED_TEXT_MAX = 1500;
const OPTIONAL_TEXT_MAX = 200;
const INTERNAL_TEXT_MAX = 5000;

function isOneOf<T extends readonly string[]>(
  value: string,
  options: T,
): value is T[number] {
  return (options as readonly string[]).includes(value);
}

function textValue(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function requiredText(
  formData: FormData,
  key: string,
  label: string,
): { value: string } | { error: string } {
  const value = textValue(formData, key, REQUIRED_TEXT_MAX);
  if (!value) {
    return { error: `${label} is required.` };
  }

  return { value };
}

export function parseFeedbackForm(formData: FormData):
  | { data: FeedbackInsert }
  | { error: string } {
  const device = String(formData.get("device") ?? "");
  if (!isOneOf(device, DEVICE_OPTIONS)) {
    return { error: "Choose the device you used." };
  }

  const browser = String(formData.get("browser") ?? "");
  if (!isOneOf(browser, BROWSER_OPTIONS)) {
    return { error: "Choose the browser you used." };
  }

  const rating = Number(formData.get("rating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    return { error: "Choose a rating from 1 to 10." };
  }

  const wouldUse = String(formData.get("wouldUse") ?? "");
  if (!isOneOf(wouldUse, WOULD_USE_OPTIONS)) {
    return { error: "Tell us whether you would use Intentionally." };
  }

  const confusion = requiredText(
    formData,
    "confusion",
    "What confused you most",
  );
  if ("error" in confusion) return confusion;

  const liked = requiredText(formData, "liked", "What you liked most");
  if ("error" in liked) return liked;

  const bugs = requiredText(
    formData,
    "bugs",
    "Whether anything broke or did not work",
  );
  if ("error" in bugs) return bugs;

  const safetyFeedback = requiredText(
    formData,
    "safetyFeedback",
    "Whether the app felt safe and trustworthy",
  );
  if ("error" in safetyFeedback) return safetyFeedback;

  const qaFeedback = requiredText(
    formData,
    "qaFeedback",
    "Whether the Q&A dating journey made sense",
  );
  if ("error" in qaFeedback) return qaFeedback;

  const improvements = requiredText(
    formData,
    "improvements",
    "What you would improve",
  );
  if ("error" in improvements) return improvements;

  const testerName = textValue(formData, "testerName", OPTIONAL_TEXT_MAX);
  const testerEmail = textValue(formData, "testerEmail", OPTIONAL_TEXT_MAX);

  return {
    data: {
      tester_name: testerName || null,
      tester_email: testerEmail || null,
      device,
      browser,
      rating,
      confusion: confusion.value,
      liked: liked.value,
      bugs: bugs.value,
      safety_feedback: safetyFeedback.value,
      qa_feedback: qaFeedback.value,
      improvements: improvements.value,
      would_use: wouldUse,
      permission_given: formData.get("permissionGiven") === "on",
    },
  };
}

export function parseFeedbackAnalysisForm(formData: FormData):
  | { id: string; data: FeedbackAnalysisUpdate }
  | { error: string } {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { error: "Missing feedback response id." };
  }

  const priority = String(formData.get("priority") ?? "");
  if (!isOneOf(priority, FEEDBACK_PRIORITY_OPTIONS)) {
    return { error: "Choose a priority." };
  }

  const tags = formData
    .getAll("tags")
    .map((tag) => String(tag))
    .filter((tag): tag is FeedbackPriorityTag =>
      isOneOf(tag, FEEDBACK_TAG_OPTIONS),
    );

  const lookbackSessionUrl = textValue(
    formData,
    "lookbackSessionUrl",
    OPTIONAL_TEXT_MAX * 2,
  );

  if (lookbackSessionUrl) {
    try {
      const url = new URL(lookbackSessionUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        return { error: "Use a valid Lookback session URL." };
      }
    } catch {
      return { error: "Use a valid Lookback session URL." };
    }
  }

  const internalText = (key: string) => {
    const value = textValue(formData, key, INTERNAL_TEXT_MAX);
    return value || null;
  };

  return {
    id,
    data: {
      lookback_session_url: lookbackSessionUrl || null,
      video_recording_notes: internalText("videoRecordingNotes"),
      audio_recording_notes: internalText("audioRecordingNotes"),
      transcript_notes: internalText("transcriptNotes"),
      key_quotes: internalText("keyQuotes"),
      hesitation_points: internalText("hesitationPoints"),
      observed_bugs: internalText("observedBugs"),
      observed_positive_reactions: internalText("observedPositiveReactions"),
      observed_safety_concerns: internalText("observedSafetyConcerns"),
      observed_qa_confusion: internalText("observedQaConfusion"),
      recommended_follow_up_action: internalText("recommendedFollowUpAction"),
      priority,
      tags,
    },
  };
}

export function getFeedbackPriorityTags(
  feedback: Pick<
    UserTestingFeedback,
    | "rating"
    | "confusion"
    | "liked"
    | "bugs"
    | "safety_feedback"
    | "qa_feedback"
    | "improvements"
    | "lookback_session_url"
    | "video_recording_notes"
    | "audio_recording_notes"
    | "observed_bugs"
    | "observed_positive_reactions"
    | "observed_safety_concerns"
    | "observed_qa_confusion"
    | "tags"
  >,
): FeedbackPriorityTag[] {
  const tags = new Set<FeedbackPriorityTag>(feedback.tags);
  const bugs = feedback.bugs.toLowerCase();
  const confusion = feedback.confusion.toLowerCase();
  const safety = feedback.safety_feedback.toLowerCase();
  const qa = feedback.qa_feedback.toLowerCase();
  const improvements = feedback.improvements.toLowerCase();
  const liked = feedback.liked.toLowerCase();
  const observedBugs = feedback.observed_bugs?.toLowerCase() ?? "";
  const observedSafety =
    feedback.observed_safety_concerns?.toLowerCase() ?? "";
  const observedQa = feedback.observed_qa_confusion?.toLowerCase() ?? "";
  const hasRecordingInsight = Boolean(
    feedback.lookback_session_url ||
      feedback.video_recording_notes ||
      feedback.audio_recording_notes,
  );

  if (
    (bugs || observedBugs) &&
    !["no", "none", "nothing", "n/a", "na"].includes(bugs) &&
    /\b(bug|broke|broken|crash|error|failed|stuck|didn't work|did not work|issue)\b/.test(
      `${bugs} ${observedBugs}`,
    )
  ) {
    tags.add("bug");
  }

  if (
    feedback.rating <= 5 ||
    /\b(confusing|confused|unclear|lost|hard|not sure|didn't understand|did not understand)\b/.test(
      confusion,
    )
  ) {
    tags.add("UX confusion");
  }

  if (
    /\b(safe|safety|trust|trustworthy|unsafe|privacy|secure|scam|creepy|verify|verification)\b/.test(
      `${safety} ${observedSafety}`,
    )
  ) {
    tags.add("safety/trust concern");
  }

  if (
    /\b(add|wish|feature|improve|better|more|missing|should)\b/.test(
      improvements,
    )
  ) {
    tags.add("feature request");
  }

  if (
    feedback.rating >= 8 ||
    /\b(like|liked|love|clear|easy|safe|trust|helpful|good|great)\b/.test(
      `${liked} ${feedback.observed_positive_reactions ?? ""}`,
    )
  ) {
    tags.add("positive reaction");
  }

  if (
    /\b(q&a|qa|question|questions|video|call|flow|journey|visibility|answer)\b/.test(
      `${qa} ${observedQa}`,
    )
  ) {
    tags.add("Q&A issue");
  }

  if (hasRecordingInsight) {
    tags.add("video/mic insight");
  }

  return [...tags];
}
