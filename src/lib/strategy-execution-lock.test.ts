import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCK_STALE_MS,
  isExecutionClaimable,
  isLockStale,
} from "@/lib/strategy-execution-lock";

describe("strategy-execution-lock", () => {
  const now = new Date("2026-07-28T12:00:00.000Z");

  it("treats missing lockedAt as stale", () => {
    expect(isLockStale(null, now)).toBe(true);
    expect(isLockStale(undefined, now)).toBe(true);
  });

  it("treats fresh lock as not stale", () => {
    const lockedAt = new Date(now.getTime() - 60_000);
    expect(isLockStale(lockedAt, now)).toBe(false);
  });

  it("treats lock older than staleMs as stale", () => {
    const lockedAt = new Date(now.getTime() - DEFAULT_LOCK_STALE_MS);
    expect(isLockStale(lockedAt, now)).toBe(true);
  });

  it("allows claim when idle", () => {
    expect(isExecutionClaimable("idle", null, now)).toBe(true);
  });

  it("blocks claim while running with fresh lock", () => {
    const lockedAt = new Date(now.getTime() - 60_000);
    expect(isExecutionClaimable("running", lockedAt, now)).toBe(false);
  });

  it("allows reclaim when running lock is stale", () => {
    const lockedAt = new Date(now.getTime() - DEFAULT_LOCK_STALE_MS - 1);
    expect(isExecutionClaimable("running", lockedAt, now)).toBe(true);
  });
});
