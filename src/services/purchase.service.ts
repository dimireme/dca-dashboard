import { format } from "date-fns";
import {
  createPurchase as createPurchaseRecord,
  deletePurchase as deletePurchaseRecord,
  findAllPurchases,
  findPurchaseById,
  findPurchasesByDateRange,
  updatePurchase as updatePurchaseRecord,
} from "@/repositories/purchase.repository";
import type { CreatePurchaseInput, Purchase, UpdatePurchaseInput } from "@/types";

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
  const date = input.date ?? format(new Date(), "yyyy-MM-dd");

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
