import type { Hash } from "viem";
import type { WorkerConfig } from "@/worker/config";
import { KyberSwapClient } from "@/worker/swap/kyberswap.client";
import {
  calculateEffectiveBtcPrice,
  usdcToBaseUnits,
  wbtcFromBaseUnits,
} from "@/worker/swap/pricing";
import { WBTC_ADDRESS } from "@/worker/swap/tokens";
import {
  assertFundsForSwap,
  createWorkerClients,
  ensureUsdcAllowance,
  readWbtcBalance,
  type WorkerClients,
} from "@/worker/swap/wallet";

export type SwapResult = {
  txHash: Hash;
  amountUsdc: number;
  wbtcReceived: number;
  effectiveBtcPrice: number;
};

/** Thrown when the swap tx is already on-chain; caller must not retry the strategy. */
export class OnChainSwapError extends Error {
  readonly txHash: Hash;

  constructor(message: string, txHash: Hash) {
    super(message);
    this.name = "OnChainSwapError";
    this.txHash = txHash;
  }
}

const BALANCE_RETRY_ATTEMPTS = 3;
const BALANCE_RETRY_DELAY_MS = 1_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class SwapService {
  private readonly clients: WorkerClients;
  private readonly kyber: KyberSwapClient;
  private readonly slippageLimitPercent: number;

  constructor(config: WorkerConfig) {
    this.clients = createWorkerClients(config.walletPrivateKey, config.arbitrumRpcUrl);
    this.kyber = new KyberSwapClient(config.kyberClientId);
    this.slippageLimitPercent = config.slippageLimitPercent;
  }

  get walletAddress() {
    return this.clients.address;
  }

  async swapUsdcToWbtc(amountUsdc: number): Promise<SwapResult> {
    const amountBaseUnits = usdcToBaseUnits(amountUsdc);

    // RPC-only: skip Kyber when wallet cannot fund the swap / gas.
    await assertFundsForSwap(this.clients, amountBaseUnits);

    const route = await this.kyber.getRoute({
      amountBaseUnits,
      origin: this.clients.address,
    });

    const transaction = await this.kyber.buildRoute({
      routeSummary: route.routeSummary,
      sender: this.clients.address,
      recipient: this.clients.address,
      slippageLimitPercent: this.slippageLimitPercent,
    });

    await ensureUsdcAllowance(this.clients, transaction.to, amountBaseUnits);

    const balanceBefore = await readWbtcBalance(
      this.clients.publicClient,
      this.clients.address,
      WBTC_ADDRESS,
    );

    console.log(
      `[worker] Sending swap: ${amountUsdc} USDC → WBTC (to=${transaction.to})`,
    );

    const txHash = await this.clients.walletClient.sendTransaction({
      to: transaction.to,
      data: transaction.data,
      value: BigInt(transaction.value || "0"),
      ...(transaction.gas ? { gas: BigInt(transaction.gas) } : {}),
    });

    const receipt = await this.clients.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    if (receipt.status !== "success") {
      // Reverted: USDC not spent on swap — safe for strategy rollback/retry.
      throw new Error(`Swap transaction reverted: ${txHash}`);
    }

    const balanceAfter = await this.readWbtcBalanceAfterSwap(balanceBefore);

    const receivedRaw = balanceAfter - balanceBefore;
    if (receivedRaw <= BigInt(0)) {
      throw new OnChainSwapError(
        `Swap confirmed but WBTC balance did not increase: ${txHash}`,
        txHash,
      );
    }

    const wbtcReceived = wbtcFromBaseUnits(receivedRaw);
    const effectiveBtcPrice = calculateEffectiveBtcPrice(amountUsdc, wbtcReceived);

    return {
      txHash,
      amountUsdc,
      wbtcReceived,
      effectiveBtcPrice,
    };
  }

  private async readWbtcBalanceAfterSwap(balanceBefore: bigint): Promise<bigint> {
    let balanceAfter = balanceBefore;

    for (let attempt = 1; attempt <= BALANCE_RETRY_ATTEMPTS; attempt++) {
      balanceAfter = await readWbtcBalance(
        this.clients.publicClient,
        this.clients.address,
        WBTC_ADDRESS,
      );

      if (balanceAfter > balanceBefore) {
        return balanceAfter;
      }

      if (attempt < BALANCE_RETRY_ATTEMPTS) {
        console.warn(
          `[worker] WBTC balance unchanged after swap (attempt ${attempt}/${BALANCE_RETRY_ATTEMPTS}), retrying…`,
        );
        await sleep(BALANCE_RETRY_DELAY_MS);
      }
    }

    return balanceAfter;
  }
}
