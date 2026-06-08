import { z } from "zod";

export const createPurchaseSchema = z.object({
  amountUsdt: z.number().positive(),
  btcPrice: z.number().positive(),
  source: z.enum(["manual", "dca"]),
  date: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ),
  notes: z.string().optional(),
});

export const updatePurchaseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  amountUsdt: z.number().positive().optional(),
  btcPrice: z.number().positive().optional(),
  source: z.enum(["manual", "dca"]).optional(),
  notes: z.string().nullable().optional(),
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
  notes: z.string().optional(),
});

export const purchasesQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
