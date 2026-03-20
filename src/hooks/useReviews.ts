import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useReviews(userId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("reviewee_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      reviewer_id: string;
      reviewer_name: string;
      reviewee_id: string;
      lead_id?: string;
      rating: number;
      comment: string;
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert([review])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.reviewee_id] });
      queryClient.invalidateQueries({ queryKey: ["profile", variables.reviewee_id] });
    }
  });
}
