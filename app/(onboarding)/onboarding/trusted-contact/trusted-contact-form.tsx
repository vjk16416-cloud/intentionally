"use client";

import { useActionState, useMemo, useState } from "react";

import { StepNav } from "@/components/onboarding/step-nav";
import { Input } from "@/components/ui/input";

import {
  saveTrustedContact,
  type TrustedContactActionState,
} from "./actions";

const INITIAL_STATE: TrustedContactActionState = {};

const RELATIONSHIP_OPTIONS = [
  { value: "friend", label: "Friend" },
  { value: "family", label: "Family" },
  { value: "other", label: "Other" },
] as const;

const COUNTRY_CODES = [
  { label: "United Kingdom", code: "+44", example: "07700900123" },
  { label: "India", code: "+91", example: "9876543210" },
  { label: "United Arab Emirates", code: "+971", example: "501234567" },
  { label: "Sri Lanka", code: "+94", example: "0712345678" },
  { label: "United States", code: "+1", example: "2025550123" },
  { label: "Canada", code: "+1", example: "4165550123" },
  { label: "Australia", code: "+61", example: "0412345678" },
];

function normalisePhone(countryCode: string, localNumber: string) {
  const digitsOnly = localNumber.replace(/\D/g, "");
  const withoutLeadingZero = digitsOnly.replace(/^0+/, "");
  return `${countryCode}${withoutLeadingZero}`;
}

function splitInitialPhone(phone: string | null) {
  if (!phone) {
    return { countryCode: "+44", localNumber: "" };
  }

  const matchedCountry = COUNTRY_CODES.find((country) =>
    phone.startsWith(country.code),
  );

  if (!matchedCountry) {
    return { countryCode: "+44", localNumber: phone };
  }

  return {
    countryCode: matchedCountry.code,
    localNumber: phone.slice(matchedCountry.code.length),
  };
}

export function TrustedContactForm({
  initialName,
  initialPhone,
  initialRelationship,
  returnTo,
  previousStep,
}: {
  initialName: string | null;
  initialPhone: string | null;
  initialRelationship: string | null;
  returnTo: string | null;
  previousStep: string | null;
}) {
  const initialPhoneParts = splitInitialPhone(initialPhone);

  const [countryCode, setCountryCode] = useState(
    initialPhoneParts.countryCode,
  );
  const [localNumber, setLocalNumber] = useState(
    initialPhoneParts.localNumber,
  );

  const [state, action, pending] = useActionState(
    saveTrustedContact,
    INITIAL_STATE,
  );

  const selectedCountry = useMemo(
    () => COUNTRY_CODES.find((country) => country.code === countryCode),
    [countryCode],
  );

  const fullPhoneNumber = normalisePhone(countryCode, localNumber);

  return (
    <form action={action} className="space-y-5">
      <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          Only for date safety
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          We only use this contact if you trigger Safety SOS during a date.
          They are never shown on your profile and are not contacted about
          matches, likes, or Q&amp;As.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-semibold text-foreground">
          Their name
        </label>
        <Input
          id="name"
          className="h-12 rounded-2xl border-border bg-card px-4 text-base shadow-sm focus-visible:ring-accent"
          name="name"
          defaultValue={initialName ?? ""}
          maxLength={80}
          placeholder="e.g. Arnee"
          required
          autoFocus
        />
      </div>

      <input type="hidden" name="phone" value={fullPhoneNumber} />

      <div className="space-y-1.5">
        <label htmlFor="countryCode" className="text-sm font-semibold text-foreground">
          Country code
        </label>
        <select
          id="countryCode"
          value={countryCode}
          onChange={(event) => setCountryCode(event.target.value)}
          className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm shadow-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30"
        >
          {COUNTRY_CODES.map((country) => (
            <option key={`${country.label}-${country.code}`} value={country.code}>
              {country.label} {country.code}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="localNumber" className="text-sm font-semibold text-foreground">
          Phone number
        </label>
        <Input
          id="localNumber"
          className="h-12 rounded-2xl border-border bg-card px-4 text-base shadow-sm focus-visible:ring-accent"
          name="localNumber"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={selectedCountry?.example ?? "07700900123"}
          value={localNumber}
          onChange={(event) => setLocalNumber(event.target.value)}
          required
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Enter their number normally. We&apos;ll format it as{" "}
          {localNumber ? fullPhoneNumber : `${countryCode}...`}.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="relationship" className="text-sm font-semibold text-foreground">
          Relationship
        </label>
        <select
          id="relationship"
          name="relationship"
          defaultValue={initialRelationship ?? ""}
          className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm shadow-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30"
        >
          <option value="">Prefer not to say</option>
          {RELATIONSHIP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground">
          What happens if you use Safety SOS?
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          We use their phone number to help alert them that you asked for
          safety support during a date. We do not send them your dating
          activity or profile details.
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <StepNav
        returnTo={returnTo}
        previousStep={previousStep}
        pending={pending}
      />
    </form>
  );
}
