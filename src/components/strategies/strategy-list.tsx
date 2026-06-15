'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatDateTime, formatStrategySummary } from '@/lib/format';
import type { DcaStrategy } from '@/types';

type StrategyListProps = {
  strategies: DcaStrategy[];
  onEdit?: (strategy: DcaStrategy) => void;
  onDelete?: (strategy: DcaStrategy) => void;
  onToggleEnabled?: (strategy: DcaStrategy, enabled: boolean) => void;
  isDeleting?: boolean;
  togglingId?: string | null;
};

export function StrategyList({
  strategies,
  onEdit,
  onDelete,
  onToggleEnabled,
  isDeleting,
  togglingId,
}: StrategyListProps) {
  if (strategies.length === 0) {
    return <p className="text-muted-foreground">No strategies yet.</p>;
  }

  return (
    <div className="space-y-3">
      {strategies.map((strategy) => (
        <div
          key={strategy.id}
          className="space-y-2 rounded-xl border-2 border-border/60 bg-card p-3 shadow-md ring-1 ring-foreground/5"
        >
          <div className="flex items-center gap-2">
            <Badge>{strategy.enabled ? 'Active' : 'Paused'}</Badge>
            <span className="font-medium">
              {formatStrategySummary(
                strategy.amountUsdc,
                strategy.intervalHours,
              )}
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Last run: {formatDateTime(strategy.lastExecutionAt)}</p>
              <p>Next run: {formatDateTime(strategy.nextExecutionAt)}</p>
              {onToggleEnabled ? (
                <div className="flex items-center gap-2 pt-1">
                  <Switch
                    id={`strategy-enabled-${strategy.id}`}
                    checked={strategy.enabled}
                    disabled={togglingId === strategy.id}
                    onCheckedChange={(enabled) =>
                      onToggleEnabled(strategy, enabled)
                    }
                    size="sm"
                  />
                  <Label htmlFor={`strategy-enabled-${strategy.id}`}>
                    Enabled
                  </Label>
                </div>
              ) : null}
            </div>

            {onEdit || onDelete ? (
              <div className="flex shrink-0 gap-1">
                {onEdit ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(strategy)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(strategy)}
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
