'use client';

import { useState } from 'react';
import {
  CalendarYearHeader,
  CalendarYearSkeleton,
} from '@/components/calendar/calendar-header';
import { CalendarYearView } from '@/components/calendar/calendar-month-view';
import {
  CalendarStats,
  CalendarStatsSkeleton,
} from '@/components/calendar/calendar-stats';
import { useCalendarYear } from '@/hooks/use-calendar';
import { useDashboard } from '@/hooks/use-dashboard';

export function CalendarPageContent() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const calendarQuery = useCalendarYear(year);
  const dashboardQuery = useDashboard();

  function handlePreviousYear() {
    setYear((current) => current - 1);
  }

  function handleNextYear() {
    setYear((current) => current + 1);
  }

  return (
    <div className="space-y-3">
      {dashboardQuery.isLoading ? (
        <CalendarStatsSkeleton />
      ) : dashboardQuery.data ? (
        <CalendarStats metrics={dashboardQuery.data} />
      ) : null}

      <hr />

      <CalendarYearHeader
        year={year}
        onPrevious={handlePreviousYear}
        onNext={handleNextYear}
      />

      {calendarQuery.isLoading ? (
        <CalendarYearSkeleton />
      ) : calendarQuery.data ? (
        <CalendarYearView
          year={year}
          months={calendarQuery.data.months}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Unable to load calendar data.
        </p>
      )}
    </div>
  );
}
