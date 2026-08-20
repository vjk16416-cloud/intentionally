export const ANALYTICS_EVENT_NAMES = {
  loginClicked: "login_clicked",
  onboardingStarted: "onboarding_started",
  onboardingCompleted: "onboarding_completed",
  discoverViewed: "discover_viewed",
  profileLiked: "profile_liked",
  profilePassed: "profile_passed",
  matchCreated: "match_created",
  qaInviteOpened: "qa_invite_opened",
  qaInviteConfirmationOpened: "qa_invite_confirmation_opened",
  qaInviteSubmitted: "qa_invite_submitted",
  qaInviteFailed: "qa_invite_failed",
  qaInviteDuplicate: "qa_invite_duplicate",
  scheduleClicked: "schedule_clicked",
  qaStarted: "qa_started",
  visibilitySelected: "visibility_selected",
  qaQuestionAnswered: "qa_question_answered",
  qaFinished: "qa_finished",
  continueSelected: "continue_selected",
  passPrivatelySelected: "pass_privately_selected",
  chatSent: "chat_sent",
  datePlanViewed: "date_plan_viewed",
  datePlanShared: "date_plan_shared",
  feedbackSubmitted: "feedback_submitted",
} as const;

export type AnalyticsEventKey = keyof typeof ANALYTICS_EVENT_NAMES;
export type AnalyticsEventName =
  (typeof ANALYTICS_EVENT_NAMES)[AnalyticsEventKey];
