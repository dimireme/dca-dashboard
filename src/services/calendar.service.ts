import { format } from "date-fns";
import { DAILY_AMOUNT_USD } from "@/lib/dca-config";
import { getMonthDateKeys } from "@/lib/dates";
import { findAllPurchases, findEarliestPurchaseDate } from "@/repositories/purchase.repository";
import type { CalendarDay, CalendarMonthData, CalendarYearData } from "@/types";
import { calculateCoveredDays, calculateTotalInvested, getDayStatus } from "./dca.service";

type PurchaseRecord = Awaited<ReturnType<typeof findAllPurchases>>[number];

function buildPurchasesByDate(purchases: PurchaseRecord[]): Record<string, PurchaseRecord[]> {
  return purchases.reduce<Record<string, PurchaseRecord[]>>((acc, purchase) => {
    if (!acc[purchase.date]) {
      acc[purchase.date] = [];
    }
    acc[purchase.date].push(purchase);
    return acc;
  }, {});
}

function buildCalendarDays(
  dateKeys: string[],
  dcaStartDate: string | null,
  referenceDateKey: string,
  coveredDays: number,
  todayKey: string,
  purchasesByDate: Record<string, PurchaseRecord[]>,
): CalendarDay[] {
  return dateKeys.map((dateKey) => ({
    date: dateKey,
    status:
      dcaStartDate === null
        ? "neutral"
        : getDayStatus(dateKey, dcaStartDate, referenceDateKey, coveredDays),
    isToday: dateKey === todayKey,
    purchases: purchasesByDate[dateKey] ?? [],
  }));
}

async function getCalendarContext(referenceDate = new Date()) {
  const [purchases, dcaStartDate] = await Promise.all([
    findAllPurchases(),
    findEarliestPurchaseDate(),
  ]);
  const referenceDateKey = format(referenceDate, "yyyy-MM-dd");
  const totalInvested = calculateTotalInvested(purchases);
  const coveredDays = calculateCoveredDays(totalInvested, DAILY_AMOUNT_USD);

  return {
    dcaStartDate,
    referenceDateKey,
    todayKey: referenceDateKey,
    coveredDays,
    purchasesByDate: buildPurchasesByDate(purchases),
  };
}

export async function getCalendarMonth(
  year: number,
  month: number,
  referenceDate = new Date(),
): Promise<{ days: CalendarDay[] }> {
  const context = await getCalendarContext(referenceDate);

  const days = buildCalendarDays(
    getMonthDateKeys(year, month),
    context.dcaStartDate,
    context.referenceDateKey,
    context.coveredDays,
    context.todayKey,
    context.purchasesByDate,
  );

  return { days };
}

export async function getCalendarYear(
  year: number,
  referenceDate = new Date(),
): Promise<CalendarYearData> {
  const context = await getCalendarContext(referenceDate);

  const months: CalendarMonthData[] = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;

    return {
      month,
      days: buildCalendarDays(
        getMonthDateKeys(year, month),
        context.dcaStartDate,
        context.referenceDateKey,
        context.coveredDays,
        context.todayKey,
        context.purchasesByDate,
      ),
    };
  });

  return { months };
}
