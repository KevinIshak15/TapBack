import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertReview } from "@shared/routes";

export function useGenerateReview() {
  return useMutation({
    mutationFn: async (data: {
      businessId: number;
      tags: string[];
      experienceType: string;
      customText?: string;
    }) => {
      const res = await fetch(api.reviews.generateAI.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 429) throw new Error("Please wait a moment before regenerating.");
      if (!res.ok) throw new Error("Failed to generate review");
      return api.reviews.generateAI.responses[200].parse(await res.json());
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertReview) => {
      const res = await fetch(api.reviews.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save review");
      return api.reviews.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [api.businesses.listReviews.path, variables.businessId],
      });
    },
  });
}
