"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { Compass, MessagesSquare, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

type AppNavigationVariant = "desktop" | "mobile";

type NavItem =
  | {
      href: string;
      label: string;
      icon: ComponentType<{ className?: string }>;
      disabled?: false;
    }
  | {
      label: string;
      icon: ComponentType<{ className?: string }>;
      disabled: true;
    };

const navItems: NavItem[] = [
  {
    href: "/discover",
    label: "Discover",
    icon: Compass,
  },
  {
    label: "Vibe Checks",
    icon: MessagesSquare,
    disabled: true,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserRound,
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const icon = <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />;

  if (item.disabled) {
    return (
      <button
        type="button"
        disabled
        title="Coming soon"
        className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-[#8a7c70] transition hover:bg-[#f4eee5] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {icon}
        <span>{item.label}</span>
      </button>
    );
  }

  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition",
        active
          ? "bg-[#eef5e8] text-[#536849] shadow-sm ring-1 ring-[#c9d4be]"
          : "text-[#8a7c70] hover:bg-[#f4eee5] hover:text-foreground",
      )}
    >
      {icon}
      <span>{item.label}</span>
    </Link>
  );
}

function MobileNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const icon = <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />;

  if (item.disabled) {
    return (
      <button
        type="button"
        disabled
        title="Coming soon"
        className="flex h-12 flex-1 flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 text-[11px] font-medium text-[#8a7c70] transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {icon}
        <span>{item.label}</span>
      </button>
    );
  }

  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-12 flex-1 flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 text-[11px] font-medium transition",
        active
          ? "bg-[#eef5e8] text-[#536849] shadow-sm ring-1 ring-[#c9d4be]"
          : "text-[#8a7c70] hover:bg-[#f4eee5] hover:text-foreground",
      )}
    >
      {icon}
      <span>{item.label}</span>
    </Link>
  );
}

export function AppNavigation({
  variant,
}: {
  variant: AppNavigationVariant;
}) {
  const pathname = usePathname();

  if (variant === "desktop") {
    return (
      <nav
        className="hidden items-center gap-1 rounded-full border border-[#e6ded0] bg-[#fffaf3]/92 p-1 shadow-[0_8px_24px_rgba(74,59,42,0.08)] lg:inline-flex"
        aria-label="Primary"
      >
        {navItems.map((item) => (
          <DesktopNavItem key={item.label} item={item} pathname={pathname} />
        ))}
      </nav>
    );
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-1 rounded-[1.5rem] border border-[#e6ded0] bg-[#fffaf3]/96 p-2 shadow-[0_14px_38px_rgba(74,59,42,0.16)] backdrop-blur md:max-w-2xl">
        {navItems.map((item) => (
          <MobileNavItem key={item.label} item={item} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}
