import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DbTransportRequest {
  id: string;
  lead_id: string | null;
  material_type: string | null;
  quantity: number | null;
  from_district: string | null;
  to_district: string | null;
  requested_date: string | null;
  vehicle_type: string | null;
  status: string;
  estimated_cost: number | null;
  provider_name: string | null;
  provider_phone: string | null;
  user_id: string;
  created_at: string;
}

export function useTransport() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DbTransportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) { setRequests([]); setLoading(false); return; }
    const { data } = await supabase
      .from("transport_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [user]);

  const addRequest = async (req: Partial<DbTransportRequest>) => {
    if (!user) return { error: new Error("Not authenticated") };
    const { error } = await supabase.from("transport_requests").insert({ ...req, user_id: user.id });
    if (!error) fetchRequests();
    return { error };
  };

  return { requests, loading, addRequest, refetch: fetchRequests };
}
