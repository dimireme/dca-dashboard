import { format } from "date-fns";
import { getMonthDateKeys } from "@/lib/dates";
import { findAllPurchases } from "@/repositories/purchase.repository";
import { getSettings } from "@/repositories/settings.repository";
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
  dcaStartDate: string,
  referenceDateKey: string,
  coveredDays: number,
  todayKey: string,
  purchasesByDate: Record<string, PurchaseRecord[]>,
): CalendarDay[] {
  return dateKeys.map((dateKey) => ({
    date: dateKey,
    status: getDayStatus(dateKey, dcaStartDate, referenceDateKey, coveredDays),
    isToday: dateKey === todayKey,
    purchases: purchasesByDate[dateKey] ?? [],
  }));
}

async function getCalendarContext(referenceDate = new Date()) {
  const settings = await getSettings();

  if (!settings) {
    return null;
  }

  const purchases = await findAllPurchases();
  const referenceDateKey = format(referenceDate, "yyyy-MM-dd");
  const totalInvested = calculateTotalInvested(purchases);
  const coveredDays = calculateCoveredDays(totalInvested, settings.dailyAmount);

  return {
    settings,
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
): Promise<{ days: CalendarDay[] } | null> {
  const context = await getCalendarContext(referenceDate);

  if (!context) {
    return null;
  }

  const days = buildCalendarDays(
    getMonthDateKeys(year, month),
    context.settings.dcaStartDate,
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
): Promise<CalendarYearData | null> {
  const context = await getCalendarContext(referenceDate);

  if (!context) {
    return null;
  }

  const months: CalendarMonthData[] = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;

    return {
      month,
      days: buildCalendarDays(
        getMonthDateKeys(year, month),
        context.settings.dcaStartDate,
        context.referenceDateKey,
        context.coveredDays,
        context.todayKey,
        context.purchasesByDate,
      ),
    };
  });

  return { months };
}
