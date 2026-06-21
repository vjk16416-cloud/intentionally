import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type ChatRow = { id: string; match_id: string; created_at: string };
type MatchRow = { id: string; user_a: string; user_b: string };
type ProfileRow = { id: string; display_name: string | null };
type MessageRow = { chat_id: string; sender_id: string; body: string; created_at: string };

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: chats } = await supabase
    .from("chats")
    .select("id, match_id, created_at")
    .order("created_at", { ascending: false })
    .returns<ChatRow[]>();
  const chatRows = chats ?? [];
  const matchIds = chatRows.map((chat) => chat.match_id);
  const { data: matches } = matchIds.length
    ? await supabase.from("matches").select("id, user_a, user_b").in("id", matchIds).returns<MatchRow[]>()
    : { data: [] as MatchRow[] };
  const otherIds = (matches ?? []).map((match) => match.user_a === user.id ? match.user_b : match.user_a);
  const { data: profiles } = otherIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", otherIds).returns<ProfileRow[]>()
    : { data: [] as ProfileRow[] };
  const { data: messages } = chatRows.length
    ? await supabase.from("messages").select("chat_id, sender_id, body, created_at").in("chat_id", chatRows.map((chat) => chat.id)).order("created_at", { ascending: false }).returns<MessageRow[]>()
    : { data: [] as MessageRow[] };
  const matchById = new Map((matches ?? []).map((match) => [match.id, match]));
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const latestByChat = new Map<string, MessageRow>();
  for (const message of messages ?? []) if (!latestByChat.has(message.chat_id)) latestByChat.set(message.chat_id, message);

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background via-[#fbf3e8] to-muted px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5 lg:py-5">
      <div className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-5xl">
        <header className="rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-5 shadow-[0_18px_60px_rgba(74,59,42,0.10)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Messages</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Your conversations</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Chats open only after you both choose Continue. Take each conversation at your own pace.</p>
        </header>
        {chatRows.length === 0 ? (
          <section className="mt-4 rounded-[2rem] border border-dashed border-[#d8cbbb] bg-white/80 p-5 text-sm leading-6 text-muted-foreground">
            <p className="font-semibold text-foreground">No messages yet</p>
            <p className="mt-2">When a Vibe Check ends with a mutual Continue, the conversation will appear here.</p>
            <Link href="/discover" className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Go to Discover</Link>
          </section>
        ) : (
          <section className="mt-4 space-y-2.5" aria-label="Unlocked conversations">
            {chatRows.map((chat) => {
              const match = matchById.get(chat.match_id);
              const otherId = match?.user_a === user.id ? match.user_b : match?.user_a;
              const name = otherId ? profileById.get(otherId)?.display_name ?? "Your match" : "Your match";
              const latest = latestByChat.get(chat.id);
              return <Link key={chat.id} href={`/chat/${chat.id}`} className="block rounded-[1.5rem] border border-[#e6ded0] bg-[#fffaf3] p-4 shadow-[0_10px_30px_rgba(74,59,42,0.06)] transition hover:bg-[#fffdf8]">
                <div className="flex items-baseline justify-between gap-3"><h2 className="text-base font-semibold">{name}</h2><span className="shrink-0 text-xs text-muted-foreground">{timeLabel(latest?.created_at ?? chat.created_at)}</span></div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{latest ? `${latest.sender_id === user.id ? "You: " : ""}${latest.body}` : "Chat is open. A simple first message is enough."}</p>
              </Link>;
            })}
          </section>
        )}
      </div>
    </main>
  );
}
