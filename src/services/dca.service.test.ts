import { describe, expect, it } from "vitest";
import { DAILY_AMOUNT_USD } from "@/lib/dca-config";
import {
  calculateAveragePrice,
  calculateCoveredDays,
  calculateExpectedDays,
  calculateScheduleProgress,
  calculateTotalBtc,
  calculateTotalInvested,
} from "./dca.service";

describe("dca.service", () => {
  const purchases = [
    { amountUsdt: 300, btcAmount: 300 / 98000 },
    { amountUsdt: 620, btcAmount: 620 / 100000 },
  ];

  it("calculates average price", () => {
    const totalInvested = calculateTotalInvested(purchases);
    const totalBtc = calculateTotalBtc(purchases);

    expect(totalInvested).toBe(920);
    expect(calculateAveragePrice(totalInvested, totalBtc)).toBeCloseTo(920 / totalBtc, 8);
  });

  it("calculates covered days from total invested", () => {
    expect(calculateCoveredDays(920, DAILY_AMOUNT_USD)).toBe(46);
    expect(calculateCoveredDays(0, DAILY_AMOUNT_USD)).toBe(0);
    expect(calculateCoveredDays(19, DAILY_AMOUNT_USD)).toBe(0);
  });

  it("calculates schedule progress", () => {
    const coveredDays = calculateCoveredDays(920, DAILY_AMOUNT_USD);
    const expectedDays = calculateExpectedDays("2026-01-01", "2026-02-28");
    const progress = calculateScheduleProgress(coveredDays, expectedDays, DAILY_AMOUNT_USD);

    expect(coveredDays).toBe(46);
    expect(expectedDays).toBe(59);
    expect(progress.daysBehind).toBe(13);
    expect(progress.daysAhead).toBe(0);
    expect(progress.amountBehind).toBe(260);
    expect(progress.amountAhead).toBe(0);
  });

  it("calculates ahead schedule when over-covered", () => {
    const progress = calculateScheduleProgress(50, 40, DAILY_AMOUNT_USD);

    expect(progress.daysBehind).toBe(0);
    expect(progress.daysAhead).toBe(10);
    expect(progress.amountAhead).toBe(200);
  });
});
