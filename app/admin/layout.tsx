import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { requireFounder } from "@/lib/admin/auth";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireFounder();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/admin/analytics" className="text-base font-semibold">
            Intentionally founder dashboard
          </Link>
          <nav className="flex flex-wrap gap-2">
            <Link
              href="/admin/analytics"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-full bg-card",
              )}
            >
              Analytics
            </Link>
            <Link
              href="/admin/feedback"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-full bg-card",
              )}
            >
              Feedback
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
