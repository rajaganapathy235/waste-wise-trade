import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTransportRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ["transport-requests", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("transport_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useCreateTransportRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: any) => {
      const { data, error } = await supabase
        .from("transport_requests")
        .insert([request])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-requests"] });
    }
  });
}
