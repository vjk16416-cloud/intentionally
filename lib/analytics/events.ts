export const ANALYTICS_EVENT_NAMES = {
  loginClicked: "login_clicked",
  onboardingStarted: "onboarding_started",
  onboardingCompleted: "onboarding_completed",
  profileLiked: "profile_liked",
  profilePassed: "profile_passed",
  matchCreated: "match_created",
  scheduleClicked: "schedule_clicked",
  qaStarted: "qa_started",
  qaFinished: "qa_finished",
  qaContinueClicked: "qa_continue_clicked",
  qaPassPrivatelyClicked: "qa_pass_privately_clicked",
  chatMessageSent: "chat_message_sent",
  datePlanShared: "date_plan_shared",
} as const;

export type AnalyticsEventKey = keyof typeof ANALYTICS_EVENT_NAMES;
export type AnalyticsEventName =
  (typeof ANALYTICS_EVENT_NAMES)[AnalyticsEventKey];
