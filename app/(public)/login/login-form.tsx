"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import {
  EMAIL_OTP_LENGTH,
  isNumericOtp,
  normaliseOtpToken,
  PHONE_OTP_LENGTH,
} from "@/lib/auth/otp";

import {
  continueAsLocalAppTestUser,
  continueAsLocalFounder,
  requestOtp,
  verifyOtp,
  type LoginActionState,
  type LoginIdentifierKind,
  type LocalTestLoginActionState,
} from "./actions";
import type { LocalTestIdentity } from "./local-test-login";

const INITIAL_STATE: LoginActionState = {};
const INITIAL_LOCAL_TEST_LOGIN_STATE: LocalTestLoginActionState = {};

const LOCAL_TEST_ACCOUNT_LABELS = {
  man: "Test Man",
  woman: "Test Woman",
} as const satisfies Record<LocalTestIdentity, string>;

const COUNTRY_CODES = [
  { label: "United Kingdom", code: "+44", example: "07700 900123" },
  { label: "India", code: "+91", example: "98765 43210" },
  { label: "United Arab Emirates", code: "+971", example: "050 123 4567" },
  { label: "Sri Lanka", code: "+94", example: "071 234 5678" },
  { label: "United States", code: "+1", example: "202 555 0123" },
  { label: "Canada", code: "+1", example: "416 555 0123" },
  { label: "Australia", code: "+61", example: "0412 345 678" },
];

type LoginFormProps = {
  enableLocalFounderLogin?: boolean;
  localTestIdentities?: readonly LocalTestIdentity[];
};

function normalisePhone(countryCode: string, localNumber: string) {
  const digitsOnly = localNumber.replace(/\D/g, "");
  const withoutLeadingZero = digitsOnly.replace(/^0+/, "");

  return `${countryCode}${withoutLeadingZero}`;
}

function DevelopmentTestAccounts({
  identities,
}: {
  identities: readonly LocalTestIdentity[];
}) {
  const [pendingIdentity, setPendingIdentity] =
    useState<LocalTestIdentity | null>(null);
  const [state, action, pending] = useActionState(
    continueAsLocalAppTestUser,
    INITIAL_LOCAL_TEST_LOGIN_STATE,
  );

  if (identities.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="development-test-accounts-heading"
      className="space-y-2"
    >
      <h2
        id="development-test-accounts-heading"
        className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#10231D]/55"
      >
        Development test accounts
      </h2>

      <form action={action} className="grid gap-2 sm:grid-cols-2">
        {identities.map((identity) => {
          const label = LOCAL_TEST_ACCOUNT_LABELS[identity];
          const isPending = pending && pendingIdentity === identity;

          return (
            <Button
              key={identity}
              type="submit"
              name="identity"
              value={identity}
              formNoValidate
              disabled={pending}
              variant="outline"
              className="w-full rounded-2xl border-[#10231D]/15 bg-white/64 text-[#10231D] hover:bg-white/82"
              onClick={() => setPendingIdentity(identity)}
            >
              {isPending ? `Signing in as ${label}…` : `Continue as ${label}`}
            </Button>
          );
        })}
      </form>

      {state.error ? (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}
    </section>
  );
}

export function LoginForm({
  enableLocalFounderLogin = false,
  localTestIdentities = [],
}: LoginFormProps) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [stage, setStage] = useState<"request" | "emailSent" | "verifyPhone">(
    "request",
  );

  const [email, setEmail] = useState("");
  const [emailToken, setEmailToken] = useState("");
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
    async (prev: LoginActionState, formData: FormData) => {
      const kindRaw = String(formData.get("kind") ?? "");
      const token = normaliseOtpToken(String(formData.get("token") ?? ""));

      formData.set("token", token);

      if (kindRaw === "email" && !isNumericOtp(token, EMAIL_OTP_LENGTH)) {
        return {
          identifier: String(formData.get("identifier") ?? ""),
          kind: "email" as const,
          error: `Enter the ${EMAIL_OTP_LENGTH}-digit code from your email.`,
        };
      }

      return verifyOtp(prev, formData);
    },
    INITIAL_STATE,
  );

  if (stage === "emailSent") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-muted/40 px-4 py-4">
          <h2 className="text-base font-semibold">Check your email</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            We sent a secure sign-in link to {identifier}. Open the email and
            click the link, or enter the code from the email below.
          </p>
        </div>

        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="identifier" value={identifier} />
          <input type="hidden" name="kind" value="email" />

          <div className="space-y-1.5">
            <label htmlFor="emailToken" className="text-sm font-semibold">
              Enter the 8-digit code
            </label>
            <Input
              id="emailToken"
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={EMAIL_OTP_LENGTH}
              pattern={`[0-9]{${EMAIL_OTP_LENGTH}}`}
              value={emailToken}
              onChange={(event) =>
                setEmailToken(
                  normaliseOtpToken(event.target.value, EMAIL_OTP_LENGTH),
                )
              }
              onPaste={(event) => {
                const pasted = event.clipboardData.getData("text");
                const nextToken = normaliseOtpToken(pasted);
                if (
                  nextToken !== pasted ||
                  nextToken.length > EMAIL_OTP_LENGTH
                ) {
                  event.preventDefault();
                  setEmailToken(nextToken);
                }
              }}
              required
              autoFocus
              className="h-12 rounded-2xl text-center text-lg tracking-[0.3em]"
            />
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
            {verifyPending ? "Verifying…" : "Verify email"}
          </Button>
        </form>

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
      <div className="space-y-5">
        <form
          action={requestAction}
          className="space-y-5"
          onSubmit={() =>
            trackAnalyticsEvent("loginClicked", {
              properties: {
                sign_in_method: method,
              },
            })
          }
        >
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
                We&apos;ll text a 6-digit code to sign you in and help keep
                Intentionally safer. Your number is not shown on your profile.
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                This is for verification and safety only.
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
          className="w-full rounded-2xl"
        >
          {requestPending
            ? "Sending…"
            : method === "email"
              ? "Send secure sign-in link"
              : "Text me a sign-in code"}
        </Button>

        <p className="text-center text-xs leading-5 text-muted-foreground">
          Private by default. Chat unlocks only after a mutual Vibe Check.
        </p>
        </form>

        <DevelopmentTestAccounts identities={localTestIdentities} />

        {enableLocalFounderLogin ? (
          <form action={continueAsLocalFounder} className="space-y-2">
            <Button
              type="submit"
              variant="outline"
              className="w-full rounded-2xl border-dashed border-[#C06F55]/50 bg-[#FFF8EC]/70 text-[#9B4F3D] hover:bg-[#FFF1DF]"
            >
              Continue as local founder (dev only)
            </Button>
            <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#9B4F3D]/75">
              Development only
            </p>
          </form>
        ) : null}
      </div>
    );
  }

  return (
    <form action={verifyAction} className="space-y-4">
      <input type="hidden" name="identifier" value={identifier} />
      <input type="hidden" name="kind" value={kind ?? ""} />

      <div className="space-y-1.5">
        <label htmlFor="token" className="text-sm font-semibold">
          Enter the 6-digit SMS code
        </label>
        <Input
          id="token"
          name="token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={PHONE_OTP_LENGTH}
          pattern={`[0-9]{${PHONE_OTP_LENGTH}}`}
          required
          autoFocus
          className="h-12 rounded-2xl text-center text-lg tracking-[0.3em]"
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Sent to {identifier}. This confirms the phone you use to sign in and
          helps keep Intentionally safer.{" "}
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
        {verifyPending ? "Verifying…" : "Verify phone"}
      </Button>
    </form>
  );
}
