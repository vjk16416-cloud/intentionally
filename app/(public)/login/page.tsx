import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm space-y-6">
        <section className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
          <header className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Intentionally
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Start with intention.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Sign in to continue your profile, matches and guided Q&amp;A.
            </p>
          </header>

          <div className="mt-6">
            <LoginForm />
          </div>
        </section>

        <p className="text-center text-xs leading-5 text-muted-foreground">
          Private by default. Your profile is only used to support safer,
          more intentional matching.
        </p>
      </div>
    </main>
  );
}
