"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/discover", label: "Discover" },
  { href: "/onboarding/profile", label: "Profile" },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden items-center gap-1 rounded-full border border-[#e6ded0] bg-[#fffaf3]/80 p-1 text-sm shadow-[0_8px_24px_rgba(74,59,42,0.06)] md:flex">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 font-semibold transition",
                active
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <nav
        className="fixed inset-x-4 bottom-4 z-40 mx-auto grid max-w-md grid-cols-2 rounded-[1.5rem] border border-[#e6ded0] bg-[#fffaf3]/96 p-2 text-center text-xs shadow-[0_14px_44px_rgba(74,59,42,0.16)] backdrop-blur md:hidden"
        aria-label="Primary"
      >
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-2xl px-2 py-3 font-semibold transition",
                active
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
