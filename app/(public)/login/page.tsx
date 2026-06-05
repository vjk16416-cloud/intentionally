import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md space-y-5">
        <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <header className="space-y-4 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Intentionally
            </p>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Start with intention.
              </h1>
              <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
                A calmer way to meet with clarity, safety and intention.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-medium text-muted-foreground">
              <span className="rounded-full border border-border bg-background px-2 py-2">
                Private profiles
              </span>
              <span className="rounded-full border border-border bg-background px-2 py-2">
                Guided Q&amp;A
              </span>
              <span className="rounded-full border border-border bg-background px-2 py-2">
                Safer matching
              </span>
            </div>
          </header>

          <div className="mt-7">
            <LoginForm />
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
            Private by default. Built for safer, more intentional matching.
          </p>
        </section>
      </div>
    </main>
  );
}
