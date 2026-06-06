import type { Purchase as PrismaPurchase } from "@/generated/prisma/client";
import { fromDbDate } from "@/lib/dates";
import type { Purchase, PurchaseSource } from "@/types";

export function mapPurchase(record: PrismaPurchase): Purchase {
  return {
    id: record.id,
    date: fromDbDate(record.date),
    amountUsdt: record.amountUsdt,
    btcPrice: record.btcPrice,
    btcAmount: record.btcAmount,
    source: record.source as PurchaseSource,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
  };
}

export function mapPurchases(records: PrismaPurchase[]): Purchase[] {
  return records.map(mapPurchase);
}
