import "server-only";
import { PRAYERS, PRAYER_META, type PrayerName } from "@/lib/scoring";

/**
 * Aladhan (https://aladhan.com/prayer-times-api) calculation method IDs,
 * mapped from the friendly values stored on User.calculationMethod.
 */
const METHOD_IDS: Record<string, number> = {
  MWL: 3,
  ISNA: 2,
  EGYPT: 5,
  MAKKAH: 4,
  KARACHI: 1,
};

/** Aladhan "school" param: 0 = Shafi'i (earlier Asr), 1 = Hanafi (later Asr). */
const SCHOOL_IDS: Record<string, number> = {
  SHAFI: 0,
  HANAFI: 1,
};

export type DailyPrayerTimes = Record<PrayerName, string> & { timezone: string };

function toDDMMYYYY(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  return `${d}-${m}-${y}`;
}

/** Aladhan sometimes suffixes a timezone abbreviation, e.g. "05:23 (CET)". */
function stripTzSuffix(time: string): string {
  return time.split(" ")[0]!;
}

export async function fetchPrayerTimes(
  city: string,
  country: string,
  calculationMethod: string,
  madhab: string,
  dateKey: string,
): Promise<DailyPrayerTimes | null> {
  const method = METHOD_IDS[calculationMethod] ?? METHOD_IDS.MWL;
  const school = SCHOOL_IDS[madhab] ?? SCHOOL_IDS.SHAFI;
  const date = toDDMMYYYY(dateKey);

  const url = `https://api.aladhan.com/v1/timingsByCity/${date}?city=${encodeURIComponent(
    city,
  )}&country=${encodeURIComponent(country)}&method=${method}&school=${school}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const json = await res.json();
    const timings = json?.data?.timings;
    const timezone = json?.data?.meta?.timezone;
    if (json?.code !== 200 || !timings || !timezone) return null;

    return {
      FAJR: stripTzSuffix(timings.Fajr),
      DHUHR: stripTzSuffix(timings.Dhuhr),
      ASR: stripTzSuffix(timings.Asr),
      MAGHRIB: stripTzSuffix(timings.Maghrib),
      ISHA: stripTzSuffix(timings.Isha),
      timezone,
    };
  } catch {
    return null;
  }
}

/** Current time of day (24h "HH:mm") in the given IANA timezone. */
export function currentLocalTimeHHmm(timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/** Zero-padded 24h "HH:mm" strings compare correctly as plain strings. */
export function hasTimeStarted(prayerTimeHHmm: string, nowHHmm: string): boolean {
  return nowHHmm >= prayerTimeHHmm;
}

export function formatTime12h(timeHHmm: string): string {
  const [h, m] = timeHHmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export interface PrayerSchedule {
  unlocked: boolean;
  windowLabel: string;
  liveTimesAvailable: boolean;
}

/**
 * Per-prayer schedule for today: whether logging is unlocked yet (the
 * prayer's time has started) and what label to show under its name. Falls
 * back to the static window description — and leaves everything unlocked —
 * when the user has no location set or the API call fails.
 */
export async function getTodaySchedule(
  user: { city: string | null; country: string | null; calculationMethod: string; madhab: string },
  dateKey: string,
): Promise<Record<PrayerName, PrayerSchedule>> {
  const fallback = Object.fromEntries(
    PRAYERS.map((p) => [
      p,
      { unlocked: true, windowLabel: PRAYER_META[p].window, liveTimesAvailable: false },
    ]),
  ) as Record<PrayerName, PrayerSchedule>;

  if (!user.city || !user.country) return fallback;

  const times = await fetchPrayerTimes(
    user.city,
    user.country,
    user.calculationMethod,
    user.madhab,
    dateKey,
  );
  if (!times) return fallback;

  const nowHHmm = currentLocalTimeHHmm(times.timezone);

  return Object.fromEntries(
    PRAYERS.map((p) => [
      p,
      {
        unlocked: hasTimeStarted(times[p], nowHHmm),
        windowLabel: formatTime12h(times[p]),
        liveTimesAvailable: true,
      },
    ]),
  ) as Record<PrayerName, PrayerSchedule>;
}
