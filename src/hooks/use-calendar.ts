import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CalendarDay } from "@/types";

export function useCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ["calendar", year, month],
    queryFn: () =>
      apiClient.get<{ days: CalendarDay[] }>(`/api/calendar?year=${year}&month=${month}`),
    select: (data) => data.days,
    retry: false,
  });
}
