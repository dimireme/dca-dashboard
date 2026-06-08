"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateRangeBtcPrice } from "@/lib/purchase-range";
import { formatNumber } from "@/lib/format";
import { generateDateRange } from "@/lib/dates";
import type { CreatePurchaseRangeInput } from "@/types";

type PurchaseRangeFormProps = {
  startDate: string;
  onSubmit: (input: CreatePurchaseRangeInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string | null;
};

function formatShortDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function PurchaseRangeForm({
  startDate,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: PurchaseRangeFormProps) {
  const [dayCount, setDayCount] = useState("");
  const [amountUsdtPerDay, setAmountUsdtPerDay] = useState("");
  const [totalBtcAmount, setTotalBtcAmount] = useState("");
  const [notes, setNotes] = useState("");

  const preview = useMemo(() => {
    const days = Number(dayCount);
    const amount = Number(amountUsdtPerDay);
    const totalBtc = Number(totalBtcAmount);

    if (
      !Number.isFinite(days) ||
      days < 1 ||
      !Number.isInteger(days) ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isFinite(totalBtc) ||
      totalBtc <= 0
    ) {
      return null;
    }

    const dates = generateDateRange(startDate, days);
    const btcPrice = calculateRangeBtcPrice(days, amount, totalBtc);
    const endDate = dates[dates.length - 1];

    return {
      days,
      startLabel: formatShortDate(startDate),
      endLabel: formatShortDate(endDate),
      btcPrice,
    };
  }, [startDate, dayCount, amountUsdtPerDay, totalBtcAmount]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const days = Number(dayCount);
    const amount = Number(amountUsdtPerDay);
    const totalBtc = Number(totalBtcAmount);

    if (
      !Number.isFinite(days) ||
      days < 1 ||
      !Number.isInteger(days) ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isFinite(totalBtc) ||
      totalBtc <= 0
    ) {
      return;
    }

    await onSubmit({
      startDate,
      dayCount: days,
      amountUsdtPerDay: amount,
      totalBtcAmount: totalBtc,
      notes: notes || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">DCA range import</p>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">DCA bot</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="range-start-date">Start date</Label>
        <Input
          id="range-start-date"
          type="date"
          value={startDate}
          readOnly
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="range-day-count">Days</Label>
        <Input
          id="range-day-count"
          type="number"
          min="1"
          max="366"
          step="1"
          value={dayCount}
          onChange={(event) => setDayCount(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="range-amount">Amount per day (USDT)</Label>
        <Input
          id="range-amount"
          type="number"
          min="0"
          step="0.01"
          value={amountUsdtPerDay}
          onChange={(event) => setAmountUsdtPerDay(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="range-total-btc">Total BTC purchased</Label>
        <Input
          id="range-total-btc"
          type="number"
          min="0"
          step="0.0000000001"
          value={totalBtcAmount}
          onChange={(event) => setTotalBtcAmount(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="range-notes">Notes</Label>
        <Input
          id="range-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional"
        />
      </div>

      {preview ? (
        <p className="text-xs text-muted-foreground">
          Will create {preview.days} purchases from {preview.startLabel} to{" "}
          {preview.endLabel}, ~${formatNumber(preview.btcPrice, 0)}/BTC
        </p>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          Add range
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
