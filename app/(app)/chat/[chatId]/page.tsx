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
    <main className="relative isolate min-h-[calc(100vh-57px)] overflow-hidden bg-[#071411] px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-5 text-[#FFF8EC] lg:py-5">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_0%,rgba(243,161,127,0.18)_0%,transparent_28%),radial-gradient(circle_at_86%_16%,rgba(243,161,127,0.13)_0%,transparent_30%),linear-gradient(180deg,#071411_0%,#0D1714_52%,#050D0B_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_58%,rgba(0,0,0,0.5)_100%)]" />

      <ChatSentTracker
        userId={user.id}
        matchId={match.id}
        sentMessageId={query.sent ?? null}
      />
      <div className="mx-auto flex min-h-[calc(100vh-97px)] w-full max-w-md flex-col md:max-w-3xl lg:max-w-5xl">
        <header className="rounded-[2rem] border border-[#FFF8EC]/12 bg-[#0D1714]/82 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#F3A17F]">
                Chat unlocked
              </p>
              <h1 className="mt-2 font-serif text-2xl font-medium leading-tight tracking-[-0.03em] text-[#FFF8EC] md:text-3xl">
                You and {otherName}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#FFF8EC]/70">
                You both chose Continue after your Vibe Check. This is a quieter
                space to build trust, not rush the next step.
              </p>
            </div>

            <Link
              href={`/date-plan/${match.id}`}
              className="rounded-2xl bg-[#F3A17F] px-4 py-3 text-center text-sm font-semibold text-[#13251F] shadow-[0_16px_36px_rgba(243,161,127,0.22)] transition hover:bg-[#EA9270] md:min-w-36"
            >
              Plan a date
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-[#FFF8EC]/10 bg-[#FFF8EC]/6 px-4 py-3 text-xs leading-5 text-[#FFF8EC]/68">
            <span className="font-semibold text-[#FFF8EC]">Mutual match</span>
            <span aria-hidden="true">·</span>
            <span>Vibe Check complete</span>
            <span aria-hidden="true">·</span>
            <span>Share at your own pace.</span>
          </div>
        </header>

        <section className="mt-4 flex-1 rounded-[2rem] border border-[#FFF8EC]/12 bg-[#0D1714]/72 p-4 pb-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <div className="space-y-4">
            {(messages ?? []).length === 0 ? (
              <FallbackPanel
                eyebrow="Messages"
                title="Chat is open"
                description="You both chose Continue after the Vibe Check. A simple first message is enough: mention something you noticed, ask one thoughtful question, or suggest a gentle next step."
                note="Safety note: keep early plans public, simple, and easy to leave."
                className="border-[#FFF8EC]/12 bg-[#FFF8EC]/6 text-center text-[#FFF8EC]"
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
                          ? "rounded-[1.25rem] rounded-br-md bg-[#F3A17F] px-4 py-3 text-sm leading-6 text-[#13251F] shadow-sm"
                          : "rounded-[1.25rem] rounded-bl-md border border-[#FFF8EC]/12 bg-[#FFF8EC]/8 px-4 py-3 text-sm leading-6 text-[#FFF8EC] shadow-sm"
                      }
                    >
                      {message.body}
                    </div>
                    <p
                      className={
                        isMine
                          ? "mt-1 px-2 text-right text-[11px] text-[#FFF8EC]/52"
                          : "mt-1 px-2 text-left text-[11px] text-[#FFF8EC]/52"
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
          className="mt-4 block rounded-2xl border border-[#FFF8EC]/12 bg-[#FFF8EC]/6 px-4 py-4 text-center text-base font-semibold text-[#FFF8EC] shadow-sm transition hover:bg-[#FFF8EC]/10"
        >
          Back to Discover
        </Link>
      </div>
    </main>
  );
}
