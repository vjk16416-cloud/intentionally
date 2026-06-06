import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type ChatRow = {
  id: string;
  match_id: string;
};

type MatchRow = {
  id: string;
  user_a: string;
  user_b: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: chat } = await supabase
    .from("chats")
    .select("id, match_id")
    .eq("id", chatId)
    .maybeSingle<ChatRow>();

  if (!chat) {
    redirect("/discover");
  }

  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("id", chat.match_id)
    .maybeSingle<MatchRow>();

  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    redirect("/discover");
  }

  const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;

  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", otherUserId)
    .maybeSingle<ProfileRow>();

  const otherName = otherProfile?.display_name ?? "your match";

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
      <div className="mx-auto flex min-h-[calc(100vh-97px)] w-full max-w-md flex-col">
        <header className="rounded-[1.75rem] border bg-background p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Chat unlocked
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            You and {otherName} both chose to continue.
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The Q&amp;A helped start the conversation before chat opened.
          </p>
        </header>

        <section className="mt-4 flex-1 rounded-[2rem] border bg-background p-4 text-center shadow-sm">
          <div className="flex h-full min-h-64 flex-col items-center justify-center">
            <p className="text-sm font-medium text-foreground">
              Your chat is ready.
            </p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
              Real messaging is the next milestone. For now, this confirms that
              mutual Continue can unlock a real chat record.
            </p>
          </div>
        </section>

        <Link
          href="/discover"
          className="mt-4 block rounded-2xl border bg-background px-4 py-4 text-center text-base font-semibold"
        >
          Back to Discover
        </Link>
      </div>
    </main>
  );
}
