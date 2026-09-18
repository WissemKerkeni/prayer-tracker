import { FlameIcon } from "@/components/icons";

export function ScoreCard({
  score,
  max,
  streak,
}: {
  score: number;
  max: number;
  streak: number;
}) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));

  return (
    <div className="rounded-card bg-primary p-5 text-on-primary shadow-[var(--shadow-elevated)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-on-primary/70">
            Today&apos;s Score
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            {score}
            <span className="ml-1 text-lg font-medium text-on-primary/70">/ {max} pts</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-pill bg-black/10 px-3 py-1.5 text-sm font-semibold">
          <FlameIcon className="h-4 w-4" />
          {streak} {streak === 1 ? "Day" : "Days"}
        </div>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-pill bg-black/15">
        <div
          className="h-full rounded-pill bg-white/85 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
