import { mapStrategies, mapStrategy } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import type { CreateStrategyInput, DcaStrategy, UpdateStrategyInput } from "@/types";

type StrategyScheduleFields = {
  enabled: boolean;
  nextExecutionAt: Date | null;
};

export async function findAllStrategies(): Promise<DcaStrategy[]> {
  const records = await prisma.dcaStrategy.findMany({
    orderBy: [{ createdAt: "asc" }],
  });

  return mapStrategies(records);
}

export async function findDueStrategies(now = new Date()): Promise<DcaStrategy[]> {
  const records = await prisma.dcaStrategy.findMany({
    where: {
      enabled: true,
      nextExecutionAt: { lte: now },
    },
    orderBy: [{ nextExecutionAt: "asc" }],
  });

  return mapStrategies(records);
}

export async function markStrategyExecutedRecord(
  id: string,
  lastExecutionAt: Date,
  nextExecutionAt: Date,
): Promise<DcaStrategy | null> {
  try {
    const record = await prisma.dcaStrategy.update({
      where: { id },
      data: {
        lastExecutionAt,
        nextExecutionAt,
      },
    });

    return mapStrategy(record);
  } catch {
    return null;
  }
}

export async function findStrategyById(id: string): Promise<DcaStrategy | null> {
  const record = await prisma.dcaStrategy.findUnique({ where: { id } });
  return record ? mapStrategy(record) : null;
}

export async function createStrategyRecord(
  input: CreateStrategyInput,
  schedule: StrategyScheduleFields,
): Promise<DcaStrategy> {
  const record = await prisma.dcaStrategy.create({
    data: {
      amountUsdc: input.amountUsdc,
      intervalHours: input.intervalHours,
      enabled: schedule.enabled,
      nextExecutionAt: schedule.nextExecutionAt,
    },
  });

  return mapStrategy(record);
}

export async function updateStrategyRecord(
  id: string,
  input: UpdateStrategyInput,
  schedule?: Partial<StrategyScheduleFields>,
): Promise<DcaStrategy | null> {
  try {
    const record = await prisma.dcaStrategy.update({
      where: { id },
      data: {
        amountUsdc: input.amountUsdc,
        intervalHours: input.intervalHours,
        enabled: input.enabled,
        nextExecutionAt: schedule?.nextExecutionAt,
      },
    });

    return mapStrategy(record);
  } catch {
    return null;
  }
}

export async function deleteStrategyRecord(id: string): Promise<boolean> {
  try {
    await prisma.dcaStrategy.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
