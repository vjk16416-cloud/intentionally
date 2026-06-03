"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  requestPhoneOtp,
  verifyPhoneOtp,
  type PhoneActionState,
} from "./actions";

const INITIAL_STATE: PhoneActionState = {};

export function PhoneForm() {
  const [stage, setStage] = useState<"request" | "verify">("request");
  const [phone, setPhone] = useState("");

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

  if (stage === "request") {
    return (
      <form action={requestAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone number
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+447700900123"
            defaultValue={requestState.phone}
            required
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            E.164 format. We&apos;ll text you a 6-digit code.
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
      <input type="hidden" name="phone" value={phone} />
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
          Sent to {phone}.{" "}
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
