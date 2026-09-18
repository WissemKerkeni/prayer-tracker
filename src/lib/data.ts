import "server-only";
import { prisma } from "@/lib/prisma";
import { PRAYERS, MAX_DAILY_SCORE, type PrayerName } from "@/lib/scoring";
import {
  toDateKey,
  todayKey,
  daysAgoKey,
  startOfWeekKey,
  startOfMonthKey,
  dateKeyRange,
  fromDateKey,
} from "@/lib/date";
import type { PrayerLog } from "@/generated/prisma/client";

export type DayLogs = Partial<Record<PrayerName, PrayerLog>>;

export async function getDayLogs(userId: string, dateKey: string): Promise<DayLogs> {
  const logs = await prisma.prayerLog.findMany({
    where: { userId, date: dateKey },
  });
  const byPrayer: DayLogs = {};
  for (const log of logs) {
    byPrayer[log.prayer as PrayerName] = log;
  }
  return byPrayer;
}

export function scoreForDay(logs: DayLogs): number {
  return PRAYERS.reduce((sum, prayer) => sum + (logs[prayer]?.points ?? 0), 0);
}

async function getLogsInRange(userId: string, fromKey: string, toKeyInclusive: string) {
  return prisma.prayerLog.findMany({
    where: { userId, date: { gte: fromKey, lte: toKeyInclusive } },
    orderBy: { date: "asc" },
  });
}

function groupByDate(logs: PrayerLog[]): Map<string, DayLogs> {
  const map = new Map<string, DayLogs>();
  for (const log of logs) {
    const day = map.get(log.date) ?? {};
    day[log.prayer as PrayerName] = log;
    map.set(log.date, day);
  }
  return map;
}

export interface HistoryDay {
  date: string;
  score: number;
  logs: DayLogs;
  isComplete: boolean;
}

export async function getHistory(
  userId: string,
  fromKey: string,
  toKeyInclusive: string = todayKey(),
): Promise<HistoryDay[]> {
  const logs = await getLogsInRange(userId, fromKey, toKeyInclusive);
  const byDate = groupByDate(logs);

  return dateKeyRange(fromKey, toKeyInclusive)
    .reverse()
    .map((date) => {
      const dayLogs = byDate.get(date) ?? {};
      return {
        date,
        score: scoreForDay(dayLogs),
        logs: dayLogs,
        isComplete: PRAYERS.every((p) => dayLogs[p] !== undefined),
      };
    });
}

/** A day "counts" toward a streak when every prayer was logged and none were missed. */
function isStreakDay(dayLogs: DayLogs | undefined): boolean {
  if (!dayLogs) return false;
  return PRAYERS.every((p) => {
    const status = dayLogs[p]?.status;
    return status === "ON_TIME" || status === "LATE";
  });
}

export async function getStreaks(userId: string): Promise<{ current: number; best: number }> {
  const logs = await prisma.prayerLog.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
  if (logs.length === 0) return { current: 0, best: 0 };

  const byDate = groupByDate(logs);
  const firstDate = logs[0]!.date;
  const allDays = dateKeyRange(firstDate, todayKey());

  let best = 0;
  let running = 0;
  let current = 0;

  for (const day of allDays) {
    if (isStreakDay(byDate.get(day))) {
      running += 1;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  }

  // Current streak: walk backward from today (allow today to still be in progress).
  for (let i = allDays.length - 1; i >= 0; i--) {
    const day = allDays[i]!;
    if (isStreakDay(byDate.get(day))) {
      current += 1;
    } else if (day === todayKey()) {
      // Today not finished yet — don't break the streak on an incomplete "today".
      continue;
    } else {
      break;
    }
  }

  return { current, best };
}

export type StatsPeriod = "daily" | "weekly" | "monthly" | "overall";

export interface PeriodStats {
  totalPoints: number;
  onTimeRate: number;
  bestStreak: number;
  currentStreak: number;
  activeDays: number;
  perPrayerConsistency: Record<PrayerName, number>;
  trend: { date: string; score: number }[];
}

function periodStartKey(period: StatsPeriod): string {
  switch (period) {
    case "daily":
      return todayKey();
    case "weekly":
      return startOfWeekKey();
    case "monthly":
      return startOfMonthKey();
    case "overall":
      return daysAgoKey(365 * 5);
  }
}

export async function getStats(userId: string, period: StatsPeriod): Promise<PeriodStats> {
  const fromKey = periodStartKey(period);
  const toKey = todayKey();
  const [logs, streaks] = await Promise.all([
    getLogsInRange(userId, fromKey, toKey),
    getStreaks(userId),
  ]);

  const byDate = groupByDate(logs);
  const days = dateKeyRange(fromKey, toKey);

  let totalPoints = 0;
  let performedCount = 0;
  let onTimeCount = 0;
  let activeDays = 0;
  const perPrayerOnTime: Record<PrayerName, number> = {
    FAJR: 0,
    DHUHR: 0,
    ASR: 0,
    MAGHRIB: 0,
    ISHA: 0,
  };
  const perPrayerLogged: Record<PrayerName, number> = {
    FAJR: 0,
    DHUHR: 0,
    ASR: 0,
    MAGHRIB: 0,
    ISHA: 0,
  };

  const trend = days.map((date) => {
    const dayLogs = byDate.get(date);
    const score = scoreForDay(dayLogs ?? {});
    if (dayLogs && Object.keys(dayLogs).length > 0) activeDays += 1;
    totalPoints += score;

    for (const prayer of PRAYERS) {
      const log = dayLogs?.[prayer];
      if (!log) continue;
      performedCount += 1;
      perPrayerLogged[prayer] += 1;
      if (log.status === "ON_TIME") {
        onTimeCount += 1;
        perPrayerOnTime[prayer] += 1;
      }
    }

    return { date, score };
  });

  const perPrayerConsistency: Record<PrayerName, number> = {
    FAJR: 0,
    DHUHR: 0,
    ASR: 0,
    MAGHRIB: 0,
    ISHA: 0,
  };
  for (const prayer of PRAYERS) {
    perPrayerConsistency[prayer] =
      perPrayerLogged[prayer] > 0 ? perPrayerOnTime[prayer] / perPrayerLogged[prayer] : 0;
  }

  return {
    totalPoints,
    onTimeRate: performedCount > 0 ? onTimeCount / performedCount : 0,
    bestStreak: streaks.best,
    currentStreak: streaks.current,
    activeDays,
    perPrayerConsistency,
    trend,
  };
}

export { MAX_DAILY_SCORE, toDateKey, fromDateKey };
