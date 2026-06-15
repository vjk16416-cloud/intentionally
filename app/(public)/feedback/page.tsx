import type { Metadata } from "next";

import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = {
  title: "User testing feedback | Intentionally",
  description: "Share structured feedback after testing Intentionally.",
};

export default function FeedbackPage() {
  return (
    <main className="flex-1 px-5 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <section className="mb-6 rounded-[1.75rem] border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Intentionally user testing
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Thank you for testing Intentionally.
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Your feedback helps make the product simpler, safer and more useful
            for people looking for genuine relationships. Please share what you
            noticed right after your Lookback session.
          </p>
        </section>

        <section className="rounded-[1.75rem] border border-border bg-card/70 p-5 shadow-sm sm:p-6">
          <FeedbackForm />
        </section>
      </div>
    </main>
  );
}
