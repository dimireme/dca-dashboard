"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardMetricsGrid,
  DashboardSkeleton,
} from "@/components/dashboard/dashboard-metrics";
import { useDashboard } from "@/hooks/use-dashboard";
import { useSettings } from "@/hooks/use-settings";

export function DashboardPageContent() {
  const router = useRouter();
  const settingsQuery = useSettings();
  const dashboardQuery = useDashboard();

  useEffect(() => {
    if (settingsQuery.isSuccess && settingsQuery.data === null) {
      router.replace("/settings");
    }
  }, [settingsQuery.isSuccess, settingsQuery.data, router]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your DCA execution and schedule progress.
        </p>
      </div>

      {dashboardQuery.isLoading ? (
        <DashboardSkeleton />
      ) : dashboardQuery.data ? (
        <DashboardMetricsGrid metrics={dashboardQuery.data} />
      ) : (
        <p className="text-sm text-muted-foreground">Unable to load dashboard metrics.</p>
      )}
    </div>
  );
}
