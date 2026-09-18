import Link from "next/link";
import { auth } from "@/lib/auth";
import { getStats, type StatsPeriod } from "@/lib/data";
import { PRAYERS, PRAYER_META, MAX_DAILY_SCORE } from "@/lib/scoring";
import { StatTile } from "@/components/StatTile";

const PERIODS: { key: StatsPeriod; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "overall", label: "Overall" },
];

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period: StatsPeriod = PERIODS.some((p) => p.key === rawPeriod)
    ? (rawPeriod as StatsPeriod)
    : "weekly";

  const session = await auth();
  const userId = session!.user.id;
  const stats = await getStats(userId, period);
  const trend = stats.trend.slice(-14);

  return (
    <div className="space-y-5 pb-6">
      <div>
        <p className="text-sm text-foreground-muted">See how consistent you&apos;ve been</p>
        <h1 className="text-2xl font-semibold text-foreground">Statistics</h1>
      </div>

      <div className="grid grid-cols-4 gap-1 rounded-pill border border-border bg-surface p-1">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={`/stats?period=${p.key}`}
            className={`rounded-pill py-1.5 text-center text-xs font-semibold transition-colors ${
              period === p.key ? "bg-primary text-on-primary" : "text-foreground-muted"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Total Points" value={stats.totalPoints.toString()} />
        <StatTile label="On-Time Rate" value={`${Math.round(stats.onTimeRate * 100)}%`} />
        <StatTile label="Best Streak" value={`${stats.bestStreak} days`} />
        <StatTile label="Active Days" value={stats.activeDays.toString()} />
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Consistency by Prayer</p>
        <div className="space-y-3">
          {PRAYERS.map((prayer) => {
            const rate = stats.perPrayerConsistency[prayer];
            return (
              <div key={prayer}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{PRAYER_META[prayer].label}</span>
                  <span className="text-foreground-muted">{Math.round(rate * 100)}% on time</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-pill bg-canvas">
                  <div
                    className="h-full rounded-pill bg-success"
                    style={{ width: `${rate * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Score Trend</p>
        {trend.length === 0 ? (
          <p className="text-sm text-foreground-muted">Not enough data yet.</p>
        ) : (
          <div className="flex h-24 items-end gap-1">
            {trend.map((point) => {
              const heightPct = Math.max(4, (Math.max(0, point.score) / MAX_DAILY_SCORE) * 100);
              return (
                <div
                  key={point.date}
                  title={`${point.date}: ${point.score} pts`}
                  className="flex-1 rounded-t-sm bg-success"
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
