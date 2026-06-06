import { differenceInCalendarDays, startOfMonth, startOfWeek } from 'date-fns';

export const CALENDAR_CELL_SIZE_PX = 50;

/** ISO week: Monday is the first day of the week. */
export const CALENDAR_WEEK_STARTS_ON = 1 as const;

export function getLeadingEmptyCells(year: number, month: number): number {
  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const weekStart = startOfWeek(monthStart, {
    weekStartsOn: CALENDAR_WEEK_STARTS_ON,
  });
  return differenceInCalendarDays(monthStart, weekStart);
}
