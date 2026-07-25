"use client";

export default function FounderAnalyticsError() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="rounded-[1.75rem] border border-destructive/30 bg-destructive/10 p-5 text-destructive shadow-sm sm:p-6" role="alert">
        <h1 className="text-xl font-semibold">Analytics is temporarily unavailable</h1>
        <p className="mt-2 text-sm leading-6">The Founder dashboard could not load. No product data was changed. Try again shortly.</p>
      </section>
    </main>
  );
}
