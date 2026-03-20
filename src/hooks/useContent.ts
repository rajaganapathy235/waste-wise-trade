import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContent = () => {
  return useQuery({
    queryKey: ["platform-content"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("content")
        .select("*");
      
      if (error) throw error;
      
      // Transform to Map-like object
      return data?.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
    },
  });
};
