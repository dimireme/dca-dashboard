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
          'relative flex aspect-square w-full min-w-0 flex-col justify-between rounded-sm p-1 transition-colors hover:opacity-90',
          day.isToday && 'bg-calendar-today',
          !day.isToday && day.status === 'covered' && 'bg-calendar-covered',
          !day.isToday && day.status === 'missed' && 'bg-calendar-missed',
          !day.isToday && day.status === 'neutral' && 'bg-muted/30',
        )}
      >
        <span className="self-start font-medium leading-none text-muted-foreground">
          {dayNumber}
        </span>
        {hasManual || hasDca ? (
          <div className="flex w-full items-end justify-between">
            {hasManual ? (
              <Hand
                className="size-5 text-icon-manual"
                aria-label="Manual purchase"
              />
            ) : (
              <span className="size-5 shrink-0" />
            )}
            {hasDca ? (
              <Bot className="size-5 text-icon-dca" aria-label="DCA purchase" />
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
