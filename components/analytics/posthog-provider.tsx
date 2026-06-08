"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { initAnalytics } from "@/lib/analytics/client";

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initAnalytics();
  }, []);

  return children;
}
