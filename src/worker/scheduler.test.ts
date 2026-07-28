import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  listDueStrategies,
  claimDueStrategy,
  completeDueStrategy,
  rollbackDueStrategy,
  createPurchase,
  swapUsdcToWbtc,
} = vi.hoisted(() => ({
  listDueStrategies: vi.fn(),
  claimDueStrategy: vi.fn(),
  completeDueStrategy: vi.fn(),
  rollbackDueStrategy: vi.fn(),
  createPurchase: vi.fn(),
  swapUsdcToWbtc: vi.fn(),
}));

vi.mock("@/services/dca-strategy.service", () => ({
  listDueStrategies,
  claimDueStrategy,
  completeDueStrategy,
  rollbackDueStrategy,
}));

vi.mock("@/services/purchase.service", () => ({
  createPurchase,
}));

vi.mock("@/worker/swap/swap.service", async () => {
  class OnChainSwapError extends Error {
    txHash: `0x${string}`;
    constructor(message: string, txHash: `0x${string}`) {
      super(message);
      this.name = "OnChainSwapError";
      this.txHash = txHash;
    }
  }

  return {
    OnChainSwapError,
    SwapService: class {
      walletAddress = "0xabc";
      swapUsdcToWbtc = swapUsdcToWbtc;
    },
  };
});

import { StrategyScheduler } from "@/worker/scheduler";
import { OnChainSwapError } from "@/worker/swap/swap.service";
import type { WorkerConfig } from "@/worker/config";

const config: WorkerConfig = {
  databaseUrl: "postgres://test",
  arbitrumRpcUrl: "https://example.com",
  walletPrivateKey: `0x${"11".repeat(32)}`,
  odosApiKey: null,
  pollIntervalMs: 60_000,
  slippageLimitPercent: 0.5,
  lockStaleMs: 15 * 60 * 1000,
};

const strategy = {
  id: "strat-1",
  enabled: true,
  amountUsdc: 10,
  intervalHours: 24,
  lastExecutionAt: null,
  nextExecutionAt: "2026-07-28T00:00:00.000Z",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
  summary: { purchaseCount: 0, totalInvested: 0, averagePrice: null },
};

describe("StrategyScheduler execution lock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listDueStrategies.mockResolvedValue([strategy]);
    completeDueStrategy.mockResolvedValue(strategy);
    rollbackDueStrategy.mockResolvedValue(true);
    createPurchase.mockResolvedValue({});
  });

  it("skips swap when claim fails (already in progress)", async () => {
    claimDueStrategy.mockResolvedValue(false);

    const scheduler = new StrategyScheduler(config);
    await scheduler.tick();

    expect(claimDueStrategy).toHaveBeenCalledWith(
      "strat-1",
      expect.any(Date),
      config.lockStaleMs,
    );
    expect(swapUsdcToWbtc).not.toHaveBeenCalled();
    expect(rollbackDueStrategy).not.toHaveBeenCalled();
  });

  it("rolls back status on pre-chain failure", async () => {
    claimDueStrategy.mockResolvedValue(true);
    swapUsdcToWbtc.mockRejectedValue(new Error("insufficient USDC"));

    const scheduler = new StrategyScheduler(config);
    await scheduler.tick();

    expect(rollbackDueStrategy).toHaveBeenCalledWith("strat-1");
    expect(completeDueStrategy).not.toHaveBeenCalled();
    expect(createPurchase).not.toHaveBeenCalled();
  });

  it("completes schedule after successful swap", async () => {
    claimDueStrategy.mockResolvedValue(true);
    swapUsdcToWbtc.mockResolvedValue({
      txHash: "0xdead",
      amountUsdc: 10,
      wbtcReceived: 0.0001,
      effectiveBtcPrice: 100_000,
    });

    const scheduler = new StrategyScheduler(config);
    await scheduler.tick();

    expect(createPurchase).toHaveBeenCalled();
    expect(completeDueStrategy).toHaveBeenCalledWith("strat-1", 24);
    expect(rollbackDueStrategy).not.toHaveBeenCalled();
  });

  it("does not rollback after on-chain error — marks complete instead", async () => {
    claimDueStrategy.mockResolvedValue(true);
    swapUsdcToWbtc.mockRejectedValue(
      new OnChainSwapError("balance unchanged", "0xbeef"),
    );

    const scheduler = new StrategyScheduler(config);
    await scheduler.tick();

    expect(rollbackDueStrategy).not.toHaveBeenCalled();
    expect(completeDueStrategy).toHaveBeenCalledWith("strat-1", 24);
  });
});
