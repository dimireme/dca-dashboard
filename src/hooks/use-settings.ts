import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Settings } from "@/types";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to load settings");
      }

      return response.json() as Promise<Settings | null>;
    },
    retry: false,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Pick<Settings, "dcaStartDate" | "dailyAmount">) =>
      apiClient.put<Settings>("/api/settings", input),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
