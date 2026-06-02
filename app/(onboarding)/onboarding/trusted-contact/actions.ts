"use server";

import { redirect } from "next/navigation";

import { resolveNextStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

const E164_PATTERN = /^\+[1-9]\d{6,14}$/;
const NAME_MAX = 80;

const RELATIONSHIP_VALUES = ["friend", "family", "other"] as const;
type Relationship = (typeof RELATIONSHIP_VALUES)[number];

function isRelationship(value: string): value is Relationship {
  return (RELATIONSHIP_VALUES as readonly string[]).includes(value);
}

export type TrustedContactActionState = {
  error?: string;
};

export async function saveTrustedContact(
  _prev: TrustedContactActionState,
  formData: FormData,
): Promise<TrustedContactActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const relationshipRaw = String(formData.get("relationship") ?? "").trim();

  if (!name) {
    return { error: "Their name is required." };
  }
  if (name.length > NAME_MAX) {
    return { error: `Keep the name under ${NAME_MAX} characters.` };
  }
  if (!E164_PATTERN.test(phone)) {
    return {
      error: "Phone must be in E.164 format, e.g. +447700900123.",
    };
  }
  let relationship: Relationship | null = null;
  if (relationshipRaw) {
    if (!isRelationship(relationshipRaw)) {
      return { error: "Invalid relationship." };
    }
    relationship = relationshipRaw;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("trusted_contacts")
    .upsert(
      {
        user_id: user.id,
        name,
        phone_e164: phone,
        relationship,
      },
      { onConflict: "user_id" },
    );

  if (error) {
    return { error: error.message };
  }

  const returnTo = String(formData.get("returnTo") ?? "");
  redirect(resolveNextStep(returnTo, "/onboarding/done"));
}
