"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

import {
  requestOtp,
  verifyOtp,
  type LoginActionState,
  type LoginIdentifierKind,
} from "./actions";

const INITIAL_STATE: LoginActionState = {};

const COUNTRY_CODES = [
  { label: "United Kingdom", code: "+44", example: "07700 900123" },
  { label: "India", code: "+91", example: "98765 43210" },
  { label: "United Arab Emirates", code: "+971", example: "050 123 4567" },
  { label: "Sri Lanka", code: "+94", example: "071 234 5678" },
  { label: "United States", code: "+1", example: "202 555 0123" },
  { label: "Canada", code: "+1", example: "416 555 0123" },
  { label: "Australia", code: "+61", example: "0412 345 678" },
];

function normalisePhone(countryCode: string, localNumber: string) {
  const digitsOnly = localNumber.replace(/\D/g, "");
  const withoutLeadingZero = digitsOnly.replace(/^0+/, "");

  return `${countryCode}${withoutLeadingZero}`;
}

export function LoginForm() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [stage, setStage] = useState<"request" | "emailSent" | "verifyPhone">(
    "request",
  );

  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+44");
  const [localNumber, setLocalNumber] = useState("");

  const [identifier, setIdentifier] = useState("");
  const [kind, setKind] = useState<LoginIdentifierKind | null>(null);

  const selectedCountry = useMemo(
    () => COUNTRY_CODES.find((country) => country.code === countryCode),
    [countryCode],
  );

  const phoneIdentifier = normalisePhone(countryCode, localNumber);
  const requestIdentifier = method === "email" ? email : phoneIdentifier;

  const [requestState, requestAction, requestPending] = useActionState(
    async (prev: LoginActionState, formData: FormData) => {
      const next = await requestOtp(prev, formData);

      if (next.identifier && next.kind && !next.error) {
        setIdentifier(next.identifier);
        setKind(next.kind);

        if (next.kind === "email") {
          setStage("emailSent");
        } else {
          setStage("verifyPhone");
        }
      }

      return next;
    },
    INITIAL_STATE,
  );

  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyOtp,
    INITIAL_STATE,
  );

  if (stage === "emailSent") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-muted/40 px-4 py-4">
          <h2 className="text-base font-semibold">Check your email</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            We sent a secure sign-in link to {identifier}. Open the email and
            click the link to continue.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-2xl"
          onClick={() => setStage("request")}
        >
          Use a different email
        </Button>
      </div>
    );
  }

  if (stage === "request") {
    return (
      <form action={requestAction} className="space-y-5">
        <input type="hidden" name="identifier" value={requestIdentifier} />

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setMethod("email")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              method === "email"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setMethod("phone")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              method === "phone"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Phone
          </button>
        </div>

        {method === "email" ? (
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold">
              Email address
            </label>
            <Input
              id="email"
              name="emailDisplay"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
              className="h-12 rounded-2xl"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              We&apos;ll send you a secure sign-in link.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="countryCode" className="text-sm font-semibold">
                Country code
              </label>
              <select
                id="countryCode"
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm shadow-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30"
              >
                {COUNTRY_CODES.map((country) => (
                  <option
                    key={`${country.label}-${country.code}`}
                    value={country.code}
                  >
                    {country.label} {country.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="localNumber" className="text-sm font-semibold">
                Phone number
              </label>
              <Input
                id="localNumber"
                name="phoneDisplay"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder={selectedCountry?.example ?? "07700 900123"}
                value={localNumber}
                onChange={(event) => setLocalNumber(event.target.value)}
                required
                autoFocus
                className="h-12 rounded-2xl"
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Enter it normally. We&apos;ll format it as{" "}
                {localNumber ? phoneIdentifier : `${countryCode}...`}.
              </p>
            </div>
          </div>
        )}

        {requestState.error ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {requestState.error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={requestPending}
          onClick={() => trackAnalyticsEvent("loginClicked")}
          className="w-full rounded-2xl"
        >
          {requestPending
            ? "Sending…"
            : method === "email"
              ? "Send secure sign-in link"
              : "Send SMS code"}
        </Button>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="space-y-4">
      <input type="hidden" name="identifier" value={identifier} />
      <input type="hidden" name="kind" value={kind ?? ""} />

      <div className="space-y-1.5">
        <label htmlFor="token" className="text-sm font-semibold">
          6-digit SMS code
        </label>
        <Input
          id="token"
          name="token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="[0-9]{6}"
          required
          autoFocus
          className="h-12 rounded-2xl text-center text-lg tracking-[0.3em]"
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Sent to {identifier}.{" "}
          <button
            type="button"
            className="font-semibold underline underline-offset-4"
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
        className="w-full rounded-2xl"
      >
        {verifyPending ? "Verifying…" : "Verify"}
      </Button>
    </form>
  );
}
