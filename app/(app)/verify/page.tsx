import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { isUserVerified } from "@/lib/verification";

import { StartForm } from "./start-form";

function sanitiseReturn(raw: string | undefined): string {
  if (!raw) return "/discover";
  if (!raw.startsWith("/")) return "/discover";
  if (raw.startsWith("//")) return "/discover";
  return raw;
}

export default async function VerifyPage({
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
        <div className="w-full max-w-md space-y-6 text-center">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              You&apos;re verified
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              You&apos;re good to go.
            </h1>
            <p className="text-sm text-muted-foreground">
              Your ID is verified. You won&apos;t need to do this again.
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

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your ID
          </h1>
          <p className="text-sm text-muted-foreground">
            Before your first video call, we need to confirm you are who you
            say you are. This is a one-time step that takes about two
            minutes. You&apos;ll be redirected to Stripe Identity to scan
            your driving licence or passport.
          </p>
        </header>
        <StartForm returnTo={returnTo} />
      </div>
    </main>
  );
}
