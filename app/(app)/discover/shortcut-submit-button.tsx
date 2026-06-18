"use client";

import { useFormStatus } from "react-dom";

export function ShortcutSubmitButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-2xl border border-[#d8d0c3] bg-[#fffdf8] px-3 text-sm font-semibold text-foreground transition hover:bg-[#f3eee5] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Opening..." : children}
    </button>
  );
}
