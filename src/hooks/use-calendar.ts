import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CalendarDay, CalendarYearData } from "@/types";

export function useCalendarMonth(year: number, month: number) {
  return useQuery({
    queryKey: ["calendar", year, month],
    queryFn: () =>
      apiClient.get<{ days: CalendarDay[] }>(`/api/calendar?year=${year}&month=${month}`),
    select: (data) => data.days,
    retry: false,
  });
}

export function useCalendarYear(year: number) {
  return useQuery({
    queryKey: ["calendar", year],
    queryFn: () => apiClient.get<CalendarYearData>(`/api/calendar?year=${year}`),
    retry: false,
  });
}
