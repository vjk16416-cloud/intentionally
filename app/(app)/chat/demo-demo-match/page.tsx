"use client";

import Link from "next/link";
import { useState } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client";

type Message = {
  id: number;
  from: "maya" | "you";
  text: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    from: "maya",
    text: "That was actually a nice way to start. Less awkward than a blank chat.",
  },
  {
    id: 2,
    from: "you",
    text: "Yeah, the questions made it easier to say something real.",
  },
  {
    id: 3,
    from: "maya",
    text: "Your answer about effort being consistency was interesting.",
  },
  {
    id: 4,
    from: "you",
    text: "I meant it. I think small consistent things say more than big gestures.",
  },
  {
    id: 5,
    from: "maya",
    text: "Coffee this weekend?",
  },
];

export default function DemoChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");

  function sendMessage() {
    const trimmed = draft.trim();

    if (!trimmed) return;

    trackAnalyticsEvent("chatMessageSent");

    setMessages((current) => [
      ...current,
      {
        id: current.length + 1,
        from: "you",
        text: trimmed,
      },
    ]);

    setDraft("");
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
      <div className="mx-auto flex min-h-[calc(100vh-97px)] w-full max-w-md flex-col">
        <header className="rounded-[1.75rem] border bg-background p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Chat unlocked
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            You and Maya both chose to continue.
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The Q&amp;A helped start the conversation before chat opened.
          </p>
        </header>

        <section className="mt-4 rounded-[1.75rem] border bg-accent p-4 text-accent-foreground shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-accent-foreground/60">
            Q&amp;A insight
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            You both value honest, low-pressure communication.
          </h2>
          <p className="mt-2 text-sm leading-6 text-accent-foreground/75">
            Your answers suggest you both prefer effort that feels consistent,
            thoughtful and natural, not forced.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/10 px-3 py-3">
              <p className="text-xs font-semibold">Shared value</p>
              <p className="mt-1 text-[11px] leading-4 text-accent-foreground/70">
                Clear communication
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-3 py-3">
              <p className="text-xs font-semibold">Conversation style</p>
              <p className="mt-1 text-[11px] leading-4 text-accent-foreground/70">
                Calm and intentional
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 flex-1 space-y-3 rounded-[2rem] border bg-background p-4 shadow-sm">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.from === "you"
                  ? "ml-auto max-w-[82%] rounded-2xl bg-accent px-4 py-3 text-sm leading-5 text-accent-foreground"
                  : "max-w-[82%] rounded-2xl bg-muted px-4 py-3 text-sm leading-5"
              }
            >
              {message.text}
            </div>
          ))}
        </section>

        <div className="mt-4 rounded-[1.5rem] border bg-background p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message Maya..."
              className="min-w-0 flex-1 rounded-2xl bg-muted px-4 py-3 text-sm outline-none"
            />

            <button
              type="button"
              onClick={sendMessage}
              className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
            >
              Send
            </button>
          </div>
        </div>

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
