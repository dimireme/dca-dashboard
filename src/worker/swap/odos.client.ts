import type { Address, Hex } from "viem";
import {
  ARBITRUM_CHAIN_ID,
  USDC_ADDRESS,
  WBTC_ADDRESS,
} from "@/worker/swap/tokens";

const PUBLIC_API_BASE = "https://api.odos.xyz";
const ENTERPRISE_API_BASE = "https://enterprise-api.odos.xyz";

export type OdosQuote = {
  pathId: string;
  outAmounts: string[];
};

export type OdosAssembledTransaction = {
  to: Address;
  data: Hex;
  value: string;
  gas: number;
  chainId: number;
};

export type OdosAssembleResult = {
  transaction: OdosAssembledTransaction;
  outputTokens?: Array<{ tokenAddress: string; amount: string }>;
};

export class OdosClient {
  private readonly baseUrl: string;
  private readonly apiKey: string | null;

  constructor(apiKey: string | null = null) {
    this.apiKey = apiKey;
    this.baseUrl = apiKey ? ENTERPRISE_API_BASE : PUBLIC_API_BASE;
  }

  async quote(params: {
    userAddr: Address;
    amountBaseUnits: bigint;
    slippageLimitPercent: number;
  }): Promise<OdosQuote> {
    const body = {
      chainId: ARBITRUM_CHAIN_ID,
      inputTokens: [
        {
          tokenAddress: USDC_ADDRESS,
          amount: params.amountBaseUnits.toString(),
        },
      ],
      outputTokens: [
        {
          tokenAddress: WBTC_ADDRESS,
          proportion: 1,
        },
      ],
      userAddr: params.userAddr,
      slippageLimitPercent: params.slippageLimitPercent,
      compact: true,
    };

    const data = await this.post<OdosQuote & { detail?: string; error?: string }>(
      "/sor/quote/v3",
      body,
    );

    if (!data.pathId || !data.outAmounts?.[0]) {
      throw new Error(
        `Odos quote failed: ${data.detail ?? data.error ?? JSON.stringify(data)}`,
      );
    }

    return {
      pathId: data.pathId,
      outAmounts: data.outAmounts,
    };
  }

  async assemble(params: {
    userAddr: Address;
    pathId: string;
    /** Default false — simulate only after USDC allowance is set */
    simulate?: boolean;
  }): Promise<OdosAssembleResult> {
    const simulate = params.simulate ?? false;

    const data = await this.post<
      OdosAssembleResult & { detail?: string; error?: string; simulation?: { isSuccess?: boolean } }
    >("/sor/assemble", {
      userAddr: params.userAddr,
      pathId: params.pathId,
      simulate,
    });

    if (!data.transaction?.to || !data.transaction?.data) {
      throw new Error(
        `Odos assemble failed: ${data.detail ?? data.error ?? JSON.stringify(data)}`,
      );
    }

    if (simulate && data.simulation && data.simulation.isSuccess === false) {
      throw new Error(`Odos simulation failed: ${JSON.stringify(data.simulation)}`);
    }

    return {
      transaction: {
        to: data.transaction.to,
        data: data.transaction.data,
        value: data.transaction.value ?? "0",
        gas: data.transaction.gas,
        chainId: data.transaction.chainId,
      },
      outputTokens: data.outputTokens,
    };
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let json: unknown;

    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Odos ${path} returned non-JSON (${response.status}): ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
      throw new Error(`Odos ${path} HTTP ${response.status}: ${text.slice(0, 500)}`);
    }

    return json as T;
  }
}
