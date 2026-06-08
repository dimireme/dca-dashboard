import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateKey(dateKey: string): Date {
  return startOfDay(parseISO(dateKey));
}

export function toUtcDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function fromDbDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function toDbDate(dateKey: string): Date {
  return toUtcDate(dateKey);
}

export function getMonthDateKeys(year: number, month: number): string[] {
  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const monthEnd = endOfMonth(monthStart);
  const days: string[] = [];
  let current = monthStart;

  while (current <= monthEnd) {
    days.push(toDateKey(current));
    current = addDays(current, 1);
  }

  return days;
}

export function getDayIndexFromStart(dateKey: string, startDateKey: string): number {
  const diff = differenceInCalendarDays(parseDateKey(dateKey), parseDateKey(startDateKey));
  return diff + 1;
}

export function generateDateRange(startDateKey: string, dayCount: number): string[] {
  const dates: string[] = [];
  let current = parseDateKey(startDateKey);

  for (let i = 0; i < dayCount; i++) {
    dates.push(toDateKey(current));
    current = addDays(current, 1);
  }

  return dates;
}

export function getExpectedDays(dcaStartDateKey: string, referenceDateKey: string): number {
  const start = parseDateKey(dcaStartDateKey);
  const reference = parseDateKey(referenceDateKey);

  if (reference < start) {
    return 0;
  }

  return differenceInCalendarDays(reference, start) + 1;
}
