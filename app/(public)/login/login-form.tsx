"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  requestOtp,
  verifyOtp,
  type LoginActionState,
} from "./actions";

const INITIAL_STATE: LoginActionState = {};

export function LoginForm() {
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");

  const [phoneState, phoneAction, phonePending] = useActionState(
    async (prev: LoginActionState, formData: FormData) => {
      const next = await requestOtp(prev, formData);
      if (next.phone && !next.error) {
        setPhone(next.phone);
        setStage("code");
      }
      return next;
    },
    INITIAL_STATE,
  );

  const [codeState, codeAction, codePending] = useActionState(
    verifyOtp,
    INITIAL_STATE,
  );

  if (stage === "phone") {
    return (
      <form action={phoneAction} className="space-y-4">
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
            defaultValue={phoneState.phone}
            required
          />
          <p className="text-xs text-muted-foreground">
            E.164 format. We&apos;ll text you a 6-digit code.
          </p>
        </div>
        {phoneState.error ? (
          <p className="text-sm text-destructive">{phoneState.error}</p>
        ) : null}
        <Button type="submit" size="lg" disabled={phonePending}>
          {phonePending ? "Sending code…" : "Send code"}
        </Button>
      </form>
    );
  }

  return (
    <form action={codeAction} className="space-y-4">
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
            onClick={() => setStage("phone")}
          >
            Change number
          </button>
        </p>
      </div>
      {codeState.error ? (
        <p className="text-sm text-destructive">{codeState.error}</p>
      ) : null}
      <Button type="submit" size="lg" disabled={codePending}>
        {codePending ? "Verifying…" : "Verify"}
      </Button>
    </form>
  );
}
