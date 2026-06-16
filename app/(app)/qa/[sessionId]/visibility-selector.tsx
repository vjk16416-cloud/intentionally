"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  QA_VISIBILITY_OPTIONS,
  type QaVisibilityMode,
} from "@/lib/qa/visibility";
import { cn } from "@/lib/utils";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

type VisibilitySelectorProps = {
  mode: QaVisibilityMode;
};

export function VisibilitySelector({ mode }: VisibilitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<QaVisibilityMode>(mode);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function applyMode() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("visibility", selectedMode);
    trackAnalyticsEvent("visibilitySelected", {
      properties: {
        visibility_mode: selectedMode,
        surface: "in_room_selector",
      },
    });
    router.replace(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  }

  const activeOption = QA_VISIBILITY_OPTIONS[mode];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setSelectedMode(mode);
          setIsOpen((current) => !current);
        }}
        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm"
        aria-expanded={isOpen}
      >
        Private · {activeOption.shortLabel}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-11 z-20 w-[min(19rem,calc(100vw-2rem))] rounded-[1.5rem] border border-white/12 bg-[#f8efe2] p-4 text-[#241c17] shadow-2xl">
          <p className="text-sm font-semibold">
            Choose how you appear during this Guided Vibe Check.
          </p>

          <div className="mt-4 space-y-2">
            {Object.entries(QA_VISIBILITY_OPTIONS).map(([value, option]) => {
              const optionMode = value as QaVisibilityMode;
              const isSelected = selectedMode === optionMode;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedMode(optionMode)}
                  className={cn(
                    "w-full rounded-2xl border p-3 text-left transition",
                    isSelected
                      ? "border-[#7d8a75] bg-[#e2e8dc]"
                      : "border-[#d8ccbd] bg-[#fff8ef]",
                  )}
                >
                  <span className="block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#6f6258]">
                    {option.roomCopy}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={applyMode}
            className="mt-4 w-full rounded-2xl bg-[#7d8a75] px-4 py-3 text-sm font-semibold text-[#fff8ef]"
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}
