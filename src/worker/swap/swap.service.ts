import type { Hash } from "viem";
import type { WorkerConfig } from "@/worker/config";
import { OdosClient } from "@/worker/swap/odos.client";
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

export class SwapService {
  private readonly clients: WorkerClients;
  private readonly odos: OdosClient;
  private readonly slippageLimitPercent: number;

  constructor(config: WorkerConfig) {
    this.clients = createWorkerClients(config.walletPrivateKey, config.arbitrumRpcUrl);
    this.odos = new OdosClient(config.odosApiKey);
    this.slippageLimitPercent = config.slippageLimitPercent;
  }

  get walletAddress() {
    return this.clients.address;
  }

  async swapUsdcToWbtc(amountUsdc: number): Promise<SwapResult> {
    const amountBaseUnits = usdcToBaseUnits(amountUsdc);

    // RPC-only: skip Odos when wallet cannot fund the swap / gas.
    await assertFundsForSwap(this.clients, amountBaseUnits);

    const quote = await this.odos.quote({
      userAddr: this.clients.address,
      amountBaseUnits,
      slippageLimitPercent: this.slippageLimitPercent,
    });

    // Assemble without simulation — Odos simulate requires USDC allowance already set.
    const assembled = await this.odos.assemble({
      userAddr: this.clients.address,
      pathId: quote.pathId,
      simulate: false,
    });

    const { transaction } = assembled;

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
      throw new Error(`Swap transaction reverted: ${txHash}`);
    }

    const balanceAfter = await readWbtcBalance(
      this.clients.publicClient,
      this.clients.address,
      WBTC_ADDRESS,
    );

    const receivedRaw = balanceAfter - balanceBefore;
    if (receivedRaw <= BigInt(0)) {
      throw new Error(`Swap confirmed but WBTC balance did not increase: ${txHash}`);
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
}
