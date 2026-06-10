import Link from "next/link";
import { redirect } from "next/navigation";

import {
  QA_VISIBILITY_OPTIONS,
  VISIBILITY_MODES,
  parseQaVisibilityMode,
} from "@/lib/qa/visibility";
import { createClient } from "@/lib/supabase/server";

export default async function QaVisibilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ visibility?: string }>;
}) {
  const { sessionId } = await params;
  const query = await searchParams;
  const selectedMode = parseQaVisibilityMode(query.visibility);
  const isDemoSession = sessionId.startsWith("demo-");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session } = isDemoSession
    ? { data: null }
    : await supabase
        .from("qa_sessions")
        .select("id, match_id")
        .eq("id", sessionId)
        .maybeSingle();

  if (!isDemoSession && !session) {
    redirect("/discover");
  }

  if (!isDemoSession && session) {
    const { data: match } = await supabase
      .from("matches")
      .select("id, user_a, user_b")
      .eq("id", session.match_id)
      .maybeSingle();

    if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
      redirect("/discover");
    }
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center md:max-w-3xl">
        <section className="w-full rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <Link
            href={`/qa/${sessionId}`}
            className="text-sm font-medium text-muted-foreground"
          >
            Back
          </Link>

          <p className="mt-6 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Guided questions. Chosen visibility. Mutual reveal.
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Choose how you appear
          </h1>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            You can change this during the Q&amp;A. Full profiles only unlock
            if you both choose Continue.
          </p>

          <form
            action={`/qa/${sessionId}`}
            className="mt-6 grid gap-3 md:grid-cols-3"
          >
            <input type="hidden" name="started" value="true" />

            {VISIBILITY_MODES.map((mode) => {
              const option = QA_VISIBILITY_OPTIONS[mode];

              return (
                <label key={mode} className="block cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value={mode}
                    defaultChecked={selectedMode === mode}
                    className="peer sr-only"
                  />
                  <span className="block rounded-[1.5rem] border border-border bg-background p-4 transition peer-checked:border-accent peer-checked:bg-secondary">
                    <span className="flex items-start justify-between gap-4">
                      <span>
                        <span className="block text-base font-semibold">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-foreground">
                          {option.copy}
                        </span>
                      </span>
                      <span className="mt-1 h-4 w-4 rounded-full border border-accent bg-card peer-checked:bg-accent" />
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                      {option.helper}
                    </span>
                  </span>
                </label>
              );
            })}

            <button
              type="submit"
              className="w-full rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground md:col-span-3"
            >
              Enter Q&amp;A Room
            </button>
          </form>

          <div className="mt-5 rounded-[1.25rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground">
            Your choice is about comfort, not judgement. You can change it
            anytime.
          </div>
        </section>
      </div>
    </main>
  );
}
