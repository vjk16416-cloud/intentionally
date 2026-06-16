"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, Heart, MessageCircle, ShieldCheck, Video } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  demoDatePlans,
  demoMessages,
  demoProfile,
  demoQuestions,
  demoSlots,
} from "./demo-data";

const journey = [
  { href: "/demo/discover", label: "Discover" },
  { href: "/demo/profile", label: "Profile" },
  { href: "/demo/schedule", label: "Invite + schedule" },
  { href: "/demo/vibe-check", label: "Guided Vibe Check" },
  { href: "/demo/decision", label: "Continue/Pass" },
  { href: "/demo/chat", label: "Chat" },
  { href: "/demo/date-plan", label: "Date Plan" },
];

export function DemoBadge() {
  return (
    <div className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
      Demo mode: safe mock data only.
    </div>
  );
}

export function DemoPageShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-5">
      <div className="mx-auto w-full max-w-md space-y-5 md:max-w-4xl lg:max-w-6xl">
        <header className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/demo" className="text-base font-semibold">
              Intentionally demo
            </Link>
            <DemoBadge />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <DemoNav />
        </header>

        {children}
      </div>
    </main>
  );
}

export function DemoNav() {
  return (
    <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {journey.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="shrink-0 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm hover:bg-muted"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function DemoIndex() {
  const cards = [
    {
      href: "/demo/discover",
      title: "Discover",
      text: "Review the profile browsing surface with mock profiles.",
      icon: Heart,
    },
    {
      href: "/demo/profile",
      title: "Profile",
      text: "See the deeper profile preview before scheduling.",
      icon: ShieldCheck,
    },
    {
      href: "/demo/schedule",
      title: "Schedule Vibe Check",
      text: "Preview an accepted invite and safe mock time.",
      icon: CalendarDays,
    },
    {
      href: "/demo/vibe-check",
      title: "Guided Vibe Check",
      text: "Step through guided questions without any real call.",
      icon: Video,
    },
    {
      href: "/demo/decision",
      title: "Continue or Pass",
      text: "Preview the private mutual decision moment.",
      icon: CheckCircle2,
    },
    {
      href: "/demo/chat",
      title: "Chat",
      text: "Chats unlock only after the Guided Vibe Check and mutual Continue.",
      icon: MessageCircle,
    },
    {
      href: "/demo/date-plan",
      title: "Date Plan",
      text: "Review safe first-date suggestions.",
      icon: CalendarDays,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition hover:bg-muted"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {card.text}
            </p>
          </Link>
        );
      })}
    </section>
  );
}

