import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border/70 bg-background/95 px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-1">
          <span className="text-sm font-semibold tracking-tight">
            Intentionally
          </span>
          <span className="text-xs leading-5 text-muted-foreground">
            Set up your profile · takes around 3 minutes
          </span>
        </div>
      </header>

<main className="flex flex-1 justify-center px-4 pb-28 pt-6 sm:px-6 sm:pb-32 sm:pt-10">        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}