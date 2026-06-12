"use client";

import { useEffect } from "react";

import { AnalyticsEvents, trackEvent } from "@/lib/analytics";

export function ChatSentTracker({
  userId,
  matchId,
  sentMessageId,
}: {
  userId: string;
  matchId: string;
  sentMessageId: string | null;
}) {
  useEffect(() => {
    if (!sentMessageId) return;

    const storageKey = `chat-sent:${sentMessageId}`;
    if (window.sessionStorage.getItem(storageKey)) return;

    window.sessionStorage.setItem(storageKey, "true");
    trackEvent(AnalyticsEvents.CHAT_SENT, {
      user_id: userId,
      match_id: matchId,
      source: "chat",
    });
  }, [matchId, sentMessageId, userId]);

  return null;
}
