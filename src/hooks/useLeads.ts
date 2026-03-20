import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/lib/mockData";

export function useLeads(filters: { 
  category?: string | "All"; 
  type?: string | "All";
  search?: string;
}) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.category && filters.category !== "All") {
        query = query.eq("category", filters.category);
      }

      if (filters.type && filters.type !== "All") {
        query = query.eq("lead_type", filters.type);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map DB fields to Lead type
      return (data || []).map((l: any): Lead => ({
        id: l.id,
        posterId: l.user_id, // Map user_id to posterId
        posterName: l.poster_name,
        materialType: l.material_type,
        category: l.category as any,
        leadType: l.lead_type as any,
        quantity: l.quantity,
        pricePerKg: l.price_per_kg,
        locationDistrict: l.location_district,
        description: l.description,
        createdAt: l.created_at,
        status: l.status as any,
        images: l.images || [],
        specs: l.specs || {},
      }));
    },
  });
}

export function useMyLeads(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-leads", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((l: any): Lead => ({
        id: l.id,
        posterId: l.user_id,
        posterName: l.poster_name,
        materialType: l.material_type,
        category: l.category as any,
        leadType: l.lead_type as any,
        quantity: l.quantity,
        pricePerKg: l.price_per_kg,
        locationDistrict: l.location_district,
        description: l.description,
        createdAt: l.created_at,
        status: l.status as any,
        images: l.images || [],
        specs: l.specs || {},
      }));
    },
    enabled: !!userId,
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        posterId: data.user_id,
        posterName: data.poster_name,
        posterPhone: data.poster_phone,
        materialType: data.material_type,
        category: data.category as any,
        leadType: data.lead_type as any,
        quantity: data.quantity,
        pricePerKg: data.price_per_kg,
        locationDistrict: data.location_district,
        description: data.description,
        createdAt: data.created_at,
        status: data.status as any,
        images: data.images || [],
        specs: data.specs || {},
      } as Lead;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: Omit<Lead, "id" | "createdAt" | "status" | "posterName" | "posterId"> & { userId: string, posterName: string }) => {
      const { data, error } = await supabase
        .from("leads")
        .insert([{
          user_id: lead.userId,
          poster_name: lead.posterName,
          material_type: lead.materialType,
          category: lead.category,
          lead_type: lead.leadType,
          quantity: lead.quantity,
          price_per_kg: lead.pricePerKg,
          location_district: lead.locationDistrict,
          description: lead.description,
          images: lead.images,
          specs: lead.specs,
          status: "Active"
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["my-leads"] });
    }
  });
}
