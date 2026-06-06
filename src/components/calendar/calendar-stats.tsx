"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatBtc, formatUsdWhole } from "@/lib/format";
import type { DashboardMetrics } from "@/types";

type CalendarStatsProps = {
  metrics: DashboardMetrics;
  className?: string;
};

function getScheduleDisplay(metrics: DashboardMetrics) {
  if (metrics.daysBehind > 0) {
    return {
      label: "behind",
      value: `${metrics.daysBehind} days (${formatUsdWhole(metrics.amountBehind)})`,
      className: "text-rose-600 dark:text-rose-400",
    };
  }

  if (metrics.daysAhead > 0) {
    return {
      label: "ahead",
      value: `${metrics.daysAhead} days (${formatUsdWhole(metrics.amountAhead)})`,
      className: "text-emerald-600 dark:text-emerald-400",
    };
  }

  return {
    label: "on schedule",
    value: "0 days",
    className: "text-muted-foreground",
  };
}

export function CalendarStats({ metrics, className }: CalendarStatsProps) {
  const schedule = getScheduleDisplay(metrics);

  return (
    <div className={cn("flex flex-wrap gap-x-6 gap-y-2 text-sm", className)}>
      <div>
        <p className="text-muted-foreground">invested</p>
        <p className="font-medium">{formatUsdWhole(metrics.totalInvested)}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Bought BTC</p>
        <p className="font-medium">{formatBtc(metrics.totalBtc)}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Average price</p>
        <p className="font-medium">
          {metrics.averagePrice ? formatUsdWhole(metrics.averagePrice) : "—"}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground">{schedule.label}</p>
        <p className={cn("font-medium", schedule.className)}>{schedule.value}</p>
      </div>
    </div>
  );
}

export function CalendarStatsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-x-6 gap-y-2", className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
