import { toDbDate } from "@/lib/dates";
import { mapPurchase, mapPurchases } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import type { CreatePurchaseInput, Purchase, UpdatePurchaseInput } from "@/types";

export async function findAllPurchases(): Promise<Purchase[]> {
  const records = await prisma.purchase.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return mapPurchases(records);
}

export async function findEarliestPurchaseDate(): Promise<string | null> {
  const record = await prisma.purchase.findFirst({
    orderBy: { date: "asc" },
  });

  return record ? mapPurchase(record).date : null;
}

export async function findPurchasesByDateRange(from: string, to: string): Promise<Purchase[]> {
  const records = await prisma.purchase.findMany({
    where: {
      date: {
        gte: new Date(`${from}T00:00:00.000Z`),
        lte: new Date(`${to}T23:59:59.999Z`),
      },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return mapPurchases(records);
}

export async function findPurchaseById(id: string): Promise<Purchase | null> {
  const record = await prisma.purchase.findUnique({ where: { id } });
  return record ? mapPurchase(record) : null;
}

export async function createPurchases(
  inputs: Array<CreatePurchaseInput & { date: string }>,
): Promise<number> {
  if (inputs.length === 0) {
    return 0;
  }

  const result = await prisma.purchase.createMany({
    data: inputs.map((input) => ({
      date: toDbDate(input.date),
      amountUsdt: input.amountUsdt,
      btcPrice: input.btcPrice,
      source: input.source,
      txHash: input.txHash ?? null,
      strategyId: input.strategyId ?? null,
    })),
  });

  return result.count;
}

export async function createPurchase(input: CreatePurchaseInput & { date: string }): Promise<Purchase> {
  const record = await prisma.purchase.create({
    data: {
      date: toDbDate(input.date),
      amountUsdt: input.amountUsdt,
      btcPrice: input.btcPrice,
      source: input.source,
      txHash: input.txHash ?? null,
      strategyId: input.strategyId ?? null,
    },
  });

  return mapPurchase(record);
}

export async function updatePurchase(
  id: string,
  input: UpdatePurchaseInput,
): Promise<Purchase | null> {
  const existing = await prisma.purchase.findUnique({ where: { id } });

  if (!existing) {
    return null;
  }

  const record = await prisma.purchase.update({
    where: { id },
    data: {
      date: input.date ? new Date(`${input.date}T00:00:00.000Z`) : undefined,
      amountUsdt: input.amountUsdt,
      btcPrice: input.btcPrice,
      source: input.source,
      txHash: input.txHash,
    },
  });

  return mapPurchase(record);
}

export async function deletePurchase(id: string): Promise<boolean> {
  try {
    await prisma.purchase.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
