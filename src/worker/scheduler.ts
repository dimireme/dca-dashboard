import { createPurchase } from "@/services/purchase.service";
import {
  claimDueStrategy,
  completeDueStrategy,
  listDueStrategies,
  rollbackDueStrategy,
} from "@/services/dca-strategy.service";
import type { WorkerConfig } from "@/worker/config";
import { OnChainSwapError, SwapService } from "@/worker/swap/swap.service";

export class StrategyScheduler {
  private readonly swapService: SwapService;
  private running = false;

  constructor(private readonly config: WorkerConfig) {
    this.swapService = new SwapService(config);
  }

  get walletAddress() {
    return this.swapService.walletAddress;
  }

  async tick(): Promise<void> {
    if (this.running) {
      console.log("[worker] Previous tick still running, skipping");
      return;
    }

    this.running = true;

    try {
      const due = await listDueStrategies(new Date(), this.config.lockStaleMs);

      if (due.length === 0) {
        return;
      }

      console.log(`[worker] Found ${due.length} due strateg${due.length === 1 ? "y" : "ies"}`);

      for (const strategy of due) {
        await this.executeStrategy(strategy.id, strategy.amountUsdc, strategy.intervalHours);
      }
    } finally {
      this.running = false;
    }
  }

  private async executeStrategy(
    strategyId: string,
    amountUsdc: number,
    intervalHours: number,
  ): Promise<void> {
    console.log(
      `[worker] Executing strategy ${strategyId}: ${amountUsdc} USDC every ${intervalHours}h`,
    );

    const claimed = await claimDueStrategy(
      strategyId,
      new Date(),
      this.config.lockStaleMs,
    );

    if (!claimed) {
      console.log(`[worker] Strategy ${strategyId} already claimed, skipping`);
      return;
    }

    try {
      const result = await this.swapService.swapUsdcToWbtc(amountUsdc);

      try {
        await createPurchase({
          amountUsdt: amountUsdc,
          btcPrice: result.effectiveBtcPrice,
          source: "dca",
          strategyId,
          txHash: result.txHash,
        });
      } catch (purchaseError) {
        const message =
          purchaseError instanceof Error ? purchaseError.message : String(purchaseError);
        console.error(
          `[worker] Strategy ${strategyId}: purchase save failed after swap ${result.txHash}: ${message}`,
        );
      }

      const completed = await completeDueStrategy(strategyId, intervalHours);
      if (!completed) {
        console.error(
          `[worker] Strategy ${strategyId}: failed to mark complete after swap ${result.txHash}`,
        );
      }

      console.log(
        `[worker] Strategy ${strategyId} done: tx=${result.txHash}, ` +
          `received=${result.wbtcReceived} WBTC, price=${result.effectiveBtcPrice.toFixed(2)}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (error instanceof OnChainSwapError) {
        // Tx already landed — never rollback to idle+due (would double-spend).
        console.error(
          `[worker] Strategy ${strategyId} on-chain error (${error.txHash}): ${message}`,
        );
        const completed = await completeDueStrategy(strategyId, intervalHours);
        if (!completed) {
          console.error(
            `[worker] Strategy ${strategyId}: failed to mark complete after on-chain error ${error.txHash}`,
          );
        }
        return;
      }

      console.error(`[worker] Strategy ${strategyId} failed: ${message}`);
      await rollbackDueStrategy(strategyId);
    }
  }
}
