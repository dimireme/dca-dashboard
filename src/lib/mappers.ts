import type { DcaStrategy as PrismaDcaStrategy, Purchase as PrismaPurchase } from "@/generated/prisma/client";
import { fromDbDate } from "@/lib/dates";
import type {
  DcaStrategy,
  Purchase,
  PurchaseSource,
  StrategyTradeSummary,
} from "@/types";

export function emptyStrategySummary(): StrategyTradeSummary {
  return {
    purchaseCount: 0,
    totalInvested: 0,
    averagePrice: null,
  };
}

export function mapPurchase(record: PrismaPurchase): Purchase {
  return {
    id: record.id,
    date: fromDbDate(record.date),
    amountUsdt: record.amountUsdt,
    btcPrice: record.btcPrice,
    btcAmount: record.amountUsdt / record.btcPrice,
    source: record.source as PurchaseSource,
    txHash: record.txHash,
    createdAt: record.createdAt.toISOString(),
  };
}

export function mapPurchases(records: PrismaPurchase[]): Purchase[] {
  return records.map(mapPurchase);
}

export function mapStrategy(record: PrismaDcaStrategy): DcaStrategy {
  return {
    id: record.id,
    enabled: record.enabled,
    amountUsdc: record.amountUsdc,
    intervalHours: record.intervalHours,
    lastExecutionAt: record.lastExecutionAt?.toISOString() ?? null,
    nextExecutionAt: record.nextExecutionAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    summary: emptyStrategySummary(),
  };
}

export function mapStrategies(records: PrismaDcaStrategy[]): DcaStrategy[] {
  return records.map(mapStrategy);
}
