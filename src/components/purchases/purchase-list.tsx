'use client';

import { useState } from 'react';
import { Check, Copy, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBtc, formatTxHash, formatUsdt } from '@/lib/format';
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
    <div className="space-y-3">
      {purchases.map((purchase) => (
        <div
          key={purchase.id}
          className="space-y-2 rounded-xl border-2 border-border/60 bg-card p-3 shadow-md ring-1 ring-foreground/5"
        >
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {purchase.source === 'dca' ? 'DCA' : 'Manual'}
            </Badge>
            <span className="font-medium">
              {formatUsdt(purchase.amountUsdt)} ({formatBtc(purchase.btcAmount)}
              )
            </span>
          </div>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-base leading-7 text-muted-foreground">
                BTC price: {formatUsdt(purchase.btcPrice)}
              </p>
              {purchase.txHash ? <TxHashRow hash={purchase.txHash} /> : null}
            </div>
            {onEdit || onDelete ? (
              <div className="flex shrink-0 items-end gap-1">
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
        </div>
      ))}
    </div>
  );
}

function TxHashRow({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; ignore.
    }
  }

  return (
    <div className="flex h-7 items-center gap-1 text-base leading-7 text-muted-foreground">
      <span title={hash}>tx: {formatTxHash(hash)}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy transaction hash'}
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
    </div>
  );
}
