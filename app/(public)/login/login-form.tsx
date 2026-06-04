"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  requestOtp,
  verifyOtp,
  type LoginActionState,
  type LoginIdentifierKind,
} from "./actions";

const INITIAL_STATE: LoginActionState = {};

export function LoginForm() {
  const [stage, setStage] = useState<"request" | "emailSent" | "verifyPhone">(
    "request",
  );
  const [identifier, setIdentifier] = useState("");
  const [kind, setKind] = useState<LoginIdentifierKind | null>(null);

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
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We sent a secure sign-in link to {identifier}. Open the email and
            click the link to continue.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setStage("request")}
        >
          Use a different email
        </Button>
      </div>
    );
  }

  if (stage === "request") {
    return (
      <form action={requestAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="identifier" className="text-sm font-medium">
            Email or phone
          </label>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            placeholder="you@example.com or +447700900123"
            defaultValue={requestState.identifier}
            required
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll email you a secure sign-in link. Phone login still uses a
            6-digit SMS code.
          </p>
        </div>

        {requestState.error ? (
          <p className="text-sm text-destructive">{requestState.error}</p>
        ) : null}

        <Button type="submit" size="lg" disabled={requestPending}>
          {requestPending ? "Sending…" : "Send sign-in link"}
        </Button>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="space-y-4">
      <input type="hidden" name="identifier" value={identifier} />
      <input type="hidden" name="kind" value={kind ?? ""} />

      <div className="space-y-1.5">
        <label htmlFor="token" className="text-sm font-medium">
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
        />
        <p className="text-xs text-muted-foreground">
          Sent to {identifier}.{" "}
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
        <p className="text-sm text-destructive">{verifyState.error}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={verifyPending}>
        {verifyPending ? "Verifying…" : "Verify"}
      </Button>
    </form>
  );
}
