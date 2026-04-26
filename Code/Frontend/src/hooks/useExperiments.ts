import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExperimentApi } from "../api/client";
import type { Experiment } from "../types";

export function useExperiments() {
  return useQuery<Experiment[], Error>({
    queryKey: ["experiments"],
    queryFn: ExperimentApi.getAll,
  });
}

export function useExperimentById(id: string) {
  return useQuery<Experiment, Error>({
    queryKey: ["experiment", id],
    queryFn: () => ExperimentApi.getById(id),
    enabled: !!id,
  });
}

export function useRunExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ideaId, timeout }: { ideaId: string; timeout?: number }) =>
      ExperimentApi.run(ideaId, timeout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] });
    },
  });
}
