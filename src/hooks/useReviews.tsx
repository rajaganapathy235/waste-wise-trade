import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DbReview {
  id: string;
  reviewer_id: string;
  reviewer_name: string | null;
  reviewee_id: string;
  lead_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export function useReviews(revieweeId?: string) {
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (revieweeId) query = query.eq("reviewee_id", revieweeId);
    const { data } = await query;
    if (data) setReviews(data);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [revieweeId]);

  return { reviews, loading, refetch: fetchReviews };
}

export function usePostReview() {
  const { user } = useAuth();

  const postReview = async (review: {
    reviewee_id: string;
    lead_id: string | null;
    rating: number;
    comment: string;
    reviewer_name: string | null;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };
    const { error } = await supabase.from("reviews").insert({
      ...review,
      reviewer_id: user.id,
    });
    return { error };
  };

  return { postReview };
}
