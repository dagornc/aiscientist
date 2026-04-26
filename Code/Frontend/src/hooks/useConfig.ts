import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppSettings } from "../types";
import { ConfigApi } from "../api/client";

export function useConfig() {
  return useQuery<AppSettings, Error>({
    queryKey: ["config"],
    queryFn: ConfigApi.get,
  });
}

export function useSaveConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: AppSettings) => ConfigApi.save(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
}
