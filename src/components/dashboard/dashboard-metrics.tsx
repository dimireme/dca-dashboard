"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBtc, formatDate, formatNumber, formatUsdt } from "@/lib/format";
import type { DashboardMetrics } from "@/types";

type DashboardMetricsGridProps = {
  metrics: DashboardMetrics;
};

function MetricCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function DashboardMetricsGrid({ metrics }: DashboardMetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard title="Total invested" value={formatUsdt(metrics.totalInvested)} />
      <MetricCard title="Total BTC" value={formatBtc(metrics.totalBtc)} />
      <MetricCard
        title="Average entry price"
        value={metrics.averagePrice ? formatUsdt(metrics.averagePrice) : "—"}
      />
      <MetricCard title="DCA start date" value={formatDate(metrics.dcaStartDate)} />
      <MetricCard title="Daily amount" value={formatUsdt(metrics.dailyAmount)} />
      <MetricCard
        title="Covered / expected days"
        value={`${metrics.coveredDays} / ${metrics.expectedDays}`}
      />
      <MetricCard
        title="Days behind schedule"
        value={formatNumber(metrics.daysBehind, 0)}
        hint={metrics.amountBehind > 0 ? formatUsdt(metrics.amountBehind) : undefined}
      />
      <MetricCard
        title="Days ahead of schedule"
        value={formatNumber(metrics.daysAhead, 0)}
        hint={metrics.amountAhead > 0 ? formatUsdt(metrics.amountAhead) : undefined}
      />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}
