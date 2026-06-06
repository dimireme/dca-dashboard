import { format } from "date-fns";
import { DAILY_AMOUNT_USD } from "@/lib/dca-config";
import { findAllPurchases, findEarliestPurchaseDate } from "@/repositories/purchase.repository";
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
): Promise<DashboardMetrics> {
  const [purchases, dcaStartDate] = await Promise.all([
    findAllPurchases(),
    findEarliestPurchaseDate(),
  ]);
  const referenceDateKey = format(referenceDate, "yyyy-MM-dd");
  const totalInvested = calculateTotalInvested(purchases);
  const totalBtc = calculateTotalBtc(purchases);
  const coveredDays = calculateCoveredDays(totalInvested, DAILY_AMOUNT_USD);
  const expectedDays =
    dcaStartDate === null ? 0 : calculateExpectedDays(dcaStartDate, referenceDateKey);
  const schedule = calculateScheduleProgress(coveredDays, expectedDays, DAILY_AMOUNT_USD);

  return {
    totalInvested,
    totalBtc,
    averagePrice: calculateAveragePrice(totalInvested, totalBtc),
    dcaStartDate,
    dailyAmount: DAILY_AMOUNT_USD,
    coveredDays,
    expectedDays,
    ...schedule,
  };
}
