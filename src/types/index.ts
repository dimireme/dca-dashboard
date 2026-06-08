export type PurchaseSource = "manual" | "dca";

export interface Purchase {
  id: string;
  date: string;
  amountUsdt: number;
  btcPrice: number;
  btcAmount: number;
  source: PurchaseSource;
  notes: string | null;
  createdAt: string;
}

export type DayStatus = "neutral" | "covered" | "missed";

export interface CalendarDay {
  date: string;
  status: DayStatus;
  isToday: boolean;
  purchases: Purchase[];
}

export interface CalendarMonthData {
  month: number;
  days: CalendarDay[];
}

export interface CalendarYearData {
  months: CalendarMonthData[];
}

export interface DashboardMetrics {
  totalInvested: number;
  totalBtc: number;
  averagePrice: number | null;
  dcaStartDate: string | null;
  dailyAmount: number;
  coveredDays: number;
  expectedDays: number;
  daysBehind: number;
  daysAhead: number;
  amountBehind: number;
  amountAhead: number;
}

export interface CreatePurchaseInput {
  date?: string;
  amountUsdt: number;
  btcPrice: number;
  source: PurchaseSource;
  notes?: string;
}

export interface UpdatePurchaseInput {
  date?: string;
  amountUsdt?: number;
  btcPrice?: number;
  source?: PurchaseSource;
  notes?: string | null;
}

export interface CreatePurchaseRangeInput {
  startDate: string;
  dayCount: number;
  amountUsdtPerDay: number;
  totalBtcAmount: number;
  notes?: string;
}

export interface CreatePurchaseRangeResult {
  created: number;
  startDate: string;
  endDate: string;
  btcPrice: number;
}
