import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DbLedgerEntry {
  id: string;
  date: string;
  type: string;
  invoice_no: number | null;
  credit: number | null;
  debit: number | null;
  particular: string | null;
  party_id: string;
  user_id: string;
}

export function useLedger(partyId: string) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DbLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    if (!user || !partyId) { setEntries([]); setLoading(false); return; }
    const { data } = await supabase
      .from("ledger_entries")
      .select("*")
      .eq("party_id", partyId)
      .order("date", { ascending: false });
    if (data) setEntries(data);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, [user, partyId]);

  const addEntry = async (entry: Omit<DbLedgerEntry, "id" | "user_id">) => {
    if (!user) return { error: new Error("Not authenticated") };
    const { error } = await supabase.from("ledger_entries").insert({ ...entry, user_id: user.id });
    if (!error) fetchEntries();
    return { error };
  };

  return { entries, loading, addEntry, refetch: fetchEntries };
}
