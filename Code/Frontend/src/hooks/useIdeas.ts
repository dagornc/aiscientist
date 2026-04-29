import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IdeaApi } from "../api/client";
import type { Idea } from "../types";

export function useIdeas() {
  return useQuery<Idea[], Error>({
    queryKey: ["ideas"],
    queryFn: IdeaApi.getAll,
  });
}

export function useIdeaById(id: string) {
  return useQuery<Idea, Error>({
    queryKey: ["idea", id],
    queryFn: () => IdeaApi.getById(id),
    enabled: !!id,
  });
}

export function useGenerateIdeas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ domain, count }: { domain: string; count: number }) =>
      IdeaApi.generate(domain, count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });
}
