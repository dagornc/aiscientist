import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewApi } from "../api/client";
import type { Review } from "../types";

export function useReviews() {
  return useQuery<Review[], Error>({
    queryKey: ["reviews"],
    queryFn: ReviewApi.getAll,
  });
}

export function useReviewById(id: string) {
  return useQuery<Review, Error>({
    queryKey: ["review", id],
    queryFn: () => ReviewApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paperId, numReflections, temperature }: { paperId: string; numReflections?: number; temperature?: number }) =>
      ReviewApi.review(paperId, numReflections, temperature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
