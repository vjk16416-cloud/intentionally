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
    <div className="flex min-h-dvh flex-col bg-[#f8f4ec] text-[#241c17]">
      <header className="border-b border-[#e6ded0] bg-[#fffaf3]/92 px-4 py-4 shadow-[0_8px_30px_rgba(74,59,42,0.05)] backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-1 md:max-w-2xl">
          <span className="text-sm font-semibold tracking-tight">
            Intentionally
          </span>
          <span className="text-xs leading-5 text-muted-foreground">
            Calm, guided setup for your profile
          </span>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pb-[calc(8.5rem+env(safe-area-inset-bottom))] sm:pt-10">
        <div className="w-full max-w-lg md:max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
