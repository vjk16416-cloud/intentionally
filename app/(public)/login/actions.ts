"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type LoginIdentifierKind = "email" | "phone";

export type LoginActionState = {
  identifier?: string;
  kind?: LoginIdentifierKind;
  error?: string;
};

const E164_PATTERN = /^\+[1-9]\d{6,14}$/;

// Detect whether an input is intended as an email or a phone. Rule:
// presence of '@' = email (Supabase handles full validation downstream);
// otherwise must be E.164 phone. Returns null for unrecognised input.
function detectKind(value: string): LoginIdentifierKind | null {
  if (value.includes("@")) return "email";
  if (E164_PATTERN.test(value)) return "phone";
  return null;
}

export async function requestOtp(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const kind = detectKind(identifier);

  if (!kind) {
    return {
      error:
        "Enter your email address or phone number in E.164 format (e.g. +447700900123).",
    };
  }

  const supabase = await createClient();
  const { error } =
    kind === "email"
      ? await supabase.auth.signInWithOtp({ email: identifier })
      : await supabase.auth.signInWithOtp({ phone: identifier });

  if (error) {
    return { identifier, kind, error: error.message };
  }

  return { identifier, kind };
}

export async function verifyOtp(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "");
  const token = String(formData.get("token") ?? "").trim();

  if (kindRaw !== "email" && kindRaw !== "phone") {
    return { error: "Invalid login state." };
  }
  const kind: LoginIdentifierKind = kindRaw;

  if (!identifier || !token) {
    return {
      identifier,
      kind,
      error: "Identifier and code are both required.",
    };
  }

  const supabase = await createClient();
  const { error } =
    kind === "email"
      ? await supabase.auth.verifyOtp({
          email: identifier,
          token,
          type: "email",
        })
      : await supabase.auth.verifyOtp({
          phone: identifier,
          token,
          type: "sms",
        });

  if (error) {
    return { identifier, kind, error: error.message };
  }

  redirect("/discover");
}
