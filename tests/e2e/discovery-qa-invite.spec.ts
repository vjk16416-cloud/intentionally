import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { expect, test, type BrowserContext } from "@playwright/test";

const baseUrl = "http://localhost:3000";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed
      .slice(equalsIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) process.env[key] = value;
  }
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

type AuthCookie = {
  name: string;
  value: string;
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | "lax" | "strict" | "none";
  };
};

async function addSessionCookies(context: BrowserContext, cookiesToSet: AuthCookie[]) {
  await context.addCookies(
    cookiesToSet.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      url: baseUrl,
      httpOnly: cookie.options.httpOnly ?? false,
      secure: cookie.options.secure ?? false,
      sameSite:
        cookie.options.sameSite === "none"
          ? "None"
          : cookie.options.sameSite === "strict"
            ? "Strict"
            : "Lax",
    })),
  );
}

loadEnvFile(".env.local");

const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const admin = createClient(supabaseUrl, requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

test.describe("Discovery to Q&A invite", () => {
  let viewerId = "";
  let candidateId = "";
  let authCookies: AuthCookie[] = [];
  let photoPaths: string[] = [];
  const candidateName = `Invite Candidate ${Date.now()}`;
  const candidateFirstName = "Invite";
  const testCity = `Invite Test City ${Date.now()}`;

  test.beforeAll(async () => {
    const password = `TestPassword-${randomUUID()}!`;
    const viewerEmail = `qa-invite-viewer-${Date.now()}@intentionally.local`;
    const candidateEmail = `qa-invite-candidate-${Date.now()}@intentionally.local`;

    const [{ data: viewerData, error: viewerError }, { data: candidateData, error: candidateError }] =
      await Promise.all([
        admin.auth.admin.createUser({
          email: viewerEmail,
          password,
          email_confirm: true,
        }),
        admin.auth.admin.createUser({
          email: candidateEmail,
          password,
          email_confirm: true,
        }),
      ]);

    if (viewerError || !viewerData.user) {
      throw new Error(`Failed to create invite-flow viewer: ${viewerError?.message}`);
    }
    if (candidateError || !candidateData.user) {
      throw new Error(`Failed to create invite-flow candidate: ${candidateError?.message}`);
    }

    viewerId = viewerData.user.id;
    candidateId = candidateData.user.id;

    photoPaths = [
      `${viewerId}/qa-invite-viewer-1.png`,
      `${viewerId}/qa-invite-viewer-2.png`,
      `${candidateId}/qa-invite-candidate-1.png`,
      `${candidateId}/qa-invite-candidate-2.png`,
    ];
    const pngPixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=",
      "base64",
    );
    for (const photoPath of photoPaths) {
      const { error: uploadError } = await admin.storage
        .from("profile-photos")
        .upload(photoPath, pngPixel, { contentType: "image/png", upsert: true });
      if (uploadError) {
        throw new Error(`Failed to upload invite-flow photo: ${uploadError.message}`);
      }
    }

    const { error: profilesError } = await admin.from("profiles").upsert([
      {
        id: viewerId,
        display_name: "Invite Viewer",
        date_of_birth: "1995-01-01",
        gender: "woman",
        seeking: ["man"],
        intention: "long-term",
        bio_prompt_key: "best-sunday",
        bio_answer: "A long walk, good coffee and an honest conversation.",
        photos: photoPaths.slice(0, 2),
        city: testCity,
        neighbourhood: "Hackney",
        availability: [66, 67, 68, 69],
        id_verified: true,
        id_verified_at: new Date().toISOString(),
        paused: false,
      },
      {
        id: candidateId,
        display_name: candidateName,
        date_of_birth: "1994-02-02",
        gender: "man",
        seeking: ["woman"],
        intention: "long-term",
        bio_prompt_key: "best-sunday",
        bio_answer: "A slow morning, a gallery and cooking something together.",
        photos: photoPaths.slice(2),
        city: testCity,
        neighbourhood: "Hackney",
        availability: [66, 67, 68, 69],
        id_verified: true,
        id_verified_at: new Date().toISOString(),
        paused: false,
      },
    ]);

    if (profilesError) {
      throw new Error(`Failed to prepare invite-flow profiles: ${profilesError.message}`);
    }

    const { error: contactError } = await admin.from("trusted_contacts").upsert(
      {
        user_id: viewerId,
        name: "Invite Test Contact",
        phone_e164: "+447700900123",
      },
      { onConflict: "user_id" },
    );
    if (contactError) {
      throw new Error(`Failed to prepare invite-flow trusted contact: ${contactError.message}`);
    }

    const { error: reciprocalLikeError } = await admin.from("swipes").insert({
      swiper_id: candidateId,
      swipee_id: viewerId,
      direction: "like",
    });
    if (reciprocalLikeError) {
      throw new Error(`Failed to seed reciprocal interest: ${reciprocalLikeError.message}`);
    }

    const capturedCookies: AuthCookie[] = [];
    const browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => capturedCookies,
        setAll: (cookies) => {
          capturedCookies.splice(0, capturedCookies.length, ...cookies);
        },
      },
    });

    const { error: signInError } = await browserClient.auth.signInWithPassword({
      email: viewerEmail,
      password,
    });
    if (signInError) {
      throw new Error(`Failed to sign in invite-flow viewer: ${signInError.message}`);
    }

    authCookies = capturedCookies;
  });

  test.afterAll(async () => {
    if (photoPaths.length > 0) {
      await admin.storage.from("profile-photos").remove(photoPaths);
    }
    if (viewerId) await admin.auth.admin.deleteUser(viewerId);
    if (candidateId) await admin.auth.admin.deleteUser(candidateId);
  });

  test("confirms, sends, waits and reuses the same invite session", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await addSessionCookies(context, authCookies);
    const page = await context.newPage();

    await page.goto(`${baseUrl}/discover`);
    await expect(page.getByRole("heading", { name: new RegExp(candidateFirstName, "i") })).toBeVisible();

    await page.getByRole("button", { name: "I’m interested" }).click();

    const matchDialog = page.getByRole("dialog");
    await expect(matchDialog).toBeVisible();
    await expect(matchDialog.getByRole("link", { name: "Invite to Q&A" })).toBeVisible();

    await matchDialog.getByRole("link", { name: "Invite to Q&A" }).click();
    await expect(page).toHaveURL(/\/schedule\/[0-9a-f-]+$/i);

    const matchId = page.url().split("/").pop();
    expect(matchId).toBeTruthy();

    const firstSlot = page.getByRole("radio").first();
    await expect(firstSlot).toBeVisible();
    await firstSlot.click();
    await page.getByRole("button", { name: "Invite to Q&A" }).click();

    const confirmDialog = page.getByRole("dialog", { name: /send this q&a invite/i });
    await expect(confirmDialog).toBeVisible();
    await expect(
      confirmDialog.getByText(/chat unlocks only if you both privately choose Continue/i),
    ).toBeVisible();
    await expect(confirmDialog.getByRole("button", { name: "Send invite" })).toBeVisible();
    await expect(confirmDialog.getByRole("button", { name: "Cancel" })).toBeVisible();

    await confirmDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(confirmDialog).toBeHidden();

    await page.getByRole("button", { name: "Invite to Q&A" }).click();
    await page.getByRole("button", { name: "Send invite" }).click();

    await expect
      .poll(
        async () => {
          const { data, error } = await admin
            .from("qa_sessions")
            .select("id")
            .eq("match_id", matchId!);
          if (error) throw error;
          return data?.length ?? 0;
        },
        { timeout: 15_000, message: "initial invite should create one qa_sessions row" },
      )
      .toBe(1);

    await expect(confirmDialog).toBeHidden({ timeout: 5_000 });
    await expect(page.getByText("Invite sent", { exact: true })).toBeVisible();
    await expect(page.getByText(new RegExp(`Waiting on ${candidateFirstName}`, "i"))).toBeVisible();

    const { data: initialSessions, error: initialSessionError } = await admin
      .from("qa_sessions")
      .select("id, scheduled_at")
      .eq("match_id", matchId!);
    if (initialSessionError) throw initialSessionError;
    expect(initialSessions).toHaveLength(1);
    const initialSession = initialSessions![0];

    const replacementSlot = page.getByRole("radio").first();
    await expect(replacementSlot).toBeVisible();
    await replacementSlot.click();
    await page.getByRole("button", { name: "Invite to Q&A" }).click();
    await page.getByRole("button", { name: "Send invite" }).click();

    await expect
      .poll(
        async () => {
          const { data, error } = await admin
            .from("qa_sessions")
            .select("id, scheduled_at")
            .eq("match_id", matchId!);
          if (error) throw error;
          if (!data || data.length !== 1) return null;
          return data[0].scheduled_at;
        },
        { timeout: 15_000, message: "reschedule should update the existing qa_sessions row" },
      )
      .not.toBe(initialSession.scheduled_at);

    await expect(confirmDialog).toBeHidden({ timeout: 5_000 });
    await expect(page.getByText("Invite sent", { exact: true })).toBeVisible();

    const { data: finalSessions, error: finalSessionError } = await admin
      .from("qa_sessions")
      .select("id, scheduled_at")
      .eq("match_id", matchId!);
    if (finalSessionError) throw finalSessionError;
    expect(finalSessions).toHaveLength(1);
    expect(finalSessions![0].id).toBe(initialSession.id);
    expect(finalSessions![0].scheduled_at).not.toBe(initialSession.scheduled_at);

    await context.close();
  });
});
