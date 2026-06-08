import { describe, expect, it } from "vitest";
import { generateDateRange } from "@/lib/dates";
import {
  buildPurchaseRangeRecords,
  calculateRangeBtcPrice,
} from "@/lib/purchase-range";

describe("purchase-range", () => {
  it("calculates average btc price from total invested and total btc", () => {
    expect(calculateRangeBtcPrice(30, 20, 0.006)).toBe(100_000);
  });

  it("generates consecutive dates from start date", () => {
    expect(generateDateRange("2026-01-01", 3)).toEqual([
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
    ]);
  });

  it("builds dca purchase records for each day in range", () => {
    const records = buildPurchaseRangeRecords({
      startDate: "2026-02-01",
      dayCount: 2,
      amountUsdtPerDay: 20,
      totalBtcAmount: 0.0004,
      notes: "historical import",
    });

    expect(records).toHaveLength(2);
    expect(records[0]).toEqual({
      date: "2026-02-01",
      amountUsdt: 20,
      btcPrice: 100_000,
      source: "dca",
      notes: "historical import",
    });
    expect(records[1]).toEqual({
      date: "2026-02-02",
      amountUsdt: 20,
      btcPrice: 100_000,
      source: "dca",
      notes: "historical import",
    });
  });
});
