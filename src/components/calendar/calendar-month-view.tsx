'use client';

import { CalendarDayCell } from '@/components/calendar/calendar-day-cell';
import {
  CALENDAR_CELL_SIZE_PX,
  getLeadingEmptyCells,
} from '@/lib/calendar-layout';
import type { CalendarDay } from '@/types';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type CalendarMonthViewProps = {
  year: number;
  month: number;
  days: CalendarDay[];
};

export function CalendarMonthView({
  year,
  month,
  days,
}: CalendarMonthViewProps) {
  const leadingCells = getLeadingEmptyCells(year, month);

  return (
    <div className="space-y-1">
      <div className="grid w-fit grid-cols-7 gap-0.5">
        {Array.from({ length: leadingCells }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="shrink-0"
            style={{
              width: CALENDAR_CELL_SIZE_PX,
              height: CALENDAR_CELL_SIZE_PX,
            }}
          />
        ))}

        {days.map((day) => (
          <CalendarDayCell key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}

type CalendarYearViewProps = {
  year: number;
  months: Array<{ month: number; days: CalendarDay[] }>;
};

export function CalendarYearView({ year, months }: CalendarYearViewProps) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-4">
      {months.map(({ month, days }) => (
        <div key={month} className="w-fit">
          <h3 className="mb-0.5 font-medium text-muted-foreground">
            {monthNames[month - 1]}
          </h3>
          <CalendarMonthView year={year} month={month} days={days} />
        </div>
      ))}
    </div>
  );
}
