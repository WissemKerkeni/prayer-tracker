import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDayLogs, scoreForDay, getStreaks } from "@/lib/data";
import { todayKey, formatDisplayDate } from "@/lib/date";
import { getTodaySchedule } from "@/lib/prayer-times";
import { PRAYERS, MAX_DAILY_SCORE } from "@/lib/scoring";
import { ScoreCard } from "@/components/ScoreCard";
import { PrayerRow } from "@/components/PrayerRow";

export default async function TodayPage() {
  const session = await auth();
  const userId = session!.user.id;
  const dateKey = todayKey();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { city: true, country: true, calculationMethod: true, madhab: true },
  });

  const [logs, streaks, schedule] = await Promise.all([
    getDayLogs(userId, dateKey),
    getStreaks(userId),
    getTodaySchedule(user, dateKey),
  ]);
  const score = scoreForDay(logs);
  const hasLocation = Boolean(user.city && user.country);
  const liveTimes = Object.values(schedule).some((s) => s.liveTimesAvailable);

  return (
    <div className="space-y-5 pb-6">
      <div>
        <p className="text-sm text-foreground-muted">{formatDisplayDate(dateKey)}</p>
        <h1 className="text-2xl font-semibold text-foreground">Today&apos;s Prayers</h1>
        {hasLocation && !liveTimes && (
          <p className="mt-1 text-xs text-warning">
            Couldn&apos;t load live prayer times for {user.city}, {user.country} — showing
            default windows instead.
          </p>
        )}
      </div>

      <ScoreCard score={score} max={MAX_DAILY_SCORE} streak={streaks.current} />

      <div className="space-y-3">
        {PRAYERS.map((prayer) => (
          <PrayerRow
            key={prayer}
            prayer={prayer}
            status={logs[prayer]?.status}
            dateKey={dateKey}
            windowLabel={schedule[prayer].windowLabel}
            locked={!schedule[prayer].unlocked}
          />
        ))}
      </div>
    </div>
  );
}
