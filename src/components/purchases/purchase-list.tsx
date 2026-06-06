'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBtc, formatUsdt } from '@/lib/format';
import type { Purchase } from '@/types';

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
}: PurchaseListProps) {
  if (purchases.length === 0) {
    return <p className="text-muted-foreground">No purchases on this day.</p>;
  }

  return (
    <div className="space-y-2">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="space-y-1 rounded-lg border p-2">
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {purchase.source === 'dca' ? 'DCA' : 'Manual'}
            </Badge>
            <span className="font-medium">
              {formatUsdt(purchase.amountUsdt)} ({formatBtc(purchase.btcAmount)})
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground">
              BTC price: {formatUsdt(purchase.btcPrice)}
            </p>
            {onEdit || onDelete ? (
              <div className="flex shrink-0 gap-1">
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
            ) : null}
          </div>
          {purchase.notes ? (
            <p className="text-muted-foreground">{purchase.notes}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
