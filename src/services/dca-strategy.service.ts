import {
  resolveNextExecutionAtForCreate,
  resolveNextExecutionAtForUpdate,
} from "@/lib/dca-strategy-schedule";
import {
  createStrategyRecord,
  deleteStrategyRecord,
  findAllStrategies,
  findStrategyById,
  updateStrategyRecord,
} from "@/repositories/dca-strategy.repository";
import type { CreateStrategyInput, DcaStrategy, UpdateStrategyInput } from "@/types";

export {
  resolveNextExecutionAtForCreate,
  resolveNextExecutionAtForUpdate,
} from "@/lib/dca-strategy-schedule";

export async function listStrategies(): Promise<DcaStrategy[]> {
  return findAllStrategies();
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

export async function deleteStrategy(id: string): Promise<boolean> {
  return deleteStrategyRecord(id);
}
