"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { AnalyticsEvents, trackEvent } from "@/lib/analytics";

type QaDecision = "continue" | "pass";

type QaDecisionProperties = {
  userId: string;
  matchId: string | null;
  sessionId: string;
  visibilityMode: string;
};

function trackQaDecision(
  decision: QaDecision,
  { userId, matchId, sessionId, visibilityMode }: QaDecisionProperties,
) {
  trackEvent(
    decision === "continue"
      ? AnalyticsEvents.CONTINUE_AFTER_QA
      : AnalyticsEvents.PASS_AFTER_QA,
    {
      user_id: userId,
      match_id: matchId,
      qa_session_id: sessionId,
      source: "qa",
      visibility_mode: visibilityMode,
      surface: "decision_screen",
    },
  );
}

type QaDecisionButtonProps = ComponentProps<"button"> &
  QaDecisionProperties & {
    decision: QaDecision;
  };

export function QaDecisionButton({
  decision,
  userId,
  matchId,
  sessionId,
  visibilityMode,
  onClick,
  ...props
}: QaDecisionButtonProps) {
  return (
    <button
      {...props}
      onClick={(event) => {
        trackQaDecision(decision, {
          userId,
          matchId,
          sessionId,
          visibilityMode,
        });
        onClick?.(event);
      }}
    />
  );
}

type QaDecisionLinkProps = ComponentProps<typeof Link> &
  QaDecisionProperties & {
    decision: QaDecision;
    children: ReactNode;
  };

export function QaDecisionLink({
  decision,
  userId,
  matchId,
  sessionId,
  visibilityMode,
  onClick,
  ...props
}: QaDecisionLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackQaDecision(decision, {
          userId,
          matchId,
          sessionId,
          visibilityMode,
        });
        onClick?.(event);
      }}
    />
  );
}
