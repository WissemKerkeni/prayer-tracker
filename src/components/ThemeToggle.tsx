"use client";

import { useTransition } from "react";
import { setThemeAction, type ThemePreference } from "@/lib/actions/theme-actions";
import { SunIcon, MoonIcon, SystemIcon } from "@/components/icons";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: SystemIcon },
];

export function ThemeToggle({ current }: { current: ThemePreference }) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(value: ThemePreference) {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (value !== "system") root.classList.add(value);

    startTransition(async () => {
      await setThemeAction(value);
    });
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((opt) => {
        const active = current === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={isPending}
            aria-pressed={active}
            onClick={() => handleSelect(opt.value)}
            className={`flex flex-col items-center gap-1.5 rounded-control border py-3 text-xs font-medium transition-colors ${
              active
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-foreground-muted hover:bg-canvas"
            }`}
          >
            <Icon className="h-4 w-4" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
