import { z } from "zod";

export const createPurchaseSchema = z.object({
  amountUsdt: z.number().positive(),
  btcPrice: z.number().positive(),
  source: z.enum(["manual", "dca"]),
  date: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ),
  txHash: z.string().optional(),
});

export const updatePurchaseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  amountUsdt: z.number().positive().optional(),
  btcPrice: z.number().positive().optional(),
  source: z.enum(["manual", "dca"]).optional(),
  txHash: z.string().nullable().optional(),
});

export const calendarQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export const createPurchaseRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayCount: z.number().int().min(1).max(366),
  amountUsdtPerDay: z.number().positive(),
  totalBtcAmount: z.number().positive(),
});

export const purchasesQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const createStrategySchema = z.object({
  amountUsdc: z.number().positive(),
  intervalHours: z.number().int().min(1),
  enabled: z.boolean().optional(),
});

export const updateStrategySchema = z.object({
  amountUsdc: z.number().positive().optional(),
  intervalHours: z.number().int().min(1).optional(),
  enabled: z.boolean().optional(),
});
