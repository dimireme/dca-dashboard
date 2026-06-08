import { format } from "date-fns";
import {
  buildPurchaseRangeRecords,
  calculateRangeBtcPrice,
} from "@/lib/purchase-range";
import {
  createPurchase as createPurchaseRecord,
  createPurchases,
  deletePurchase as deletePurchaseRecord,
  findAllPurchases,
  findPurchaseById,
  findPurchasesByDateRange,
  updatePurchase as updatePurchaseRecord,
} from "@/repositories/purchase.repository";
import type {
  CreatePurchaseInput,
  CreatePurchaseRangeInput,
  CreatePurchaseRangeResult,
  Purchase,
  UpdatePurchaseInput,
} from "@/types";

export async function listPurchases(from?: string, to?: string): Promise<Purchase[]> {
  if (from && to) {
    return findPurchasesByDateRange(from, to);
  }

  return findAllPurchases();
}

export async function getPurchase(id: string): Promise<Purchase | null> {
  return findPurchaseById(id);
}

export async function createPurchase(input: CreatePurchaseInput): Promise<Purchase> {
  const date = input.date?.trim() || format(new Date(), "yyyy-MM-dd");

  return createPurchaseRecord({
    ...input,
    date,
  });
}

export async function updatePurchase(
  id: string,
  input: UpdatePurchaseInput,
): Promise<Purchase | null> {
  return updatePurchaseRecord(id, input);
}

export async function deletePurchase(id: string): Promise<boolean> {
  return deletePurchaseRecord(id);
}

export async function createPurchaseRange(
  input: CreatePurchaseRangeInput,
): Promise<CreatePurchaseRangeResult> {
  const records = buildPurchaseRangeRecords(input);
  const created = await createPurchases(records);
  const btcPrice = calculateRangeBtcPrice(
    input.dayCount,
    input.amountUsdtPerDay,
    input.totalBtcAmount,
  );

  return {
    created,
    startDate: input.startDate,
    endDate: records[records.length - 1].date,
    btcPrice,
  };
}
