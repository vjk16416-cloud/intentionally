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
    <div className="flex flex-1 flex-col">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex w-full max-w-md flex-col gap-1">
          <span className="text-sm font-semibold tracking-tight">
            Intentionally
          </span>
          <span className="text-xs text-muted-foreground">
            Set up your profile · takes around 3 minutes
          </span>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
