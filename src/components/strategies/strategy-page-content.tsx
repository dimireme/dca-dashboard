'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  StrategyEditForm,
  StrategyForm,
} from '@/components/strategies/strategy-form';
import { StrategyList } from '@/components/strategies/strategy-list';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCreateStrategy,
  useDeleteStrategy,
  useStrategies,
  useUpdateStrategy,
} from '@/hooks/use-strategies';
import type {
  CreateStrategyInput,
  DcaStrategy,
  UpdateStrategyInput,
} from '@/types';

export function StrategyPageContent() {
  const [editingStrategy, setEditingStrategy] = useState<DcaStrategy | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const strategiesQuery = useStrategies();
  const createStrategy = useCreateStrategy();
  const updateStrategy = useUpdateStrategy();
  const deleteStrategy = useDeleteStrategy();

  async function handleCreate(input: CreateStrategyInput) {
    setError(null);

    try {
      await createStrategy.mutateAsync(input);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create strategy',
      );
    }
  }

  async function handleUpdate(input: UpdateStrategyInput) {
    if (!editingStrategy) {
      return;
    }

    setError(null);

    try {
      await updateStrategy.mutateAsync({ id: editingStrategy.id, input });
      setEditingStrategy(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update strategy',
      );
    }
  }

  async function handleDelete(strategy: DcaStrategy) {
    const confirmed = window.confirm(
      `Delete strategy ${strategy.amountUsdc} USDC every ${strategy.intervalHours}h?`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await deleteStrategy.mutateAsync(strategy.id);

      if (editingStrategy?.id === strategy.id) {
        setEditingStrategy(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete strategy',
      );
    }
  }

  async function handleToggleEnabled(strategy: DcaStrategy, enabled: boolean) {
    setError(null);
    setTogglingId(strategy.id);

    try {
      await updateStrategy.mutateAsync({
        id: strategy.id,
        input: { enabled },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update strategy',
      );
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">DCA Strategies</h1>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Calendar
        </Link>
      </div>

      {editingStrategy ? null : (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">New strategy</h2>
          <StrategyForm
            onSubmit={handleCreate}
            isSubmitting={createStrategy.isPending}
            error={error}
          />
        </section>
      )}

      {editingStrategy ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Edit strategy</h2>
          <StrategyEditForm
            strategy={editingStrategy}
            onSubmit={handleUpdate}
            onCancel={() => setEditingStrategy(null)}
            isSubmitting={updateStrategy.isPending}
            error={error}
          />
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Your strategies</h2>
        {strategiesQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : strategiesQuery.isError ? (
          <p className="text-sm text-destructive">Failed to load strategies.</p>
        ) : (
          <StrategyList
            strategies={strategiesQuery.data ?? []}
            onEdit={setEditingStrategy}
            onDelete={handleDelete}
            onToggleEnabled={handleToggleEnabled}
            isDeleting={deleteStrategy.isPending}
            togglingId={togglingId}
          />
        )}
        {!editingStrategy && error && strategiesQuery.data?.length ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </section>
    </div>
  );
}
