import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FallbackPanelProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  note?: ReactNode;
  tone?: "neutral" | "error";
  className?: string;
};

export function FallbackPanel({
  eyebrow,
  title,
  description,
  action,
  note,
  tone = "neutral",
  className,
}: FallbackPanelProps) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border px-5 py-6 shadow-[0_16px_44px_rgba(74,59,42,0.08)] sm:px-6 sm:py-7",
        tone === "error"
          ? "border-[#d9a6a0]/40 bg-[#fff7f5]"
          : "border-[#e6ded0] bg-[#fffaf3]",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}

      <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2rem]">
        {title}
      </h1>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {note ? (
        <div
          className={cn(
            "mt-5 rounded-[1.35rem] border px-4 py-3 text-sm leading-6",
            tone === "error"
              ? "border-[#d9a6a0]/40 bg-white text-[#5a2d2a]"
              : "border-[#eadfce] bg-background/75 text-muted-foreground",
          )}
        >
          {note}
        </div>
      ) : null}

      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}

type FallbackLoadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function FallbackLoading({
  eyebrow,
  title,
  description,
}: FallbackLoadingProps) {
  return (
    <section className="rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] px-5 py-6 shadow-[0_16px_44px_rgba(74,59,42,0.08)] sm:px-6 sm:py-7">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2rem]">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>

      <div className="mt-6 space-y-3">
        <div className="h-24 animate-pulse rounded-[1.5rem] border border-[#eadfce] bg-background/75" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-24 animate-pulse rounded-[1.35rem] border border-[#eadfce] bg-background/75" />
          <div className="h-24 animate-pulse rounded-[1.35rem] border border-[#eadfce] bg-background/75" />
        </div>
      </div>
    </section>
  );
}

type FallbackActionLinkProps = {
  href: string;
  children: ReactNode;
  primary?: boolean;
};

export function FallbackActionLink({
  href,
  children,
  primary = true,
}: FallbackActionLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold shadow-sm transition",
        primary
          ? "bg-accent text-accent-foreground hover:opacity-90"
          : "border border-[#d8d0c3] bg-[#fffdf8] text-foreground hover:bg-[#f3eee5]",
      )}
    >
      {children}
    </Link>
  );
}
