import {
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  subDays,
  eachDayOfInterval,
} from "date-fns";

export const DATE_KEY_FORMAT = "yyyy-MM-dd";

export function toDateKey(date: Date): string {
  return format(date, DATE_KEY_FORMAT);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function fromDateKey(key: string): Date {
  return parseISO(key);
}

export function daysAgoKey(days: number): string {
  return toDateKey(subDays(new Date(), days));
}

export function startOfWeekKey(): string {
  return toDateKey(startOfWeek(new Date(), { weekStartsOn: 1 }));
}

export function startOfMonthKey(): string {
  return toDateKey(startOfMonth(new Date()));
}

export function dateKeyRange(fromKey: string, toKeyInclusive: string): string[] {
  return eachDayOfInterval({
    start: fromDateKey(fromKey),
    end: fromDateKey(toKeyInclusive),
  }).map(toDateKey);
}

export function formatDisplayDate(key: string): string {
  return format(fromDateKey(key), "EEEE, MMM d");
}
