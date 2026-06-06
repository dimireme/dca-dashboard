"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBtc, formatUsdt } from "@/lib/format";
import type { Purchase } from "@/types";

type PurchaseListProps = {
  purchases: Purchase[];
  onEdit?: (purchase: Purchase) => void;
  onDelete?: (purchase: Purchase) => void;
  isDeleting?: boolean;
  compact?: boolean;
};

export function PurchaseList({
  purchases,
  onEdit,
  onDelete,
  isDeleting,
  compact = false,
}: PurchaseListProps) {
  if (purchases.length === 0) {
    return (
      <p className={compact ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground"}>
        No purchases on this day.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {purchases.map((purchase) => (
        <div
          key={purchase.id}
          className={compact ? "rounded-md border p-2" : "rounded-lg border p-3"}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={purchase.source === "dca" ? "default" : "secondary"}>
                  {purchase.source === "dca" ? "DCA" : "Manual"}
                </Badge>
                <span className={compact ? "text-xs font-medium" : "text-sm font-medium"}>
                  {formatUsdt(purchase.amountUsdt)}
                </span>
              </div>
              <p className={compact ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground"}>
                BTC price: {formatUsdt(purchase.btcPrice)}
              </p>
              <p className={compact ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground"}>
                {formatBtc(purchase.btcAmount)}
              </p>
              {purchase.notes ? (
                <p className={compact ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground"}>
                  {purchase.notes}
                </p>
              ) : null}
            </div>
            <div className="flex gap-1">
              {onEdit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(purchase)}
                >
                  <Pencil className="size-4" />
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(purchase)}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
