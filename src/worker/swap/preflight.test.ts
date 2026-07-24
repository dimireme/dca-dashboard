import { describe, expect, it } from "vitest";
import {
  APPROVE_GAS_CEILING,
  SWAP_GAS_CEILING,
  estimateRequiredEthWei,
  formatInsufficientEthError,
  formatInsufficientUsdcError,
} from "@/worker/swap/preflight";

describe("estimateRequiredEthWei", () => {
  it("budgets swap + approve by default", () => {
    const gasPrice = BigInt(50_000);
    expect(estimateRequiredEthWei(gasPrice)).toBe(
      gasPrice * (SWAP_GAS_CEILING + APPROVE_GAS_CEILING),
    );
  });

  it("can exclude approve gas", () => {
    const gasPrice = BigInt(50_000);
    expect(estimateRequiredEthWei(gasPrice, { includeApprove: false })).toBe(
      gasPrice * SWAP_GAS_CEILING,
    );
  });
});

describe("insufficient fund messages", () => {
  it("formats USDC skip message", () => {
    expect(formatInsufficientUsdcError(BigInt(1_000_000), BigInt(10_000_000))).toContain(
      "skipping Odos",
    );
    expect(formatInsufficientUsdcError(BigInt(1_000_000), BigInt(10_000_000))).toContain(
      "1 USDC",
    );
  });

  it("formats ETH skip message", () => {
    const message = formatInsufficientEthError(
      BigInt("23520357248000"),
      BigInt("34000000000000"),
    );
    expect(message).toContain("skipping Odos");
    expect(message).toContain("Insufficient ETH");
  });
});
