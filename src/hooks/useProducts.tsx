import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface DbProduct {
  id: string;
  name: string;
  sale_price: number | null;
  purchase_price: number | null;
  stock: number | null;
  unit: string | null;
  hsn_code: string | null;
  gst_rate: number | null;
  category: string | null;
  user_id: string;
}

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    if (!user) { setProducts([]); setLoading(false); return; }
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [user]);

  const addProduct = async (product: Partial<DbProduct>) => {
    if (!user) return { error: new Error("Not authenticated") };
    const { error } = await supabase.from("products").insert({ ...product, user_id: user.id });
    if (!error) fetchProducts();
    return { error };
  };

  const updateProduct = async (id: string, updates: Partial<DbProduct>) => {
    const { error } = await supabase.from("products").update(updates).eq("id", id);
    if (!error) fetchProducts();
    return { error };
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
    return { error };
  };

  return { products, loading, addProduct, updateProduct, deleteProduct, refetch: fetchProducts };
}
