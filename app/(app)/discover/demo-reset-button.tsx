"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ResetResponse =
  | {
      ok: true;
      demoProfilesFound: number;
      swipesDeleted: number;
      reciprocalSwipesDeleted: number;
      matchesDeleted: number;
    }
  | {
      ok: false;
      error: string;
    };

const SHOW_DEMO_RESET = process.env.NODE_ENV !== "production";

export function DemoResetButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!SHOW_DEMO_RESET) {
    return null;
  }

  async function handleReset() {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/internal-demo/reset", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      });

      const data = (await response.json()) as ResetResponse;

      if (!response.ok || !data.ok) {
        setError(data.ok ? "Reset failed." : data.error);
        return;
      }

      setMessage(
        `Reset complete. ${data.demoProfilesFound} demo profiles found, ${data.swipesDeleted} swipes deleted, ${data.reciprocalSwipesDeleted} reciprocal swipes deleted, ${data.matchesDeleted} matches deleted.`,
      );
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={handleReset}
        disabled={loading}
        className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Resetting..." : "Reset demo profiles"}
      </button>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Internal demo only. Clears your interactions with the seeded demo
        profiles.
      </p>
      {message ? (
        <p className="mt-2 text-xs leading-5 text-[#46634e]">{message}</p>
      ) : null}
      {error ? <p className="mt-2 text-xs leading-5 text-red-700">{error}</p> : null}
    </div>
  );
}
