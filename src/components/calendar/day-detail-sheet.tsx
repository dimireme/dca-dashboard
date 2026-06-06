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
import type { CalendarDay, Purchase } from "@/types";

type DayDetailSheetProps = {
  day: CalendarDay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DayDetailSheet({ day, open, onOpenChange }: DayDetailSheetProps) {
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [showForm, setShowForm] = useState(false);
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();
  const deletePurchase = useDeletePurchase();

  if (!day) {
    return null;
  }

  async function handleCreate(input: Parameters<typeof createPurchase.mutateAsync>[0]) {
    await createPurchase.mutateAsync(input);
    setShowForm(false);
  }

  async function handleUpdate(input: Parameters<typeof updatePurchase.mutateAsync>[0]["input"]) {
    if (!editingPurchase) {
      return;
    }

    await updatePurchase.mutateAsync({ id: editingPurchase.id, input });
    setEditingPurchase(null);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
          <PurchaseList
            purchases={day.purchases}
            onEdit={(purchase) => {
              setEditingPurchase(purchase);
              setShowForm(false);
            }}
            onDelete={async (purchase) => {
              await deletePurchase.mutateAsync(purchase.id);
            }}
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
                onCancel={() => setShowForm(false)}
                isSubmitting={createPurchase.isPending}
              />
            </div>
          ) : (
            !editingPurchase && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Add purchase for this day
              </button>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
