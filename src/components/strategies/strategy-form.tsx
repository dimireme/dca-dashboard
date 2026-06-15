'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type {
  CreateStrategyInput,
  DcaStrategy,
  UpdateStrategyInput,
} from '@/types';

type StrategyFormProps = {
  onSubmit: (input: CreateStrategyInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string | null;
};

type StrategyEditFormProps = {
  strategy: DcaStrategy;
  onSubmit: (input: UpdateStrategyInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string | null;
};

export function StrategyForm({
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: StrategyFormProps) {
  const [amountUsdc, setAmountUsdc] = useState('');
  const [intervalHours, setIntervalHours] = useState('');
  const [enabled, setEnabled] = useState(true);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const amount = Number(amountUsdc);
    const interval = Number(intervalHours);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isFinite(interval) ||
      !Number.isInteger(interval) ||
      interval < 1
    ) {
      return;
    }

    await onSubmit({
      amountUsdc: amount,
      intervalHours: interval,
      enabled,
    });

    setAmountUsdc('');
    setIntervalHours('');
    setEnabled(true);
  }

  return (
    <StrategyFormFields
      amountUsdc={amountUsdc}
      setAmountUsdc={setAmountUsdc}
      intervalHours={intervalHours}
      setIntervalHours={setIntervalHours}
      enabled={enabled}
      setEnabled={setEnabled}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel="Add strategy"
      error={error}
    />
  );
}

export function StrategyEditForm({
  strategy,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: StrategyEditFormProps) {
  const [amountUsdc, setAmountUsdc] = useState(strategy.amountUsdc.toString());
  const [intervalHours, setIntervalHours] = useState(
    strategy.intervalHours.toString(),
  );
  const [enabled, setEnabled] = useState(strategy.enabled);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const amount = Number(amountUsdc);
    const interval = Number(intervalHours);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isFinite(interval) ||
      !Number.isInteger(interval) ||
      interval < 1
    ) {
      return;
    }

    await onSubmit({
      amountUsdc: amount,
      intervalHours: interval,
      enabled,
    });
  }

  return (
    <StrategyFormFields
      amountUsdc={amountUsdc}
      setAmountUsdc={setAmountUsdc}
      intervalHours={intervalHours}
      setIntervalHours={setIntervalHours}
      enabled={enabled}
      setEnabled={setEnabled}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel="Save changes"
      error={error}
    />
  );
}

function StrategyFormFields({
  amountUsdc,
  setAmountUsdc,
  intervalHours,
  setIntervalHours,
  enabled,
  setEnabled,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  error,
}: {
  amountUsdc: string;
  setAmountUsdc: (value: string) => void;
  intervalHours: string;
  setIntervalHours: (value: string) => void;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  onSubmit: (event: React.FormEvent) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel: string;
  error?: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 min-[772px]:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="strategy-amount">Amount (USDC)</Label>
          <Input
            id="strategy-amount"
            type="number"
            min="0"
            step="0.01"
            value={amountUsdc}
            onChange={(event) => setAmountUsdc(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="strategy-interval">Interval (hours)</Label>
          <Input
            id="strategy-interval"
            type="number"
            min="1"
            step="1"
            value={intervalHours}
            onChange={(event) => setIntervalHours(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="strategy-enabled"
          checked={enabled}
          onCheckedChange={setEnabled}
          size="sm"
        />
        <Label htmlFor="strategy-enabled">Enabled</Label>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
