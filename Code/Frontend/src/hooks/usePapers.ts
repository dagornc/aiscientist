import { useQuery } from "@tanstack/react-query";
import { PaperApi } from "../api/client";
import type { Paper } from "../types";

export function usePapers() {
  return useQuery<Paper[], Error>({
    queryKey: ["papers"],
    queryFn: PaperApi.getAll,
  });
}

export function usePaperById(id: string) {
  return useQuery<Paper, Error>({
    queryKey: ["paper", id],
    queryFn: () => PaperApi.getById(id),
    enabled: !!id,
  });
}
