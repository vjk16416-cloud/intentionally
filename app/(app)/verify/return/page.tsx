import Link from "next/link";
import { redirect } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { isUserVerified } from "@/lib/verification";

import { refreshVerification } from "../actions";

function sanitiseReturn(raw: string | undefined): string {
  if (!raw) return "/discover";
  if (!raw.startsWith("/")) return "/discover";
  if (raw.startsWith("//")) return "/discover";
  return raw;
}

function sanitiseStatus(raw: string | undefined) {
  if (!raw) return null;
  if (["processing", "requires_input", "canceled", "missing_session", "error"].includes(raw)) {
    return raw;
  }
  return null;
}

// Stripe redirects the user here after their hosted verification UI
// closes. The webhook arrives independently (and may not have yet by
// the time the user lands here), so this page just reads the current
// id_verified status and shows the appropriate state. Stripe is the
// source of truth — we don't try to second-guess it from the URL.
export default async function VerifyReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string; status?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const returnTo = sanitiseReturn(params.return);
  const status = sanitiseStatus(params.status);
  const verified = await isUserVerified(supabase, user.id);

  if (verified) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6 text-center md:max-w-xl">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              All set
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              You&apos;re verified.
            </h1>
            <p className="text-sm text-muted-foreground">
              Stripe confirmed your ID. You won&apos;t need to do this again.
            </p>
          </header>
          <div>
            <Link
              href={returnTo}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Continue
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const startOverHref = `/verify?return=${encodeURIComponent(returnTo)}`;
  const statusCopy =
    status === "requires_input"
      ? "Stripe needs another attempt. Refresh after the next submission, or start over if the session was canceled."
      : status === "canceled"
        ? "That verification session was canceled. Start over to try again."
        : status === "missing_session"
          ? "We couldn't find the latest verification session. Start over and try again."
          : status === "error"
            ? "We couldn't check Stripe just now. Try Refresh again in a moment."
            : "Stripe usually confirms within a few seconds. Refresh in a moment.";
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6 text-center md:max-w-xl">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Hang tight
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            We&apos;re processing your verification.
          </h1>
          <p className="text-sm text-muted-foreground">
            {statusCopy}
          </p>
        </header>
        <div className="flex flex-col items-center gap-2">
          <form action={refreshVerification} className="w-full">
            <input type="hidden" name="returnTo" value={returnTo} />
            <Button type="submit" size="lg" className="w-full">
              Refresh
            </Button>
          </form>
          <Link
            href={startOverHref}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Start over
          </Link>
        </div>
      </div>
    </main>
  );
}
