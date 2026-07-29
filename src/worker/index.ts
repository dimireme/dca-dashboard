import "dotenv/config";

import { loadWorkerConfig } from "@/worker/config";
import { StrategyScheduler } from "@/worker/scheduler";

async function main() {
  const config = loadWorkerConfig();
  const scheduler = new StrategyScheduler(config);

  console.log(`[worker] Started (wallet=${scheduler.walletAddress})`);
  console.log(`[worker] Poll interval: ${config.pollIntervalMs}ms`);
  console.log(`[worker] KyberSwap client-id: ${config.kyberClientId}`);

  const runTick = async () => {
    try {
      await scheduler.tick();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[worker] Tick failed: ${message}`);
    }
  };

  await runTick();

  const timer = setInterval(runTick, config.pollIntervalMs);

  const shutdown = (signal: string) => {
    console.log(`[worker] Received ${signal}, shutting down`);
    clearInterval(timer);
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[worker] Fatal: ${message}`);
  process.exit(1);
});
