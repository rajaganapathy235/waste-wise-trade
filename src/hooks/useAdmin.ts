import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: userCount },
        { count: leadCount },
        { data: transactions },
        { count: subCount }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("transactions").select("amount"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_subscribed", true)
      ]);

      const totalRevenue = transactions?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;

      return {
        users: userCount || 0,
        leads: leadCount || 0,
        revenue: totalRevenue,
        subscriptions: subCount || 0
      };
    }
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string, status: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ verification_status: status })
        .eq("id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    }
  });
}

export function useAdminLeads() {
  return useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string, status: string }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", leadId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  });
}
