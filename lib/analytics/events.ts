const CANONICAL_EVENT_NAMES = {
  loginClicked: "login_clicked",
  onboardingStarted: "onboarding_started",
  onboardingCompleted: "onboarding_completed",
  discoverViewed: "discover_viewed",
  visibilitySelected: "visibility_selected",
  qaQuestionAnswered: "qa_question_answered",
  profileLiked: "profile_liked",
  profilePassed: "profile_passed",
  matchCreated: "match_created",
  qaInviteSent: "qa_invite_sent",
  qaInviteAccepted: "qa_invite_accepted",
  qaInviteDeclined: "qa_invite_declined",
  scheduleStarted: "schedule_started",
  scheduleConfirmed: "schedule_confirmed",
  scheduleCancelled: "schedule_cancelled",
  scheduleFailed: "schedule_failed",
  qaStarted: "qa_started",
  qaCompleted: "qa_completed",
  qaCancelled: "qa_cancelled",
  qaNoShow: "qa_no_show",
  qaConnectionFailed: "qa_connection_failed",
  qaMediaPermissionFailed: "qa_media_permission_failed",
  continueSelected: "continue_selected",
  passSelected: "pass_selected",
  mutualContinue: "mutual_continue",
  chatUnlocked: "chat_unlocked",
  firstMessage: "first_message_sent",
  datePlanCreated: "date_plan_created",
  verificationStarted: "verification_started",
  verificationCompleted: "verification_completed",
  verificationFailed: "verification_failed",
  safetyReportCreated: "safety_report_created",
  incidentResolved: "incident_resolved",
  feedbackSubmitted: "feedback_submitted",
} as const;

export const ANALYTICS_EVENT_NAMES = CANONICAL_EVENT_NAMES;

export type AnalyticsEventKey = keyof typeof ANALYTICS_EVENT_NAMES;
export type AnalyticsEventName =
  (typeof ANALYTICS_EVENT_NAMES)[AnalyticsEventKey];

type AnalyticsPropertyValue = string | number | boolean | undefined;

/**
 * These are the only event properties accepted by the shared analytics layer.
 * They deliberately exclude profile content, answers, contact details, message
 * contents and private decision reasoning.
 */
export type AnalyticsProperties = Partial<{
  match_id: AnalyticsPropertyValue;
  qa_session_id: AnalyticsPropertyValue;
  chat_id: AnalyticsPropertyValue;
  source: AnalyticsPropertyValue;
  video_provider: "daily" | "livekit" | undefined;
  failure_area: "connection" | "media_permission" | "video_room" | "verification" | undefined;
  viewport: "phone" | "tablet" | "desktop" | undefined;
  page: AnalyticsPropertyValue;
  sign_in_method: "email" | "phone" | undefined;
  card_count: AnalyticsPropertyValue;
  question_index: AnalyticsPropertyValue;
  question_total: AnalyticsPropertyValue;
  is_last_question: AnalyticsPropertyValue;
  confusing: AnalyticsPropertyValue;
  useful: AnalyticsPropertyValue;
  awkward: AnalyticsPropertyValue;
  use_before_chat: AnalyticsPropertyValue;
  step: AnalyticsPropertyValue;
  final_step: AnalyticsPropertyValue;
}>;

const ALLOWED_PROPERTY_NAMES = new Set<keyof AnalyticsProperties>([
  "match_id",
  "qa_session_id",
  "chat_id",
  "source",
  "video_provider",
  "failure_area",
  "viewport",
  "page",
  "sign_in_method",
  "card_count",
  "question_index",
  "question_total",
  "is_last_question",
  "confusing",
  "useful",
  "awkward",
  "use_before_chat",
  "step",
  "final_step",
]);

export function sanitiseAnalyticsProperties(
  properties: Record<string, unknown> | undefined,
): AnalyticsProperties {
  if (!properties) return {};

  return Object.fromEntries(
    Object.entries(properties).filter(
      ([key, value]) =>
        ALLOWED_PROPERTY_NAMES.has(key as keyof AnalyticsProperties) &&
        (typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"),
    ),
  ) as AnalyticsProperties;
}

export const LEGACY_ANALYTICS_EVENT_KEYS = {
  login: "loginClicked",
  onboarding_started: "onboardingStarted",
  onboarding_completed: "onboardingCompleted",
  profile_liked: "profileLiked",
  profile_passed: "profilePassed",
  match_created: "matchCreated",
  schedule_clicked: "scheduleStarted",
  qa_started: "qaStarted",
  qa_finished: "qaCompleted",
  continue_after_qa: "continueSelected",
  pass_after_qa: "passSelected",
  date_plan_shared: "datePlanCreated",
  qa_video_connection_failed: "qaConnectionFailed",
  qa_video_media_permission_failed: "qaMediaPermissionFailed",
} as const satisfies Record<string, AnalyticsEventKey>;
