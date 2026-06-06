import { format } from "date-fns";
import { getMonthDateKeys } from "@/lib/dates";
import { findAllPurchases } from "@/repositories/purchase.repository";
import { getSettings } from "@/repositories/settings.repository";
import type { CalendarDay } from "@/types";
import { calculateCoveredDays, calculateTotalInvested, getDayStatus } from "./dca.service";

export async function getCalendarMonth(
  year: number,
  month: number,
  referenceDate = new Date(),
): Promise<{ days: CalendarDay[] } | null> {
  const settings = await getSettings();

  if (!settings) {
    return null;
  }

  const purchases = await findAllPurchases();
  const referenceDateKey = format(referenceDate, "yyyy-MM-dd");
  const todayKey = referenceDateKey;
  const totalInvested = calculateTotalInvested(purchases);
  const coveredDays = calculateCoveredDays(totalInvested, settings.dailyAmount);

  const purchasesByDate = purchases.reduce<Record<string, typeof purchases>>((acc, purchase) => {
    if (!acc[purchase.date]) {
      acc[purchase.date] = [];
    }
    acc[purchase.date].push(purchase);
    return acc;
  }, {});

  const days = getMonthDateKeys(year, month).map((dateKey) => ({
    date: dateKey,
    status: getDayStatus(dateKey, settings.dcaStartDate, referenceDateKey, coveredDays),
    isToday: dateKey === todayKey,
    purchases: purchasesByDate[dateKey] ?? [],
  }));

  return { days };
}
