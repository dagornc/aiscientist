import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PipelineApi } from "../api/client";
import type { PipelineRun } from "../types";

export function usePipelines() {
  return useQuery<PipelineRun[], Error>({
    queryKey: ["pipelines"],
    queryFn: async () => {
      // Backend doesn't have list endpoint yet — return empty
      return [];
    },
  });
}

export function usePipelineStatus(runId: string) {
  return useQuery<PipelineRun, Error>({
    queryKey: ["pipeline", runId],
    queryFn: () => PipelineApi.getStatus(runId),
    enabled: !!runId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "failed") return false;
      return 3000;
    },
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ domain, maxIterations }: { domain: string; maxIterations?: number }) =>
      PipelineApi.start(domain, maxIterations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });
}

export function useRunPipeline() {
  return useMutation({
    mutationFn: ({ domain, maxIterations }: { domain: string; maxIterations?: number }) =>
      PipelineApi.start(domain, maxIterations),
  });
}

export function usePipelineGraph() {
  return useQuery({
    queryKey: ["pipeline-graph"],
    queryFn: PipelineApi.getGraph,
  });
}
