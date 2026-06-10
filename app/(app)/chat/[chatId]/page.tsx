import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ChatMessageForm } from "./chat-message-form";
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

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .returns<MessageRow[]>();

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
      <div className="mx-auto flex min-h-[calc(100vh-97px)] w-full max-w-md flex-col md:max-w-3xl lg:max-w-5xl">
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
          <Link
            href={`/date-plan/${match.id}`}
            className="mt-4 block rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground"
          >
            Plan a date
          </Link>
        </header>

        <section className="mt-4 flex-1 rounded-[2rem] border bg-background p-4 shadow-sm">
          <div className="space-y-3">
            {(messages ?? []).length === 0 ? (
              <div className="rounded-[1.5rem] bg-muted/60 p-4 text-center">
                <p className="text-sm font-medium text-foreground">
                  Your chat is ready.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  You both chose to continue after your guided conversation.
                  Great conversations deserve another one.
                </p>
              </div>
            ) : null}

            {(messages ?? []).map((message) => {
              const isMine = message.sender_id === user.id;

              return (
                <div
                  key={message.id}
                  className={isMine ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      isMine
                        ? "max-w-[80%] rounded-[1.25rem] bg-accent px-4 py-3 text-sm leading-6 text-accent-foreground md:max-w-[68%]"
                        : "max-w-[80%] rounded-[1.25rem] bg-muted px-4 py-3 text-sm leading-6 text-foreground md:max-w-[68%]"
                    }
                  >
                    {message.body}
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
          className="mt-4 block rounded-2xl border bg-background px-4 py-4 text-center text-base font-semibold"
        >
          Back to Discover
        </Link>
      </div>
    </main>
  );
}
