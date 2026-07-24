import { formatEther, formatUnits } from "viem";
import { USDC_DECIMALS } from "@/worker/swap/tokens";

/** Conservative ceiling for Odos USDC→WBTC swap on Arbitrum (~700k observed). */
export const SWAP_GAS_CEILING = BigInt(1_000_000);

/** Extra gas if an ERC-20 approve may be needed before the swap. */
export const APPROVE_GAS_CEILING = BigInt(100_000);

export function estimateRequiredEthWei(
  gasPriceWei: bigint,
  options?: { includeApprove?: boolean },
): bigint {
  const gas =
    SWAP_GAS_CEILING +
    (options?.includeApprove === false ? BigInt(0) : APPROVE_GAS_CEILING);
  return gasPriceWei * gas;
}

export function formatInsufficientUsdcError(
  have: bigint,
  need: bigint,
): string {
  return (
    `Insufficient USDC: have ${formatUnits(have, USDC_DECIMALS)} USDC, ` +
    `need ${formatUnits(need, USDC_DECIMALS)} USDC — skipping Odos`
  );
}

export function formatInsufficientEthError(
  have: bigint,
  need: bigint,
): string {
  return (
    `Insufficient ETH for gas: have ${formatEther(have)} ETH, ` +
    `need ~${formatEther(need)} ETH — skipping Odos`
  );
}
