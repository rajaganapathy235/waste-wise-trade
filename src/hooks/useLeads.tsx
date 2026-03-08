import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface DbLead {
  id: string;
  lead_type: string;
  category: string;
  material_type: string;
  price_per_kg: number;
  quantity: number;
  specs: any;
  status: string;
  poster_name: string | null;
  poster_phone: string | null;
  poster_role: string | null;
  user_id: string;
  location_district: string | null;
  created_at: string;
  views: number | null;
  inquiries: number | null;
}

export function useLeads() {
  const [leads, setLeads] = useState<DbLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setLeads(data);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  return { leads, loading, refetch: fetchLeads };
}

export function useMyLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<DbLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLeads([]); setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setLeads(data);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return { leads, loading };
}

export function usePostLead() {
  const { user } = useAuth();

  const postLead = async (lead: {
    lead_type: string;
    category: string;
    material_type: string;
    price_per_kg: number;
    quantity: number;
    specs: any;
    poster_name: string | null;
    poster_phone: string | null;
    poster_role: string | null;
    location_district: string | null;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };
    const { error } = await supabase.from("leads").insert({
      ...lead,
      user_id: user.id,
    });
    if (error) toast.error("Failed to post lead");
    return { error };
  };

  return { postLead };
}
