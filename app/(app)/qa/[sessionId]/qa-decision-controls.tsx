"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type QaDecision = "continue" | "pass";

type QaDecisionButtonProps = ComponentProps<"button"> & {
  decision: QaDecision;
};

/** Server actions record the private decision only after it is saved. */
export function QaDecisionButton({
  decision,
  ...props
}: QaDecisionButtonProps) {
  void decision;
  return <button {...props} />;
}

type QaDecisionLinkProps = ComponentProps<typeof Link> & {
  decision: QaDecision;
  children: ReactNode;
};

export function QaDecisionLink({
  decision,
  ...props
}: QaDecisionLinkProps) {
  void decision;
  return <Link {...props} />;
}
