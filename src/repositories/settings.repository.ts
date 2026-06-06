import { prisma } from "@/lib/prisma";
import { fromDbDate } from "@/lib/dates";
import type { Settings } from "@/types";

const SETTINGS_ID = "default";

export async function getSettings(): Promise<Settings | null> {
  const record = await prisma.settings.findUnique({
    where: { id: SETTINGS_ID },
  });

  if (!record) {
    return null;
  }

  return {
    id: record.id,
    dcaStartDate: fromDbDate(record.dcaStartDate),
    dailyAmount: record.dailyAmount,
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function upsertSettings(input: {
  dcaStartDate: string;
  dailyAmount: number;
}): Promise<Settings> {
  const record = await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      dcaStartDate: new Date(`${input.dcaStartDate}T00:00:00.000Z`),
      dailyAmount: input.dailyAmount,
    },
    update: {
      dcaStartDate: new Date(`${input.dcaStartDate}T00:00:00.000Z`),
      dailyAmount: input.dailyAmount,
    },
  });

  return {
    id: record.id,
    dcaStartDate: fromDbDate(record.dcaStartDate),
    dailyAmount: record.dailyAmount,
    updatedAt: record.updatedAt.toISOString(),
  };
}
