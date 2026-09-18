import Link from "next/link";
import { auth } from "@/lib/auth";
import { getHistory } from "@/lib/data";
import { daysAgoKey, startOfWeekKey, startOfMonthKey, formatDisplayDate } from "@/lib/date";
import { PRAYERS, PRAYER_META, MAX_DAILY_SCORE, type PrayerStatusName } from "@/lib/scoring";

const RANGES = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

function rangeStart(range: RangeKey): string {
  if (range === "month") return startOfMonthKey();
  if (range === "all") return daysAgoKey(365 * 5);
  return startOfWeekKey();
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range: RangeKey = RANGES.some((r) => r.key === rawRange) ? (rawRange as RangeKey) : "week";

  const session = await auth();
  const userId = session!.user.id;
  const history = await getHistory(userId, rangeStart(range));

  return (
    <div className="space-y-5 pb-6">
      <div>
        <p className="text-sm text-foreground-muted">Track your consistency over time</p>
        <h1 className="text-2xl font-semibold text-foreground">Prayer History</h1>
      </div>

      <div className="flex gap-2">
        {RANGES.map((r) => (
          <Link
            key={r.key}
            href={`/history?range=${r.key}`}
            className={`rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors ${
              range === r.key
                ? "bg-primary text-on-primary"
                : "border border-border text-foreground-muted"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {history.length === 0 && (
          <p className="text-sm text-foreground-muted">No prayer logs yet in this range.</p>
        )}
        {history.map((day) => (
          <div key={day.date} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{formatDisplayDate(day.date)}</p>
              <p className="text-sm font-semibold tabular-nums text-accent">
                {day.score} / {MAX_DAILY_SCORE} pts
              </p>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {PRAYERS.map((prayer) => {
                const status = day.logs[prayer]?.status as PrayerStatusName | undefined;
                return (
                  <div key={prayer} className="flex flex-col items-center gap-1">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${statusDotClass(status)}`}
                    >
                      {statusGlyph(status)}
                    </span>
                    <span className="text-[10px] text-foreground-muted">
                      {PRAYER_META[prayer].label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function statusDotClass(status?: PrayerStatusName) {
  if (status === "ON_TIME") return "bg-success-container text-on-success-container";
  if (status === "LATE") return "bg-warning-container text-on-warning-container";
  if (status === "NOT_PERFORMED") return "bg-danger-container text-on-danger-container";
  return "border border-border bg-canvas text-foreground-muted";
}

function statusGlyph(status?: PrayerStatusName) {
  if (status === "ON_TIME") return "✓";
  if (status === "LATE") return "!";
  if (status === "NOT_PERFORMED") return "✕";
  return "–";
}
