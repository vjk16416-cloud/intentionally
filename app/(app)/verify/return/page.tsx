import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { isUserVerified } from "@/lib/verification";

function sanitiseReturn(raw: string | undefined): string {
  if (!raw) return "/discover";
  if (!raw.startsWith("/")) return "/discover";
  if (raw.startsWith("//")) return "/discover";
  return raw;
}

// Stripe redirects the user here after their hosted verification UI
// closes. The webhook arrives independently (and may not have yet by
// the time the user lands here), so this page just reads the current
// id_verified status and shows the appropriate state. Stripe is the
// source of truth — we don't try to second-guess it from the URL.
export default async function VerifyReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string }>;
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

  const refreshHref = `/verify/return?return=${encodeURIComponent(returnTo)}`;
  const startOverHref = `/verify?return=${encodeURIComponent(returnTo)}`;
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
            Stripe usually confirms within a few seconds. Refresh in a moment.
            If something went wrong on Stripe&apos;s end, you can start over.
          </p>
        </header>
        <div className="flex flex-col items-center gap-2">
          <Link
            href={refreshHref}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Refresh
          </Link>
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
