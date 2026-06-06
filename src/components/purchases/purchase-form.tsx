"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreatePurchaseInput, Purchase, PurchaseSource, UpdatePurchaseInput } from "@/types";

type PurchaseFormProps = {
  initialDate?: string;
  onSubmit: (input: CreatePurchaseInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

type PurchaseEditFormProps = {
  purchase: Purchase;
  onSubmit: (input: UpdatePurchaseInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

export function PurchaseForm({
  initialDate,
  onSubmit,
  onCancel,
  isSubmitting,
}: PurchaseFormProps) {
  const [date, setDate] = useState(initialDate ?? "");
  const [amountUsdt, setAmountUsdt] = useState("");
  const [btcPrice, setBtcPrice] = useState("");
  const [source, setSource] = useState<PurchaseSource>("manual");
  const [notes, setNotes] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const amount = Number(amountUsdt);
    const price = Number(btcPrice);
    const effectiveDate = initialDate ?? date;

    if (
      !effectiveDate ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return;
    }

    await onSubmit({
      date: effectiveDate,
      amountUsdt: amount,
      btcPrice: price,
      source,
      notes: notes || undefined,
    });
  }

  return (
    <PurchaseFormFields
      date={date}
      setDate={setDate}
      amountUsdt={amountUsdt}
      setAmountUsdt={setAmountUsdt}
      btcPrice={btcPrice}
      setBtcPrice={setBtcPrice}
      source={source}
      setSource={setSource}
      notes={notes}
      setNotes={setNotes}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel="Add purchase"
      lockDate={Boolean(initialDate)}
    />
  );
}

export function PurchaseEditForm({
  purchase,
  onSubmit,
  onCancel,
  isSubmitting,
}: PurchaseEditFormProps) {
  const [date, setDate] = useState(purchase.date);
  const [amountUsdt, setAmountUsdt] = useState(purchase.amountUsdt.toString());
  const [btcPrice, setBtcPrice] = useState(purchase.btcPrice.toString());
  const [source, setSource] = useState<PurchaseSource>(purchase.source);
  const [notes, setNotes] = useState(purchase.notes ?? "");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await onSubmit({
      date,
      amountUsdt: Number(amountUsdt),
      btcPrice: Number(btcPrice),
      source,
      notes: notes || undefined,
    });
  }

  return (
    <PurchaseFormFields
      date={date}
      setDate={setDate}
      amountUsdt={amountUsdt}
      setAmountUsdt={setAmountUsdt}
      btcPrice={btcPrice}
      setBtcPrice={setBtcPrice}
      source={source}
      setSource={setSource}
      notes={notes}
      setNotes={setNotes}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel="Save changes"
    />
  );
}

function PurchaseFormFields({
  date,
  setDate,
  amountUsdt,
  setAmountUsdt,
  btcPrice,
  setBtcPrice,
  source,
  setSource,
  notes,
  setNotes,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  lockDate = false,
  error,
}: {
  date: string;
  setDate: (value: string) => void;
  amountUsdt: string;
  setAmountUsdt: (value: string) => void;
  btcPrice: string;
  setBtcPrice: (value: string) => void;
  source: PurchaseSource;
  setSource: (value: PurchaseSource) => void;
  notes: string;
  setNotes: (value: string) => void;
  onSubmit: (event: React.FormEvent) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel: string;
  lockDate?: boolean;
  error?: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="purchase-date">Date</Label>
        <Input
          id="purchase-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          readOnly={lockDate}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchase-amount">Amount (USDT)</Label>
        <Input
          id="purchase-amount"
          type="number"
          min="0"
          step="0.01"
          value={amountUsdt}
          onChange={(event) => setAmountUsdt(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchase-price">BTC price (USD)</Label>
        <Input
          id="purchase-price"
          type="number"
          min="0"
          step="0.01"
          value={btcPrice}
          onChange={(event) => setBtcPrice(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchase-source">Source</Label>
        <select
          id="purchase-source"
          value={source}
          onChange={(event) => setSource(event.target.value as PurchaseSource)}
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="manual">Manual</option>
          <option value="dca">DCA bot</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchase-notes">Notes</Label>
        <Input
          id="purchase-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional"
        />
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
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
