import { describe, expect, it } from "vitest";
import {
  calculateEffectiveBtcPrice,
  usdcToBaseUnits,
  wbtcFromBaseUnits,
} from "@/worker/swap/pricing";

describe("swap pricing", () => {
  it("converts USDC to 6-decimal base units", () => {
    expect(usdcToBaseUnits(5)).toBe(BigInt(5_000_000));
    expect(usdcToBaseUnits(5.25)).toBe(BigInt(5_250_000));
  });

  it("rejects non-positive USDC amounts", () => {
    expect(() => usdcToBaseUnits(0)).toThrow();
    expect(() => usdcToBaseUnits(-1)).toThrow();
  });

  it("converts WBTC base units to human amount", () => {
    expect(wbtcFromBaseUnits(BigInt(100_000_000))).toBe(1);
    expect(wbtcFromBaseUnits(BigInt(50_000))).toBe(0.0005);
  });

  it("calculates effective BTC price from USDC spent and WBTC received", () => {
    expect(calculateEffectiveBtcPrice(5, 0.00005)).toBe(100_000);
  });

  it("rejects zero WBTC received", () => {
    expect(() => calculateEffectiveBtcPrice(5, 0)).toThrow();
  });
});
