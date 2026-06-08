import { generateDateRange } from "@/lib/dates";
import type { CreatePurchaseInput } from "@/types";

export type PurchaseRangeParams = {
  startDate: string;
  dayCount: number;
  amountUsdtPerDay: number;
  totalBtcAmount: number;
  notes?: string;
};

export function calculateRangeBtcPrice(
  dayCount: number,
  amountUsdtPerDay: number,
  totalBtcAmount: number,
): number {
  const totalUsdt = dayCount * amountUsdtPerDay;
  return totalUsdt / totalBtcAmount;
}

export function buildPurchaseRangeRecords(
  params: PurchaseRangeParams,
): Array<CreatePurchaseInput & { date: string }> {
  const { startDate, dayCount, amountUsdtPerDay, totalBtcAmount, notes } = params;
  const btcPrice = calculateRangeBtcPrice(dayCount, amountUsdtPerDay, totalBtcAmount);
  const dates = generateDateRange(startDate, dayCount);

  return dates.map((date) => ({
    date,
    amountUsdt: amountUsdtPerDay,
    btcPrice,
    source: "dca" as const,
    notes,
  }));
}
