"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BROWSER_OPTIONS,
  DEVICE_OPTIONS,
  WOULD_USE_OPTIONS,
} from "@/lib/user-testing/feedback";

import {
  submitUserTestingFeedback,
  type FeedbackActionState,
} from "./actions";

const INITIAL_STATE: FeedbackActionState = {};

function Field({
  label,
  children,
  helper,
}: {
  label: string;
  children: React.ReactNode;
  helper?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold">{label}</label>
      {children}
      {helper ? (
        <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}

function TextArea({
  id,
  name,
  required = true,
}: {
  id: string;
  name: string;
  required?: boolean;
}) {
  return (
    <textarea
      id={id}
      name={name}
      required={required}
      rows={4}
      maxLength={1500}
      className="min-h-28 w-full rounded-2xl border border-input bg-card px-4 py-3 text-base leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
    />
  );
}

function Select({
  id,
  name,
  options,
}: {
  id: string;
  name: string;
  options: readonly string[];
}) {
  return (
    <select
      id={id}
      name={name}
      required
      defaultValue=""
      className="h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <option value="" disabled>
        Choose one
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function FeedbackForm() {
  const [state, action, pending] = useActionState(
    submitUserTestingFeedback,
    INITIAL_STATE,
  );

  if (state.status === "success") {
    return (
      <section className="rounded-[1.5rem] border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Feedback received
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          Thank you for helping improve Intentionally.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Your notes will be reviewed alongside the Lookback session so product
          decisions stay grounded in real user testing.
        </p>
      </section>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tester name" helper="Optional.">
          <Input
            id="testerName"
            name="testerName"
            autoComplete="name"
            maxLength={200}
            className="h-12 rounded-2xl bg-card"
          />
        </Field>

        <Field label="Email" helper="Optional.">
          <Input
            id="testerEmail"
            name="testerEmail"
            type="email"
            autoComplete="email"
            maxLength={200}
            className="h-12 rounded-2xl bg-card"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Device used">
          <Select id="device" name="device" options={DEVICE_OPTIONS} />
        </Field>

        <Field label="Browser used">
          <Select id="browser" name="browser" options={BROWSER_OPTIONS} />
        </Field>
      </div>

      <Field label="Overall rating">
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
            <label
              key={rating}
              className="flex h-11 cursor-pointer items-center justify-center rounded-2xl border border-border bg-card text-sm font-semibold transition has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground"
            >
              <input
                type="radio"
                name="rating"
                value={rating}
                required
                className="sr-only"
              />
              {rating}
            </label>
          ))}
        </div>
      </Field>

      <Field label="What confused you most?">
        <TextArea id="confusion" name="confusion" />
      </Field>

      <Field label="What did you like most?">
        <TextArea id="liked" name="liked" />
      </Field>

      <Field label="Did anything break or not work?">
        <TextArea id="bugs" name="bugs" />
      </Field>

      <Field label="Did the app feel safe and trustworthy? Why or why not?">
        <TextArea id="safetyFeedback" name="safetyFeedback" />
      </Field>

      <Field label="Did the Guided Vibe Check journey make sense?">
        <TextArea id="qaFeedback" name="qaFeedback" />
      </Field>

      <Field label="What would you improve?">
        <TextArea id="improvements" name="improvements" />
      </Field>

      <Field label="Would you use this app?">
        <div className="grid grid-cols-3 gap-2">
          {WOULD_USE_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex h-11 cursor-pointer items-center justify-center rounded-2xl border border-border bg-card text-sm font-semibold transition has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground"
            >
              <input
                type="radio"
                name="wouldUse"
                value={option}
                required
                className="sr-only"
              />
              {option}
            </label>
          ))}
        </div>
      </Field>

      <label className="flex gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-6">
        <input
          type="checkbox"
          name="permissionGiven"
          className="mt-1 h-4 w-4 rounded border-border accent-foreground"
        />
        <span>
          I&apos;m happy for this feedback to be used to improve the product.
        </span>
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-12 w-full rounded-2xl"
      >
        {pending ? "Submitting..." : "Submit feedback"}
      </Button>
    </form>
  );
}
