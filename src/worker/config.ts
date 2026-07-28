export type WorkerConfig = {
  databaseUrl: string;
  arbitrumRpcUrl: string;
  walletPrivateKey: `0x${string}`;
  odosApiKey: string | null;
  pollIntervalMs: number;
  slippageLimitPercent: number;
  /** Reclaim `running` locks older than this (redeploy / crash). */
  lockStaleMs: number;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

function normalizePrivateKey(value: string): `0x${string}` {
  const key = value.startsWith("0x") ? value : `0x${value}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error("WALLET_PRIVATE_KEY must be a 32-byte hex private key");
  }
  return key as `0x${string}`;
}

export function loadWorkerConfig(): WorkerConfig {
  return {
    databaseUrl: requireEnv("DATABASE_URL"),
    arbitrumRpcUrl: requireEnv("ARBITRUM_RPC_URL"),
    walletPrivateKey: normalizePrivateKey(requireEnv("WALLET_PRIVATE_KEY")),
    odosApiKey: process.env.ODOS_API_KEY?.trim() || null,
    pollIntervalMs: Number(process.env.WORKER_POLL_INTERVAL_MS ?? 60_000),
    slippageLimitPercent: Number(process.env.SWAP_SLIPPAGE_PERCENT ?? 0.5),
    lockStaleMs: Number(process.env.WORKER_LOCK_STALE_MS ?? 15 * 60 * 1000),
  };
}
