import { formatUnits, parseUnits } from "viem";
import { USDC_DECIMALS, WBTC_DECIMALS } from "@/worker/swap/tokens";

export function usdcToBaseUnits(amountUsdc: number): bigint {
  if (!Number.isFinite(amountUsdc) || amountUsdc <= 0) {
    throw new Error(`Invalid USDC amount: ${amountUsdc}`);
  }

  return parseUnits(amountUsdc.toFixed(USDC_DECIMALS), USDC_DECIMALS);
}

export function wbtcFromBaseUnits(amount: bigint): number {
  return Number(formatUnits(amount, WBTC_DECIMALS));
}

/** Effective BTC price in USD: USDC spent / WBTC received */
export function calculateEffectiveBtcPrice(amountUsdc: number, wbtcReceived: number): number {
  if (!Number.isFinite(wbtcReceived) || wbtcReceived <= 0) {
    throw new Error(`Invalid WBTC received amount: ${wbtcReceived}`);
  }

  return amountUsdc / wbtcReceived;
}
