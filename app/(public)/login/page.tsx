import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to Intentionally
          </h1>
          <p className="text-sm text-muted-foreground">
            We use your phone number for sign-in and date-night SMS.
          </p>
        </header>
        <LoginForm />
      </div>
    </main>
  );
}
