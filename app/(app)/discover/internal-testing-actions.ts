"use server";

import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canUseInternalTestingShortcuts } from "@/lib/internal-demo/access";
import { INTERNAL_DEMO_PROFILE_NAMES } from "@/lib/internal-demo/profiles";
import { type Intention } from "@/lib/qa/questions";
import { selectThreeQuestions } from "@/lib/qa/select";
import { createClient } from "@/lib/supabase/server";

type AdminClient = ReturnType<typeof admin>;

type DemoProfile = {
  id: string;
  display_name: string | null;
  intention: string | null;
};

type MatchRow = {
  id: string;
  status: string;
};

type QaSessionRow = {
  id: string;
};

type ChatRow = {
  id: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function admin() {
  return createServiceRoleClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false },
    },
  );
}

function matchPair(userId: string, otherId: string) {
  return {
    user_a: userId < otherId ? userId : otherId,
    user_b: userId < otherId ? otherId : userId,
  };
}

function normalizeIntentions(values: Array<string | null | undefined>) {
  const intentions = values.filter((value): value is Intention =>
    value === "long-term" ||
    value === "short-term" ||
    value === "figuring-it-out",
  );

  return intentions.length > 0 ? intentions : (["long-term"] satisfies Intention[]);
}

async function requireInternalTester() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!canUseInternalTestingShortcuts(user.email)) {
    redirect("/discover");
  }

  return user;
}

async function getDemoProfile(adminClient: AdminClient, userId: string) {
  const { data, error } = await adminClient
    .from("profiles")
    .select("id, display_name, intention")
    .in("display_name", Array.from(INTERNAL_DEMO_PROFILE_NAMES))
    .neq("id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<DemoProfile>();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No internal demo profile is available.");
  }

  return data;
}

async function ensureTestMatch(adminClient: AdminClient, userId: string) {
  const demoProfile = await getDemoProfile(adminClient, userId);
  const { user_a, user_b } = matchPair(userId, demoProfile.id);

  const { data: existingMatch, error: existingMatchError } = await adminClient
    .from("matches")
    .select("id, status")
    .eq("user_a", user_a)
    .eq("user_b", user_b)
    .maybeSingle<MatchRow>();

  if (existingMatchError) {
    throw existingMatchError;
  }

  if (existingMatch) {
    return { match: existingMatch, demoProfile };
  }

  const { data: match, error } = await adminClient
    .from("matches")
    .insert({ user_a, user_b })
    .select("id, status")
    .single<MatchRow>();

  if (error || !match) {
    throw error ?? new Error("Unable to create internal test match.");
  }

  return { match, demoProfile };
}

async function ensureVibeCheckSession(adminClient: AdminClient, userId: string) {
  const { match, demoProfile } = await ensureTestMatch(adminClient, userId);

  const { data: existingSession, error: existingSessionError } =
    await adminClient
      .from("qa_sessions")
      .select("id")
      .eq("match_id", match.id)
      .maybeSingle<QaSessionRow>();

  if (existingSessionError) {
    throw existingSessionError;
  }

  const { data: currentProfile } = await adminClient
    .from("profiles")
    .select("intention")
    .eq("id", userId)
    .maybeSingle<{ intention: string | null }>();

  const questions = selectThreeQuestions(
    normalizeIntentions([currentProfile?.intention, demoProfile.intention]),
  ).map((question) => ({ id: question.id, text: question.text }));

  const scheduledAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  if (existingSession) {
    const { data: session, error } = await adminClient
      .from("qa_sessions")
      .update({
        scheduled_at: scheduledAt,
        proposed_at: new Date().toISOString(),
        proposed_by_id: demoProfile.id,
        confirmed_at: new Date().toISOString(),
        questions,
      })
      .eq("id", existingSession.id)
      .select("id")
      .single<QaSessionRow>();

    if (error || !session) {
      throw error ?? new Error("Unable to update internal Vibe Check session.");
    }

    await adminClient
      .from("matches")
      .update({ status: "qa_scheduled" })
      .eq("id", match.id);

    return { match, session };
  }

  const { data: session, error } = await adminClient
    .from("qa_sessions")
    .insert({
      match_id: match.id,
      scheduled_at: scheduledAt,
      proposed_by_id: demoProfile.id,
      confirmed_at: new Date().toISOString(),
      questions,
    })
    .select("id")
    .single<QaSessionRow>();

  if (error || !session) {
    throw error ?? new Error("Unable to create internal Vibe Check session.");
  }

  await adminClient
    .from("matches")
    .update({ status: "qa_scheduled" })
    .eq("id", match.id);

  return { match, session };
}

async function ensureChat(adminClient: AdminClient, userId: string) {
  const { match, session } = await ensureVibeCheckSession(adminClient, userId);

  const { data: matchParticipants, error: matchError } = await adminClient
    .from("matches")
    .select("user_a, user_b")
    .eq("id", match.id)
    .single<{ user_a: string; user_b: string }>();

  if (matchError || !matchParticipants) {
    throw matchError ?? new Error("Unable to load internal match participants.");
  }

  await adminClient.from("qa_outcomes").upsert(
    [
      {
        qa_session_id: session.id,
        user_id: matchParticipants.user_a,
        decision: "continue",
      },
      {
        qa_session_id: session.id,
        user_id: matchParticipants.user_b,
        decision: "continue",
      },
    ],
    { onConflict: "qa_session_id,user_id" },
  );

  const { data: existingChat, error: existingChatError } = await adminClient
    .from("chats")
    .select("id")
    .eq("match_id", match.id)
    .maybeSingle<ChatRow>();

  if (existingChatError) {
    throw existingChatError;
  }

  if (existingChat) {
    return { match, chat: existingChat };
  }

  const { data: chat, error } = await adminClient
    .from("chats")
    .insert({ match_id: match.id })
    .select("id")
    .single<ChatRow>();

  if (error || !chat) {
    throw error ?? new Error("Unable to create internal chat.");
  }

  return { match, chat };
}

export async function createInternalTestMatch() {
  const user = await requireInternalTester();
  const adminClient = admin();
  const { match } = await ensureTestMatch(adminClient, user.id);

  revalidatePath("/discover");
  redirect(`/schedule/${match.id}`);
}

export async function openInternalTestSchedule() {
  const user = await requireInternalTester();
  const adminClient = admin();
  const { match } = await ensureTestMatch(adminClient, user.id);

  redirect(`/schedule/${match.id}`);
}

export async function openInternalTestVibeCheck() {
  const user = await requireInternalTester();
  const adminClient = admin();
  const { session } = await ensureVibeCheckSession(adminClient, user.id);

  redirect(`/qa/${session.id}`);
}

export async function openInternalTestChat() {
  const user = await requireInternalTester();
  const adminClient = admin();
  const { chat } = await ensureChat(adminClient, user.id);

  redirect(`/chat/${chat.id}`);
}

export async function openInternalTestDatePlan() {
  const user = await requireInternalTester();
  const adminClient = admin();
  const { match } = await ensureChat(adminClient, user.id);

  redirect(`/date-plan/${match.id}`);
}
