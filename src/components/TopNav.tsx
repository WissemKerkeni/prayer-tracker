"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { signOutAction } from "@/lib/actions/auth-actions";

export function TopNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <header className="hidden md:flex items-center justify-between border-b border-border bg-surface px-8 py-4">
      <div className="flex items-center gap-8">
        <span className="font-semibold text-lg tracking-tight text-accent">Nūr Salah</span>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-control px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-on-primary"
                    : "text-foreground-muted hover:bg-canvas"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-foreground-muted">{userName}</span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-control border border-border px-3.5 py-2 text-sm font-medium text-foreground hover:bg-canvas transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
