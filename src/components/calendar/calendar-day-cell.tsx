'use client';

import { useState } from 'react';
import { Bot, Hand } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DayDetailPopoverContent } from '@/components/calendar/day-detail-popover';
import { cn } from '@/lib/utils';
import type { CalendarDay } from '@/types';

type CalendarDayCellProps = {
  day: CalendarDay;
};

export function CalendarDayCell({ day }: CalendarDayCellProps) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const dayNumber = Number(day.date.split('-')[2]);
  const hasManual = day.purchases.some(
    (purchase) => purchase.source === 'manual',
  );
  const hasDca = day.purchases.some((purchase) => purchase.source === 'dca');

  return (
    <Popover
      open={pinned || open}
      onOpenChange={(nextOpen) => {
        if (!pinned) {
          setOpen(nextOpen);
        }
      }}
    >
      <PopoverTrigger
        openOnHover={!pinned}
        delay={150}
        closeDelay={200}
        nativeButton
        className={cn(
          'relative flex aspect-square w-full min-w-0 flex-col justify-between rounded-sm border p-0.5 transition-colors hover:opacity-90',
          day.status === 'covered' &&
            'border-emerald-300/80 bg-emerald-50 dark:bg-emerald-950/40',
          day.status === 'missed' &&
            'border-rose-300/80 bg-rose-50 dark:bg-rose-950/40',
          day.status === 'neutral' && 'border-transparent bg-muted/30',
          day.isToday && 'ring-1 ring-primary ring-offset-1',
        )}
      >
        <span className="self-start font-medium leading-none text-muted-foreground">
          {dayNumber}
        </span>
        {hasManual || hasDca ? (
          <div className="flex w-full items-end justify-between">
            {hasManual ? (
              <Hand
                className="size-5 text-amber-600"
                aria-label="Manual purchase"
              />
            ) : (
              <span className="size-5 shrink-0" />
            )}
            {hasDca ? (
              <Bot className="size-5 text-blue-600" aria-label="DCA purchase" />
            ) : (
              <span className="size-5 shrink-0" />
            )}
          </div>
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        side="top"
        sideOffset={8}
        align="center"
        initialFocus={false}
        onMouseEnter={() => setOpen(true)}
      >
        <DayDetailPopoverContent
          day={day}
          onInteractiveChange={setPinned}
        />
      </PopoverContent>
    </Popover>
  );
}
