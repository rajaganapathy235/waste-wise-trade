import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DbParty {
  id: string;
  name: string;
  initials: string | null;
  gstin: string | null;
  location: string | null;
  bill_count: number | null;
  phone: string | null;
  type: string;
  user_id: string;
}

export function useParties() {
  const { user } = useAuth();
  const [parties, setParties] = useState<DbParty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParties = async () => {
    if (!user) { setParties([]); setLoading(false); return; }
    const { data } = await supabase
      .from("parties")
      .select("*")
      .eq("user_id", user.id)
      .order("name");
    if (data) setParties(data);
    setLoading(false);
  };

  useEffect(() => { fetchParties(); }, [user]);

  const addParty = async (party: Omit<DbParty, "id" | "user_id">) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("parties")
      .insert({ ...party, user_id: user.id })
      .select()
      .single();
    if (!error && data) {
      setParties(prev => [...prev, data]);
    }
    return data;
  };

  return { parties, loading, refetch: fetchParties, addParty };
}
