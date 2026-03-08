import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DbBill {
  id: string;
  bill_no: number;
  bill_type: string;
  date: string;
  party_id: string | null;
  items: any;
  subtotal: number | null;
  tax_amount: number | null;
  total: number | null;
  notes: string | null;
  user_id: string;
  created_at: string;
}

export function useBills() {
  const { user } = useAuth();
  const [bills, setBills] = useState<DbBill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    if (!user) { setBills([]); setLoading(false); return; }
    const { data } = await supabase
      .from("bills")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setBills(data);
    setLoading(false);
  };

  useEffect(() => { fetchBills(); }, [user]);

  const addBill = async (bill: Omit<DbBill, "id" | "user_id" | "created_at">) => {
    if (!user) return { error: new Error("Not authenticated"), data: null };
    const { data, error } = await supabase
      .from("bills")
      .insert({ ...bill, user_id: user.id })
      .select()
      .single();
    if (!error) fetchBills();
    return { error, data };
  };

  const getNextBillNo = (billType: string) => {
    const typeBills = bills.filter(b => b.bill_type === billType);
    if (typeBills.length === 0) return 1;
    return Math.max(...typeBills.map(b => b.bill_no)) + 1;
  };

  return { bills, loading, addBill, getNextBillNo, refetch: fetchBills };
}
