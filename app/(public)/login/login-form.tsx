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
  const [stage, setStage] = useState<"request" | "verify">("request");
  const [identifier, setIdentifier] = useState("");
  const [kind, setKind] = useState<LoginIdentifierKind | null>(null);

  const [requestState, requestAction, requestPending] = useActionState(
    async (prev: LoginActionState, formData: FormData) => {
      const next = await requestOtp(prev, formData);
      if (next.identifier && next.kind && !next.error) {
        setIdentifier(next.identifier);
        setKind(next.kind);
        setStage("verify");
      }
      return next;
    },
    INITIAL_STATE,
  );

  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyOtp,
    INITIAL_STATE,
  );

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
            We&apos;ll text or email a 6-digit code. Phone in E.164 format.
          </p>
        </div>
        {requestState.error ? (
          <p className="text-sm text-destructive">{requestState.error}</p>
        ) : null}
        <Button type="submit" size="lg" disabled={requestPending}>
          {requestPending ? "Sending code…" : "Send code"}
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
          6-digit code
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
            Change {kind === "email" ? "email" : "number"}
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
