"use client";

import { useState, useTransition } from "react";
import { logPrayerAction } from "@/lib/actions/prayer-actions";
import { PRAYER_META, pointsFor, type PrayerName, type PrayerStatusName } from "@/lib/scoring";

const STATUS_OPTIONS: { status: PrayerStatusName; label: string }[] = [
  { status: "ON_TIME", label: "On Time" },
  { status: "LATE", label: "Late" },
  { status: "NOT_PERFORMED", label: "Missed" },
];

export function PrayerRow({
  prayer,
  status: initialStatus,
  dateKey,
  windowLabel,
  locked = false,
}: {
  prayer: PrayerName;
  status?: PrayerStatusName;
  dateKey: string;
  windowLabel?: string;
  locked?: boolean;
}) {
  const [status, setStatus] = useState<PrayerStatusName | undefined>(initialStatus);
  const [isPending, startTransition] = useTransition();
  const meta = PRAYER_META[prayer];
  const disabled = isPending || (locked && !status);

  function handleSelect(next: PrayerStatusName) {
    setStatus(next);
    startTransition(async () => {
      await logPrayerAction(prayer, next, dateKey);
    });
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">
            {meta.label}{" "}
            <span dir="rtl" className="ml-1 text-foreground-muted">
              {meta.arabic}
            </span>
          </p>
          <p className="text-xs text-foreground-muted">{windowLabel ?? meta.window}</p>
        </div>
        {status ? (
          <span
            className={`text-sm font-semibold tabular-nums ${
              pointsFor(prayer, status) < 0 ? "text-danger" : "text-accent"
            }`}
          >
            {pointsFor(prayer, status) > 0 ? "+" : ""}
            {pointsFor(prayer, status)}
          </span>
        ) : (
          locked && (
            <span className="text-xs font-medium text-foreground-muted">Not started yet</span>
          )
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.status}
            type="button"
            disabled={disabled}
            aria-pressed={status === opt.status}
            title={disabled && !status ? `Available once ${meta.label} begins` : undefined}
            onClick={() => handleSelect(opt.status)}
            className={statusButtonClass(opt.status, status === opt.status, disabled)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function statusButtonClass(status: PrayerStatusName, active: boolean, disabled: boolean) {
  const base = "rounded-control py-2 text-xs font-semibold transition-colors border";
  const disabledStyle = disabled ? " opacity-40 cursor-not-allowed" : "";

  if (!active) return `${base} border-border text-foreground-muted hover:bg-canvas${disabledStyle}`;

  switch (status) {
    case "ON_TIME":
      return `${base} border-transparent bg-success-container text-on-success-container${disabledStyle}`;
    case "LATE":
      return `${base} border-transparent bg-warning-container text-on-warning-container${disabledStyle}`;
    case "NOT_PERFORMED":
      return `${base} border-transparent bg-danger-container text-on-danger-container${disabledStyle}`;
  }
}
