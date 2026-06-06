'use client';

import { useEffect, useState } from 'react';
import { PopoverHeader, PopoverTitle } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  PurchaseEditForm,
  PurchaseForm,
} from '@/components/purchases/purchase-form';
import { PurchaseList } from '@/components/purchases/purchase-list';
import {
  useCreatePurchase,
  useDeletePurchase,
  useUpdatePurchase,
} from '@/hooks/use-purchases';
import { formatDate } from '@/lib/format';
import type {
  CalendarDay,
  CreatePurchaseInput,
  Purchase,
  UpdatePurchaseInput,
} from '@/types';

type DayDetailPopoverContentProps = {
  day: CalendarDay;
  onInteractiveChange?: (interactive: boolean) => void;
};

export function DayDetailPopoverContent({
  day,
  onInteractiveChange,
}: DayDetailPopoverContentProps) {
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();
  const deletePurchase = useDeletePurchase();

  const isInteractive = showForm || editingPurchase !== null;

  useEffect(() => {
    onInteractiveChange?.(isInteractive);
  }, [isInteractive, onInteractiveChange]);

  async function handleCreate(input: CreatePurchaseInput) {
    setError(null);

    try {
      await createPurchase.mutateAsync(input);
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create purchase',
      );
    }
  }

  async function handleUpdate(input: UpdatePurchaseInput) {
    if (!editingPurchase) {
      return;
    }

    setError(null);

    try {
      await updatePurchase.mutateAsync({ id: editingPurchase.id, input });
      setEditingPurchase(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update purchase',
      );
    }
  }

  async function handleDelete(purchase: Purchase) {
    setError(null);

    try {
      await deletePurchase.mutateAsync(purchase.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete purchase',
      );
    }
  }

  return (
    <div className="max-h-[min(30rem,var(--available-height))] space-y-3 overflow-y-auto">
      <PopoverHeader>
        <PopoverTitle>{formatDate(day.date)}</PopoverTitle>
      </PopoverHeader>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {editingPurchase ? (
        <PurchaseEditForm
          purchase={editingPurchase}
          onSubmit={handleUpdate}
          onCancel={() => setEditingPurchase(null)}
          isSubmitting={updatePurchase.isPending}
        />
      ) : showForm ? (
        <PurchaseForm
          key={day.date}
          initialDate={day.date}
          onSubmit={handleCreate}
          onCancel={() => {
            setShowForm(false);
            setError(null);
          }}
          isSubmitting={createPurchase.isPending}
        />
      ) : (
        <>
          <PurchaseList
            purchases={day.purchases}
            onEdit={(purchase) => {
              setEditingPurchase(purchase);
              setShowForm(false);
              setError(null);
            }}
            onDelete={handleDelete}
            isDeleting={deletePurchase.isPending}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setShowForm(true);
              setError(null);
            }}
          >
            Add purchase
          </Button>
        </>
      )}
    </div>
  );
}
