"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarHeader,
  CalendarSkeleton,
} from "@/components/calendar/calendar-header";
import { CalendarLegend, CalendarMonthView } from "@/components/calendar/calendar-month-view";
import { DayDetailSheet } from "@/components/calendar/day-detail-sheet";
import { useCalendar } from "@/hooks/use-calendar";
import { useSettings } from "@/hooks/use-settings";
import type { CalendarDay } from "@/types";

export function CalendarPageContent() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const settingsQuery = useSettings();
  const calendarQuery = useCalendar(year, month);

  useEffect(() => {
    if (settingsQuery.isSuccess && settingsQuery.data === null) {
      router.replace("/settings");
    }
  }, [settingsQuery.isSuccess, settingsQuery.data, router]);

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

  return (
    <div className="space-y-6">
      <CalendarHeader
        year={year}
        month={month}
        onPrevious={handlePreviousMonth}
        onNext={handleNextMonth}
      />

      <CalendarLegend />

      {calendarQuery.isLoading ? (
        <CalendarSkeleton />
      ) : calendarQuery.data ? (
        <CalendarMonthView
          year={year}
          month={month}
          days={calendarQuery.data}
          onDayClick={handleDayClick}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Unable to load calendar data.</p>
      )}

      <DayDetailSheet day={selectedDay} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
