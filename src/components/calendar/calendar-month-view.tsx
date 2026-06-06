"use client";

import { CalendarDayCell } from "@/components/calendar/calendar-day-cell";
import type { CalendarDay } from "@/types";

const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type CalendarMonthViewProps = {
  year: number;
  month: number;
  days: CalendarDay[];
  onDayClick: (day: CalendarDay) => void;
  compact?: boolean;
};

function getLeadingEmptyCells(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function CalendarMonthView({
  year,
  month,
  days,
  onDayClick,
  compact = false,
}: CalendarMonthViewProps) {
  const leadingCells = getLeadingEmptyCells(year, month);

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      {!compact ? (
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
          {weekdayLabels.map((label, index) => (
            <div key={`${label}-${index}`}>{label}</div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: leadingCells }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {days.map((day) => (
          <CalendarDayCell key={day.date} day={day} onClick={onDayClick} />
        ))}
      </div>
    </div>
  );
}

type CalendarYearViewProps = {
  year: number;
  months: Array<{ month: number; days: CalendarDay[] }>;
  onDayClick: (day: CalendarDay) => void;
};

export function CalendarYearView({ year, months, onDayClick }: CalendarYearViewProps) {
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-2 xl:grid-cols-4">
      {months.map(({ month, days }) => (
        <div key={month}>
          <h3 className="mb-0.5 text-[11px] font-medium text-muted-foreground">
            {monthNames[month - 1]}
          </h3>
          <CalendarMonthView
            year={year}
            month={month}
            days={days}
            onDayClick={onDayClick}
            compact
          />
        </div>
      ))}
    </div>
  );
}
