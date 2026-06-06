import { toDbDate } from "@/lib/dates";
import { mapPurchase, mapPurchases } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import type { CreatePurchaseInput, Purchase, UpdatePurchaseInput } from "@/types";

function calculateBtcAmount(amountUsdt: number, btcPrice: number): number {
  return amountUsdt / btcPrice;
}

export async function findAllPurchases(): Promise<Purchase[]> {
  const records = await prisma.purchase.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return mapPurchases(records);
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

export async function createPurchase(input: CreatePurchaseInput & { date: string }): Promise<Purchase> {
  const record = await prisma.purchase.create({
    data: {
      date: toDbDate(input.date),
      amountUsdt: input.amountUsdt,
      btcPrice: input.btcPrice,
      btcAmount: calculateBtcAmount(input.amountUsdt, input.btcPrice),
      source: input.source,
      notes: input.notes ?? null,
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

  const amountUsdt = input.amountUsdt ?? existing.amountUsdt;
  const btcPrice = input.btcPrice ?? existing.btcPrice;

  const record = await prisma.purchase.update({
    where: { id },
    data: {
      date: input.date ? new Date(`${input.date}T00:00:00.000Z`) : undefined,
      amountUsdt: input.amountUsdt,
      btcPrice: input.btcPrice,
      btcAmount:
        input.amountUsdt !== undefined || input.btcPrice !== undefined
          ? calculateBtcAmount(amountUsdt, btcPrice)
          : undefined,
      source: input.source,
      notes: input.notes,
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
