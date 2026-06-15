import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateStrategyInput, DcaStrategy, UpdateStrategyInput } from "@/types";

export function useStrategies() {
  return useQuery({
    queryKey: ["strategies"],
    queryFn: () =>
      apiClient.get<{ strategies: DcaStrategy[] }>("/api/strategies"),
    select: (data) => data.strategies,
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStrategyInput) =>
      apiClient.post<DcaStrategy>("/api/strategies", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStrategyInput }) =>
      apiClient.put<DcaStrategy>(`/api/strategies/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ success: boolean }>(`/api/strategies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
}
