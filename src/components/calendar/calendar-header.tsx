'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="flex items-center justify-between gap-4">
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

type CalendarMonthHeaderProps = {
  year: number;
  month: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function CalendarMonthHeader({
  year,
  month,
  onPrevious,
  onNext,
}: CalendarMonthHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold">
        {monthNames[month - 1]} {year}
      </h2>
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
    <div className="grid grid-cols-3 gap-x-3 gap-y-2 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="space-y-1">
          <Skeleton className="h-3 w-8" />
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: 35 }).map((__, cellIndex) => (
              <Skeleton key={cellIndex} className="aspect-square rounded-sm" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CalendarMonthSkeleton() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-3" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: 35 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square rounded-sm" />
        ))}
      </div>
    </div>
  );
}
