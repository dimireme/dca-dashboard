"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type CalendarHeaderProps = {
  year: number;
  month: number;
  onPrevious: () => void;
  onNext: () => void;
};

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

export function CalendarHeader({ year, month, onPrevious, onNext }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold">
          {monthNames[month - 1]} {year}
        </h2>
        <p className="text-sm text-muted-foreground">Track covered and missed DCA days</p>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="icon" onClick={onPrevious}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, index) => (
          <Skeleton key={index} className="min-h-24 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
