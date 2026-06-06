'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CALENDAR_CELL_SIZE_PX } from '@/lib/calendar-layout';

type CalendarYearHeaderProps = {
  year: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function CalendarYearHeader({
  year,
  onPrevious,
  onNext,
}: CalendarYearHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-xl font-semibold">{year}</h2>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onPrevious}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button type="button" variant="outline" size="icon-sm" onClick={onNext}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function CalendarYearSkeleton() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="w-fit space-y-1">
          <Skeleton className="h-4 w-12" />
          <div className="grid w-fit grid-cols-7 gap-0.5">
            {Array.from({ length: 35 }).map((__, cellIndex) => (
              <Skeleton
                key={cellIndex}
                className="rounded-sm"
                style={{
                  width: CALENDAR_CELL_SIZE_PX,
                  height: CALENDAR_CELL_SIZE_PX,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
