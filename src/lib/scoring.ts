export const PRAYERS = ["FAJR", "DHUHR", "ASR", "MAGHRIB", "ISHA"] as const;
export type PrayerName = (typeof PRAYERS)[number];

export const PRAYER_STATUSES = ["ON_TIME", "LATE", "NOT_PERFORMED"] as const;
export type PrayerStatusName = (typeof PRAYER_STATUSES)[number];

export const PRAYER_META: Record<
  PrayerName,
  { label: string; arabic: string; window: string }
> = {
  FAJR: { label: "Fajr", arabic: "الفجر", window: "Before sunrise" },
  DHUHR: { label: "Dhuhr", arabic: "الظهر", window: "Midday" },
  ASR: { label: "Asr", arabic: "العصر", window: "Afternoon" },
  MAGHRIB: { label: "Maghrib", arabic: "المغرب", window: "Sunset" },
  ISHA: { label: "Isha", arabic: "العشاء", window: "Night" },
};

export const STATUS_META: Record<
  PrayerStatusName,
  { label: string }
> = {
  ON_TIME: { label: "On Time" },
  LATE: { label: "Late" },
  NOT_PERFORMED: { label: "Not Performed" },
};

/**
 * Fajr on time is worth more than the other four prayers on time, so the
 * five daily maximums (15 + 5 + 5 + 5 + 5) sum to the 35-point daily cap.
 */
export function pointsFor(prayer: PrayerName, status: PrayerStatusName): number {
  if (status === "NOT_PERFORMED") return -5;
  if (status === "LATE") return 1;
  return prayer === "FAJR" ? 15 : 5;
}

export const MAX_DAILY_SCORE = PRAYERS.reduce(
  (sum, prayer) => sum + pointsFor(prayer, "ON_TIME"),
  0,
);
