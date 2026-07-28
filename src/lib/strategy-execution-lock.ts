/** How long a `running` lock may stay before another worker may reclaim it. */
export const DEFAULT_LOCK_STALE_MS = 15 * 60 * 1000;

export function isLockStale(
  lockedAt: Date | null | undefined,
  now: Date,
  staleMs: number = DEFAULT_LOCK_STALE_MS,
): boolean {
  if (!lockedAt) {
    return true;
  }

  return now.getTime() - lockedAt.getTime() >= staleMs;
}

/** Claimable when idle, or when a running lock is older than staleMs. */
export function isExecutionClaimable(
  executionStatus: "idle" | "running",
  lockedAt: Date | null | undefined,
  now: Date,
  staleMs: number = DEFAULT_LOCK_STALE_MS,
): boolean {
  if (executionStatus === "idle") {
    return true;
  }

  return isLockStale(lockedAt, now, staleMs);
}
