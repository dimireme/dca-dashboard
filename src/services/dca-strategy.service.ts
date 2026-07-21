import {
  resolveNextExecutionAtForCreate,
  resolveNextExecutionAtForUpdate,
} from "@/lib/dca-strategy-schedule";
import {
  createStrategyRecord,
  deleteStrategyRecord,
  findAllStrategies,
  findDueStrategies,
  findStrategyById,
  markStrategyExecutedRecord,
  updateStrategyRecord,
} from "@/repositories/dca-strategy.repository";
import { findPurchaseAmountsByStrategyIds } from "@/repositories/purchase.repository";
import type { CreateStrategyInput, DcaStrategy, UpdateStrategyInput } from "@/types";
import { buildStrategyTradeSummary } from "./dca.service";

export {
  resolveNextExecutionAtForCreate,
  resolveNextExecutionAtForUpdate,
} from "@/lib/dca-strategy-schedule";

export async function listStrategies(): Promise<DcaStrategy[]> {
  const strategies = await findAllStrategies();
  const purchases = await findPurchaseAmountsByStrategyIds(
    strategies.map((strategy) => strategy.id),
  );

  const purchasesByStrategy = new Map<
    string,
    Array<{ amountUsdt: number; btcPrice: number }>
  >();

  for (const purchase of purchases) {
    const list = purchasesByStrategy.get(purchase.strategyId) ?? [];
    list.push(purchase);
    purchasesByStrategy.set(purchase.strategyId, list);
  }

  return strategies.map((strategy) => ({
    ...strategy,
    summary: buildStrategyTradeSummary(
      purchasesByStrategy.get(strategy.id) ?? [],
    ),
  }));
}

export async function listDueStrategies(now = new Date()): Promise<DcaStrategy[]> {
  return findDueStrategies(now);
}

export async function getStrategy(id: string): Promise<DcaStrategy | null> {
  return findStrategyById(id);
}

export async function createStrategy(input: CreateStrategyInput): Promise<DcaStrategy> {
  const enabled = input.enabled ?? true;

  return createStrategyRecord(input, {
    enabled,
    nextExecutionAt: resolveNextExecutionAtForCreate(enabled),
  });
}

export async function updateStrategy(
  id: string,
  input: UpdateStrategyInput,
): Promise<DcaStrategy | null> {
  const existing = await findStrategyById(id);

  if (!existing) {
    return null;
  }

  const enabled = input.enabled ?? existing.enabled;
  const nextExecutionAt = resolveNextExecutionAtForUpdate(
    enabled,
    existing.nextExecutionAt,
    existing.enabled,
  );

  return updateStrategyRecord(id, input, {
    nextExecutionAt,
  });
}

export async function markStrategyExecuted(
  id: string,
  intervalHours: number,
  executedAt = new Date(),
): Promise<DcaStrategy | null> {
  const nextExecutionAt = new Date(executedAt.getTime() + intervalHours * 60 * 60 * 1000);
  return markStrategyExecutedRecord(id, executedAt, nextExecutionAt);
}

export async function deleteStrategy(id: string): Promise<boolean> {
  return deleteStrategyRecord(id);
}
