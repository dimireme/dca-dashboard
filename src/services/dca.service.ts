import type { Purchase } from "@/types";

export function calculateTotalInvested(purchases: Pick<Purchase, "amountUsdt">[]): number {
  return purchases.reduce((sum, purchase) => sum + purchase.amountUsdt, 0);
}

export function calculateTotalBtc(purchases: Pick<Purchase, "btcAmount">[]): number {
  return purchases.reduce((sum, purchase) => sum + purchase.btcAmount, 0);
}

export function calculateAveragePrice(totalInvested: number, totalBtc: number): number | null {
  if (totalBtc <= 0) {
    return null;
  }

  return totalInvested / totalBtc;
}

export function calculateCoveredDays(totalInvested: number, dailyAmount: number): number {
  if (dailyAmount <= 0) {
    return 0;
  }

  return Math.floor(totalInvested / dailyAmount);
}

export function calculateExpectedDays(dcaStartDateKey: string, referenceDateKey: string): number {
  const start = new Date(`${dcaStartDateKey}T00:00:00.000Z`);
  const reference = new Date(`${referenceDateKey}T00:00:00.000Z`);

  if (reference < start) {
    return 0;
  }

  const diffMs = reference.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

export function calculateScheduleProgress(
  coveredDays: number,
  expectedDays: number,
  dailyAmount: number,
) {
  const daysBehind = Math.max(0, expectedDays - coveredDays);
  const daysAhead = Math.max(0, coveredDays - expectedDays);

  return {
    daysBehind,
    daysAhead,
    amountBehind: daysBehind * dailyAmount,
    amountAhead: daysAhead * dailyAmount,
  };
}

export function getDayStatus(
  dateKey: string,
  dcaStartDateKey: string,
  referenceDateKey: string,
  coveredDays: number,
): "neutral" | "covered" | "missed" {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  const start = new Date(`${dcaStartDateKey}T00:00:00.000Z`);
  const reference = new Date(`${referenceDateKey}T00:00:00.000Z`);

  if (date < start || date > reference) {
    return "neutral";
  }

  const dayIndex = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (dayIndex <= coveredDays) {
    return "covered";
  }

  return "missed";
}
