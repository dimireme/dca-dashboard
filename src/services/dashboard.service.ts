import { format } from "date-fns";
import { findAllPurchases } from "@/repositories/purchase.repository";
import { getSettings } from "@/repositories/settings.repository";
import type { DashboardMetrics } from "@/types";
import {
  calculateAveragePrice,
  calculateCoveredDays,
  calculateExpectedDays,
  calculateScheduleProgress,
  calculateTotalBtc,
  calculateTotalInvested,
} from "./dca.service";

export async function getDashboardMetrics(
  referenceDate = new Date(),
): Promise<DashboardMetrics | null> {
  const settings = await getSettings();

  if (!settings) {
    return null;
  }

  const purchases = await findAllPurchases();
  const referenceDateKey = format(referenceDate, "yyyy-MM-dd");
  const totalInvested = calculateTotalInvested(purchases);
  const totalBtc = calculateTotalBtc(purchases);
  const coveredDays = calculateCoveredDays(totalInvested, settings.dailyAmount);
  const expectedDays = calculateExpectedDays(settings.dcaStartDate, referenceDateKey);
  const schedule = calculateScheduleProgress(coveredDays, expectedDays, settings.dailyAmount);

  return {
    totalInvested,
    totalBtc,
    averagePrice: calculateAveragePrice(totalInvested, totalBtc),
    dcaStartDate: settings.dcaStartDate,
    dailyAmount: settings.dailyAmount,
    coveredDays,
    expectedDays,
    ...schedule,
  };
}
