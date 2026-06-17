import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StepShellProps = {
  stepLabel: string;
  title: string;
  description: string;
  children: ReactNode;
  progress?: number;
  className?: string;
};

export function StepShell({
  stepLabel,
  title,
  description,
  children,
  progress,
  className,
}: StepShellProps) {
  const progressValue =
    typeof progress === "number" ? Math.max(0, Math.min(progress, 100)) : null;

  return (
    <section
      className={cn(
        "rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-5 shadow-[0_18px_60px_rgba(74,59,42,0.10)] sm:p-6",
        className,
      )}
    >
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {stepLabel}
        </p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2rem]">
          {title}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </header>

      {progressValue !== null ? (
        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-[#ece3d3]">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-6">{children}</div>
    </section>
  );
}
