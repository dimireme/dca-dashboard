'use client';

import { useMemo, useState } from 'react';
import {
  CalendarMonthHeader,
  CalendarMonthSkeleton,
  CalendarYearHeader,
  CalendarYearSkeleton,
} from '@/components/calendar/calendar-header';
import {
  CalendarMonthView,
  CalendarYearView,
} from '@/components/calendar/calendar-month-view';
import {
  CalendarStats,
  CalendarStatsSkeleton,
} from '@/components/calendar/calendar-stats';
import { DayDetailSheet } from '@/components/calendar/day-detail-sheet';
import { useCalendarYear } from '@/hooks/use-calendar';
import { useDashboard } from '@/hooks/use-dashboard';
import type { CalendarDay } from '@/types';

export function CalendarPageContent() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const calendarQuery = useCalendarYear(year);
  const dashboardQuery = useDashboard();

  const sheetDay = useMemo(() => {
    if (!selectedDay || !calendarQuery.data) {
      return selectedDay;
    }

    return (
      calendarQuery.data.months
        .flatMap((entry) => entry.days)
        .find((day) => day.date === selectedDay.date) ?? selectedDay
    );
  }, [calendarQuery.data, selectedDay]);

  function handlePreviousYear() {
    setYear((current) => current - 1);
  }

  function handleNextYear() {
    setYear((current) => current + 1);
  }

  function handlePreviousMonth() {
    if (month === 1) {
      setYear((current) => current - 1);
      setMonth(12);
      return;
    }

    setMonth((current) => current - 1);
  }

  function handleNextMonth() {
    if (month === 12) {
      setYear((current) => current + 1);
      setMonth(1);
      return;
    }

    setMonth((current) => current + 1);
  }

  function handleDayClick(day: CalendarDay) {
    setSelectedDay(day);
    setSheetOpen(true);
  }

  const monthData = calendarQuery.data?.months.find(
    (entry) => entry.month === month,
  );

  return (
    <div className="space-y-3">
      {dashboardQuery.isLoading ? (
        <CalendarStatsSkeleton />
      ) : dashboardQuery.data ? (
        <CalendarStats metrics={dashboardQuery.data} />
      ) : null}

      <hr />
      <div className="hidden lg:block">
        <CalendarYearHeader
          year={year}
          onPrevious={handlePreviousYear}
          onNext={handleNextYear}
        />
      </div>
      <div className="lg:hidden">
        <CalendarMonthHeader
          year={year}
          month={month}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
        />
      </div>

      {calendarQuery.isLoading ? (
        <>
          <div className="hidden lg:block">
            <CalendarYearSkeleton />
          </div>
          <div className="lg:hidden">
            <CalendarMonthSkeleton />
          </div>
        </>
      ) : calendarQuery.data ? (
        <>
          <div className="hidden lg:block">
            <CalendarYearView
              year={year}
              months={calendarQuery.data.months}
              onDayClick={handleDayClick}
            />
          </div>
          <div className="lg:hidden">
            {monthData ? (
              <CalendarMonthView
                year={year}
                month={month}
                days={monthData.days}
                onDayClick={handleDayClick}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Unable to load calendar data.
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Unable to load calendar data.
        </p>
      )}

      <DayDetailSheet
        key={sheetDay?.date}
        day={sheetDay}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
