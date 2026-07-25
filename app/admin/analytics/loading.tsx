export default function FounderAnalyticsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8" aria-busy="true" aria-live="polite">
      <div className="h-44 animate-pulse rounded-[1.75rem] border border-border bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="h-40 animate-pulse rounded-[1.5rem] border border-border bg-muted" />
        ))}
      </div>
    </main>
  );
}
