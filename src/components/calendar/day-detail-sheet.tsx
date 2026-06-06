"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PurchaseEditForm, PurchaseForm } from "@/components/purchases/purchase-form";
import { PurchaseList } from "@/components/purchases/purchase-list";
import {
  useCreatePurchase,
  useDeletePurchase,
  useUpdatePurchase,
} from "@/hooks/use-purchases";
import { formatDate } from "@/lib/format";
import type { CalendarDay, CreatePurchaseInput, Purchase, UpdatePurchaseInput } from "@/types";

type DayDetailSheetProps = {
  day: CalendarDay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DayDetailSheet({ day, open, onOpenChange }: DayDetailSheetProps) {
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();
  const deletePurchase = useDeletePurchase();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setShowForm(false);
      setEditingPurchase(null);
      setError(null);
    }

    onOpenChange(nextOpen);
  }

  async function handleCreate(input: CreatePurchaseInput) {
    setError(null);

    try {
      await createPurchase.mutateAsync(input);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create purchase");
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
      setError(err instanceof Error ? err.message : "Failed to update purchase");
    }
  }

  async function handleDelete(purchase: Purchase) {
    setError(null);

    try {
      await deletePurchase.mutateAsync(purchase.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete purchase");
    }
  }

  return (
    <Sheet open={open && Boolean(day)} onOpenChange={handleOpenChange}>
      {day ? (
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{formatDate(day.date)}</SheetTitle>
            <SheetDescription>
              {day.status === "covered"
                ? "This day is covered by your DCA progress."
                : day.status === "missed"
                  ? "This day is behind your DCA schedule."
                  : "This day is outside the active schedule window."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-4 pb-4">
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

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

            {editingPurchase ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Edit purchase</h3>
                <PurchaseEditForm
                  purchase={editingPurchase}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditingPurchase(null)}
                  isSubmitting={updatePurchase.isPending}
                />
              </div>
            ) : null}

            {showForm ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Add purchase</h3>
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
              </div>
            ) : (
              !editingPurchase && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(true);
                    setError(null);
                  }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Add purchase for this day
                </button>
              )
            )}
          </div>
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
