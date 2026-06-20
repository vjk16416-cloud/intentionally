import Link from "next/link";
import { redirect } from "next/navigation";

import { FallbackPanel } from "@/components/fallback-state";
import { createClient } from "@/lib/supabase/server";

import { ChatMessageForm } from "./chat-message-form";
import { ChatSentTracker } from "./chat-sent-tracker";
import { sendMessage } from "./actions";

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

type MessageRow = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function messageTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ chatId: string }>;
  searchParams: Promise<{ sent?: string }>;
}) {
  const { chatId } = await params;
  const query = await searchParams;
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

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .returns<MessageRow[]>();

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background via-[#fbf3e8] to-muted px-4 py-5">
      <ChatSentTracker
        userId={user.id}
        matchId={match.id}
        sentMessageId={query.sent ?? null}
      />
      <div className="mx-auto flex min-h-[calc(100vh-97px)] w-full max-w-md flex-col md:max-w-3xl lg:max-w-5xl">
        <header className="rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-5 shadow-[0_18px_60px_rgba(74,59,42,0.10)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Chat unlocked
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight">
                You and {otherName}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                You both chose Continue after your Vibe Check. This chat is a
                quieter space to keep building trust.
              </p>
            </div>

            <Link
              href={`/date-plan/${match.id}`}
              className="rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground shadow-sm md:min-w-36"
            >
              Plan a date
            </Link>
          </div>

          <div className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-2xl border border-[#eadfce] bg-background/70 px-4 py-3">
              <p className="font-semibold text-foreground">Mutual match</p>
              <p className="mt-1 text-xs leading-5">You both liked each other.</p>
            </div>
            <div className="rounded-2xl border border-[#eadfce] bg-background/70 px-4 py-3">
              <p className="font-semibold text-foreground">
                Vibe Check complete
              </p>
              <p className="mt-1 text-xs leading-5">Continue was mutual.</p>
            </div>
            <div className="rounded-2xl border border-[#eadfce] bg-background/70 px-4 py-3">
              <p className="font-semibold text-foreground">Keep it steady</p>
              <p className="mt-1 text-xs leading-5">
                Share at your own pace.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-4 flex-1 rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-4 shadow-[0_18px_60px_rgba(74,59,42,0.08)]">
          <div className="space-y-4">
            {(messages ?? []).length === 0 ? (
              <FallbackPanel
                eyebrow="Messages"
                title="Chat is open"
                description="You both chose Continue after the Vibe Check. A simple first message is enough: mention something you noticed, ask one thoughtful question, or suggest a gentle next step."
                note="Safety note: keep early plans public, simple, and easy to leave."
                className="text-center"
              />
            ) : null}

            {(messages ?? []).map((message) => {
              const isMine = message.sender_id === user.id;

              return (
                <div
                  key={message.id}
                  className={isMine ? "flex justify-end" : "flex justify-start"}
                >
                  <div className="max-w-[82%] md:max-w-[68%]">
                    <div
                      className={
                        isMine
                          ? "rounded-[1.25rem] rounded-br-md bg-accent px-4 py-3 text-sm leading-6 text-accent-foreground shadow-sm"
                          : "rounded-[1.25rem] rounded-bl-md border border-[#eadfce] bg-background px-4 py-3 text-sm leading-6 text-foreground shadow-sm"
                      }
                    >
                      {message.body}
                    </div>
                    <p
                      className={
                        isMine
                          ? "mt-1 px-2 text-right text-[11px] text-muted-foreground"
                          : "mt-1 px-2 text-left text-[11px] text-muted-foreground"
                      }
                    >
                      {messageTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <ChatMessageForm
          chatId={chatId}
          otherName={otherName}
          action={sendMessage}
        />

        <Link
          href="/discover"
          className="mt-4 block rounded-2xl border border-[#e6ded0] bg-background px-4 py-4 text-center text-base font-semibold shadow-sm"
        >
          Back to Discover
        </Link>
      </div>
    </main>
  );
}
