"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-20 flex items-stretch justify-around border-t border-border bg-surface/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
              active ? "text-accent" : "text-foreground-muted"
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? "text-accent" : "text-foreground-muted"}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