export function DemoProfileCard({
  profile = demoProfile,
  compact = false,
}: {
  profile?: typeof demoProfile;
  compact?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm">
      <div className={cn("relative bg-neutral-950", compact ? "h-80" : "h-[30rem]")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.photoUrl}
          alt=""
          className="h-full w-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10" />
        <div className="absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground">
          {profile.intention}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
          <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/65">
            Intentionally
          </p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">
            {profile.name}, {profile.age}
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/75">
            {profile.neighbourhood}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <section className="rounded-[1.25rem] border border-border bg-background p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Prompt
          </p>
          <p className="mt-2 text-base font-semibold">{profile.prompt}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {profile.answer}
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          {profile.trustCues.map((cue) => (
            <span
              key={cue}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground"
            >
              {cue}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function DemoDiscover() {
  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <DemoProfileCard />

      <aside className="space-y-4 rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Discover
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Browse slowly.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            If they like you back, you&apos;ll match. Then either of you can
            send a Vibe Check invite.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/demo/discover"
            className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 rounded-2xl" })}
          >
            Not for me
          </Link>
          <Link
            href="/demo/profile"
            className={buttonVariants({ size: "lg", className: "h-12 rounded-2xl" })}
          >
            I&apos;m interested
          </Link>
        </div>

        <div className="rounded-[1.25rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground">
          Chat unlocks if you both choose to continue after the Guided Vibe
          Check.
        </div>
      </aside>
    </section>
  );
}

export function DemoProfileDetail() {
  return (
    <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <DemoProfileCard compact />
      <div className="space-y-4">
        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">
            Why this profile is shown
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            In this demo, you and Maya have mutually liked each other. The next
            step is sending a Vibe Check invite before chat can unlock.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {["Video-first", "Private choice", "Safety-led"].map((item) => (
              <div key={item} className="rounded-[1.25rem] bg-background p-4">
                <p className="text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <Link
          href="/demo/schedule"
          className={buttonVariants({ size: "lg", className: "h-12 w-full rounded-2xl" })}
        >
          Send Vibe Check invite
        </Link>
      </div>
    </section>
  );
}

export function DemoSchedule() {
  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {demoSlots.map((slot) => (
          <Link
            key={`${slot.label}-${slot.time}`}
            href="/demo/vibe-check"
            className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition hover:bg-muted"
          >
            <p className="text-sm font-semibold">{slot.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {slot.time}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {slot.helper}
            </p>
          </Link>
        ))}
      </div>

      <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold">Invite accepted</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Maya accepted your Vibe Check invite. Choose a mock time, then join
          the Guided Vibe Check. The demo never creates a real session.
        </p>
      </section>
    </section>
  );
}

export function DemoVibeCheck() {
  const [index, setIndex] = useState(0);
  const isLast = index === demoQuestions.length - 1;

  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] bg-neutral-950 p-3 text-white shadow-xl">
        <div className="grid gap-3 md:grid-cols-[1fr_1.1fr_1fr]">
          <VideoTile label="You" status="Speaking now" />
          <div className="rounded-[1.5rem] bg-white p-5 text-center text-black">
            <p className="text-xs uppercase tracking-[0.22em] text-black/45">
              Question {index + 1} of {demoQuestions.length}
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-8 tracking-tight">
              {demoQuestions[index]}
            </h2>
            <p className="mt-3 text-sm leading-6 text-black/60">
              No perfect answer. Just be honest.
            </p>
          </div>
          <VideoTile label="Maya" status="Listening mode" />
        </div>
      </div>

      <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((index + 1) / demoQuestions.length) * 100}%` }}
          />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 rounded-2xl"
            onClick={() => setIndex((current) => Math.min(current + 1, demoQuestions.length - 1))}
          >
            Skip
          </Button>
          {isLast ? (
            <Link
              href="/demo/decision"
              className={buttonVariants({ size: "lg", className: "h-12 rounded-2xl" })}
            >
              Finish
            </Link>
          ) : (
            <Button
              type="button"
              size="lg"
              className="h-12 rounded-2xl"
              onClick={() => setIndex((current) => Math.min(current + 1, demoQuestions.length - 1))}
            >
              Next
            </Button>
          )}
        </div>
      </section>
    </section>
  );
}

function VideoTile({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex min-h-48 flex-col justify-between rounded-[1.5rem] bg-neutral-800 p-4">
      <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
        {label}
      </span>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl font-semibold">
        {label[0]}
      </div>
      <div className="rounded-2xl bg-white p-3 text-black">
        <p className="text-xs font-semibold">{status}</p>
      </div>
    </div>
  );
}

export function DemoDecision() {
  const [choice, setChoice] = useState<"continue" | "pass" | null>(null);

  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Private decision
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">
        Choose what feels right.
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Your choice stays private. Chat unlocks if you both choose to continue.
      </p>

      {choice ? (
        <div className="mt-5 rounded-[1.5rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground">
          <p className="font-semibold text-foreground">
            {choice === "continue" ? "You both chose Continue." : "No problem."}
          </p>
          <p className="mt-1">
            {choice === "continue"
              ? "Your full profiles are now unlocked and chat is open in this demo."
              : "This match closes quietly. They would not be told you passed."}
          </p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          size="lg"
          className="h-12 rounded-2xl"
          onClick={() => setChoice("continue")}
        >
          Continue
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 rounded-2xl"
          onClick={() => setChoice("pass")}
        >
          Pass privately
        </Button>
      </div>

      <Link
        href="/demo/chat"
        className={cn(
          buttonVariants({ variant: choice === "continue" ? "default" : "outline", size: "lg" }),
          "mt-4 h-12 w-full rounded-2xl",
        )}
      >
        Preview unlocked chat
      </Link>
    </section>
  );
}

export function DemoChat() {
  const [messages, setMessages] = useState(demoMessages);
  const [draft, setDraft] = useState("");

  function sendMessage() {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { id: current.length + 1, from: "you", text: trimmed },
    ]);
    setDraft("");
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Chats unlocked
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          You and Maya both chose to continue.
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Chats unlock only after your Guided Vibe Check and mutual Continue.
          This message thread is local mock data only.
        </p>
      </div>

      <div className="space-y-3 rounded-[2rem] border border-border bg-card p-4 shadow-sm">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.from === "you"
                ? "ml-auto max-w-[82%] rounded-2xl bg-accent px-4 py-3 text-sm leading-5 text-accent-foreground md:max-w-[68%]"
                : "max-w-[82%] rounded-2xl bg-muted px-4 py-3 text-sm leading-5 md:max-w-[68%]"
            }
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-border bg-card p-3 shadow-sm">
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
          <Button type="button" onClick={sendMessage} className="h-11 rounded-2xl">
            Send
          </Button>
        </div>
      </div>

      <Link
        href="/demo/date-plan"
        className={buttonVariants({ size: "lg", className: "h-12 w-full rounded-2xl" })}
      >
        Plan a date
      </Link>
    </section>
  );
}

export function DemoDatePlan() {
  const [sharedPlan, setSharedPlan] = useState<string | null>(null);

  return (
    <section className="space-y-4">
      <section className="rounded-[1.75rem] bg-accent p-5 text-accent-foreground shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-accent-foreground/60">
          Safety-first suggestion
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">
          Keep it public, simple and time-boxed.
        </h2>
        <p className="mt-2 text-sm leading-6 text-accent-foreground/75">
          First dates work best when both people can arrive easily, leave
          comfortably and share the plan with someone they trust.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {demoDatePlans.map((option) => (
          <article
            key={option.key}
            className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {option.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {option.place}
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs">
                {option.time}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {option.reason}
            </p>
            <Button
              type="button"
              className="mt-4 h-11 w-full rounded-2xl"
              onClick={() => setSharedPlan(option.title)}
            >
              Share this plan
            </Button>
          </article>
        ))}
      </section>

      {sharedPlan ? (
        <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Plan shared
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {sharedPlan}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This is a local demo state. No real match is notified.
          </p>
        </section>
      ) : null}
    </section>
  );
}
