"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  requestPhoneOtp,
  verifyPhoneOtp,
  type PhoneActionState,
} from "./actions";

const INITIAL_STATE: PhoneActionState = {};

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

export function PhoneForm() {
  const [stage, setStage] = useState<"request" | "verify">("request");
  const [countryCode, setCountryCode] = useState("+44");
  const [localNumber, setLocalNumber] = useState("");
  const [phone, setPhone] = useState("");

  const selectedCountry = useMemo(
    () => COUNTRY_CODES.find((country) => country.code === countryCode),
    [countryCode],
  );

  const [requestState, requestAction, requestPending] = useActionState(
    async (prev: PhoneActionState, formData: FormData) => {
      const next = await requestPhoneOtp(prev, formData);
      if (next.phone && !next.error) {
        setPhone(next.phone);
        setStage("verify");
      }
      return next;
    },
    INITIAL_STATE,
  );

  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyPhoneOtp,
    INITIAL_STATE,
  );

  const fullPhoneNumber = normalisePhone(countryCode, localNumber);

  if (stage === "request") {
    return (
      <form action={requestAction} className="space-y-4">
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
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Enter your number normally. We&apos;ll format it as{" "}
            {localNumber ? fullPhoneNumber : `${countryCode}...`}.
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            This is for verification and safety only. It is not shown on your
            profile.
          </p>
        </div>

        {requestState.error ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {requestState.error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            size="lg"
            disabled={requestPending || !localNumber}
            className="rounded-2xl bg-accent text-accent-foreground shadow-sm hover:opacity-90"
          >
            {requestPending ? "Sending code…" : "Send code"}
          </Button>

          <Button
            type="button"
            size="lg"
            variant="outline"
            className="rounded-2xl border-[#d8d0c3] bg-[#fffdf8] shadow-sm"
            onClick={() => {
              window.location.href = "/onboarding/review";
            }}
          >
            Skip for now
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="space-y-4">
      <input type="hidden" name="phone" value={phone} />

        <div className="space-y-1.5">
        <label htmlFor="token" className="text-sm font-semibold text-foreground">
          6-digit code
        </label>
        <Input
          id="token"
          className="h-12 rounded-2xl border-border bg-card px-4 text-base shadow-sm focus-visible:ring-accent"
          name="token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="[0-9]{6}"
          required
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Sent to {phone}. This confirms your number for verification and
          safety, and it is not shown on your profile.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => setStage("request")}
          >
            Change number
          </button>
        </p>
      </div>

      {verifyState.error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {verifyState.error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={verifyPending}
        className="rounded-2xl bg-accent text-accent-foreground shadow-sm hover:opacity-90"
      >
        {verifyPending ? "Verifying…" : "Verify"}
      </Button>
    </form>
  );
}
