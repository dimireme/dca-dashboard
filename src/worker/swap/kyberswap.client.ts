import type { Address, Hex } from "viem";
import { USDC_ADDRESS, WBTC_ADDRESS } from "@/worker/swap/tokens";

const API_BASE = "https://aggregator-api.kyberswap.com";
const CHAIN = "arbitrum";

/** Opaque route payload — must be passed back to /route/build unchanged. */
export type KyberRouteSummary = Record<string, unknown>;

export type KyberRoute = {
  routeSummary: KyberRouteSummary;
  routerAddress: Address;
  amountOut: string;
};

export type KyberBuiltTransaction = {
  to: Address;
  data: Hex;
  value: string;
  gas?: number;
};

type KyberApiResponse<T> = {
  code: number;
  message?: string;
  data?: T;
  requestId?: string;
};

/**
 * KyberSwap Aggregator V1: GET /routes → POST /route/build.
 * Slippage is in bps (10 = 0.1%); we convert from percent (0.5 → 50).
 */
export class KyberSwapClient {
  private readonly clientId: string;

  constructor(clientId = "dca-dashboard") {
    this.clientId = clientId;
  }

  async getRoute(params: {
    amountBaseUnits: bigint;
    /** User wallet — better rates / exclusive pools */
    origin: Address;
  }): Promise<KyberRoute> {
    const query = new URLSearchParams({
      tokenIn: USDC_ADDRESS,
      tokenOut: WBTC_ADDRESS,
      amountIn: params.amountBaseUnits.toString(),
      origin: params.origin,
    });

    const body = await this.request<{
      routeSummary: KyberRouteSummary;
      routerAddress: string;
    }>("GET", `/${CHAIN}/api/v1/routes?${query}`);

    const { routeSummary, routerAddress } = body;
    const amountOut =
      typeof routeSummary.amountOut === "string" ? routeSummary.amountOut : null;

    if (!routeSummary || !routerAddress || !amountOut) {
      throw new Error(
        `KyberSwap route incomplete: ${JSON.stringify({ routerAddress, amountOut })}`,
      );
    }

    return {
      routeSummary,
      routerAddress: routerAddress as Address,
      amountOut,
    };
  }

  async buildRoute(params: {
    routeSummary: KyberRouteSummary;
    sender: Address;
    recipient: Address;
    slippageLimitPercent: number;
  }): Promise<KyberBuiltTransaction> {
    const slippageTolerance = Math.round(params.slippageLimitPercent * 100);

    if (slippageTolerance < 0 || slippageTolerance > 2000) {
      throw new Error(
        `KyberSwap slippageTolerance out of range [0, 2000] bps: ${slippageTolerance}`,
      );
    }

    const body = await this.request<{
      data: string;
      routerAddress: string;
      transactionValue: string;
      gas?: string;
    }>("POST", `/${CHAIN}/api/v1/route/build`, {
      routeSummary: params.routeSummary,
      sender: params.sender,
      recipient: params.recipient,
      slippageTolerance,
      source: this.clientId,
    });

    if (!body.data || !body.routerAddress) {
      throw new Error(`KyberSwap build incomplete: ${JSON.stringify(body)}`);
    }

    return {
      to: body.routerAddress as Address,
      data: body.data as Hex,
      value: body.transactionValue ?? "0",
      gas: body.gas ? Number(body.gas) : undefined,
    };
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    jsonBody?: unknown,
  ): Promise<T> {
    const headers: Record<string, string> = {
      "x-client-id": this.clientId,
      Accept: "application/json",
    };

    if (jsonBody !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined,
    });

    const text = await response.text();
    let parsed: KyberApiResponse<T>;

    try {
      parsed = text ? (JSON.parse(text) as KyberApiResponse<T>) : { code: -1 };
    } catch {
      throw new Error(
        `KyberSwap ${path} returned non-JSON (${response.status}): ${text.slice(0, 200)}`,
      );
    }

    if (!response.ok) {
      throw new Error(
        `KyberSwap ${path} HTTP ${response.status}: ${text.slice(0, 500)}`,
      );
    }

    if (parsed.code !== 0 || !parsed.data) {
      throw new Error(
        `KyberSwap ${path} failed (code=${parsed.code}): ${parsed.message ?? text.slice(0, 500)}`,
      );
    }

    return parsed.data;
  }
}
