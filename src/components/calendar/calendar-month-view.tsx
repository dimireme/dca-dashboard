"use client";

import { Bot, Hand } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarDay } from "@/types";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarMonthViewProps = {
  year: number;
  month: number;
  days: CalendarDay[];
  onDayClick: (day: CalendarDay) => void;
};

function getLeadingEmptyCells(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function CalendarMonthView({ year, month, days, onDayClick }: CalendarMonthViewProps) {
  const leadingCells = getLeadingEmptyCells(year, month);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
        {weekdayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: leadingCells }).map((_, index) => (
          <div key={`empty-${index}`} className="min-h-24 rounded-lg border border-dashed border-transparent" />
        ))}

        {days.map((day) => {
          const dayNumber = Number(day.date.split("-")[2]);
          const hasManual = day.purchases.some((purchase) => purchase.source === "manual");
          const hasDca = day.purchases.some((purchase) => purchase.source === "dca");

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-24 rounded-lg border p-2 text-left transition-colors hover:opacity-90",
                day.status === "covered" && "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30",
                day.status === "missed" && "border-rose-300 bg-rose-50 dark:bg-rose-950/30",
                day.status === "neutral" && "border-border bg-background",
                day.isToday && "ring-2 ring-primary ring-offset-2",
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-sm font-semibold">{dayNumber}</span>
                <div className="flex gap-1">
                  {hasManual ? <Hand className="size-3.5 text-amber-600" /> : null}
                  {hasDca ? <Bot className="size-3.5 text-blue-600" /> : null}
                </div>
              </div>
              {day.purchases.length > 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {day.purchases.length} purchase{day.purchases.length > 1 ? "s" : ""}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="size-3 rounded-full bg-emerald-400" />
        Covered
      </div>
      <div className="flex items-center gap-2">
        <span className="size-3 rounded-full bg-rose-400" />
        Missed
      </div>
      <div className="flex items-center gap-2">
        <Hand className="size-3.5 text-amber-600" />
        Manual
      </div>
      <div className="flex items-center gap-2">
        <Bot className="size-3.5 text-blue-600" />
        DCA bot
      </div>
    </div>
  );
}
