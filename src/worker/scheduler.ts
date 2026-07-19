import { createPurchase } from "@/services/purchase.service";
import {
  listDueStrategies,
  markStrategyExecuted,
} from "@/services/dca-strategy.service";
import type { WorkerConfig } from "@/worker/config";
import { SwapService } from "@/worker/swap/swap.service";

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
      const due = await listDueStrategies();

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

    try {
      const result = await this.swapService.swapUsdcToWbtc(amountUsdc);

      await createPurchase({
        amountUsdt: amountUsdc,
        btcPrice: result.effectiveBtcPrice,
        source: "dca",
        strategyId,
        txHash: result.txHash,
      });

      await markStrategyExecuted(strategyId, intervalHours);

      console.log(
        `[worker] Strategy ${strategyId} done: tx=${result.txHash}, ` +
          `received=${result.wbtcReceived} WBTC, price=${result.effectiveBtcPrice.toFixed(2)}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[worker] Strategy ${strategyId} failed: ${message}`);
    }
  }
}
