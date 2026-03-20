import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, Plus, Edit2, Trash2, 
  CheckCircle2, XCircle, IndianRupee, 
  Settings2, Zap, Crown, Package,
  ArrowUpRight, ShieldCheck, Sparkles,
  BarChart3, RefreshCw, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function SubscriptionManager() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("subscription_plans")
        .select("*")
        .order("price", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const togglePlanActive = async (id: string, current: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("subscription_plans")
        .update({ is_active: !current })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Node ${!current ? 'activated' : 'deactivated'}`);
      fetchPlans();
    } catch (error: any) {
      toast.error("Protocol violation: Update locked");
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Monetization Mesh</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Subscription Tiers • Revenue Protocols</p>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 font-black text-[10px] tracking-widest uppercase shadow-sm" onClick={fetchPlans}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> REFRESH CACHE
            </Button>
            <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-black text-[10px] tracking-widest uppercase shadow-xl shadow-primary/20 active:scale-95 transition-all">
                <Plus className="h-4 w-4 mr-2" /> CREATE TIER
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse border-none shadow-xl rounded-[3rem] bg-white h-96" />
          ))
        ) : plans.length > 0 ? (
          plans.map((p) => {
            const isPro = p.name.toLowerCase().includes('pro');
            return (
              <Card key={p.id} className={`border-none shadow-2xl rounded-[3.5rem] bg-white relative overflow-hidden transition-all duration-500 hover:-translate-y-2 group ${!p.is_active ? "opacity-60 grayscale" : ""}`}>
                {isPro && (
                  <div className="absolute top-8 right-8 z-20">
                    <Badge className="bg-amber-500 text-white font-black text-[8px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl shadow-amber-500/20 tracking-widest">
                      <Crown className="h-3 w-3" /> BEST VALUE
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="p-10 pb-6 relative">
                  <div className={`h-16 w-16 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 duration-500 ${isPro ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"}`}>
                    {isPro ? <Zap className="h-8 w-8" /> : <Package className="h-8 w-8" />}
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-4">{p.name}</CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter italic">₹{p.price.toLocaleString()}</span>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">/ {p.interval} cycle</span>
                  </div>
                </CardHeader>

                <CardContent className="px-10 pb-10">
                  <div className="h-[1px] w-full bg-slate-50 mb-8" />
                  <ul className="space-y-5">
                    {p.features?.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-4 group/item">
                        <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-colors">
                            <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <span className="text-xs font-bold text-slate-600 tracking-tight leading-relaxed">{f}</span>
                      </li>
                    ))}
                    {(!p.features || p.features.length === 0) && (
                      <li className="text-xs text-slate-300 italic font-medium">No system privileges defined for this tier.</li>
                    )}
                  </ul>
                </CardContent>

                <CardFooter className="p-10 pt-0 flex gap-3">
                  <Button variant="outline" className="h-12 flex-1 rounded-2xl text-[9px] font-black uppercase tracking-widest border-slate-100 hover:bg-slate-50 transition-all">
                    <Edit2 className="h-3.5 w-3.5 mr-2 text-slate-300" /> MODIFY
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`h-12 flex-1 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${p.is_active ? "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"}`}
                    onClick={() => togglePlanActive(p.id, p.is_active)}
                  >
                    {p.is_active ? <XCircle className="h-3.5 w-3.5 mr-2" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-2" />}
                    {p.is_active ? "SUSPEND" : "RESTORE"}
                  </Button>
                </CardFooter>
                
                {isPro && (
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-amber-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                )}
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-100 shadow-sm px-10">
            <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Package className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase mb-2">No active billing tiers</h3>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">Initialize your first monetization node to begin<br/>platform revenue generation.</p>
          </div>
        )}
      </div>

      <div className="mt-20 p-12 bg-slate-900 rounded-[4rem] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
              <BarChart3 className="h-64 w-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-md">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                         <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Revenue Integrity</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter leading-tight mb-4 tracking-tighter uppercase italic">Secure Ledger Sync</h2>
                  <p className="text-sm font-medium text-white/50 leading-relaxed mb-8">All subscription plans are synchronized with the Razorpay API. Modifications here will propagate to the payment gateway in real-time.</p>
                  <Button className="h-14 px-10 rounded-2xl bg-white text-slate-900 font-black text-[10px] tracking-widest uppercase hover:bg-slate-100 shadow-2xl transition-all active:scale-95">
                      RUN SYSTEM AUDIT <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 backdrop-blur-md">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Churn Rate</p>
                      <p className="text-2xl font-black text-emerald italic">1.2%</p>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 backdrop-blur-md">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">AVP</p>
                      <p className="text-2xl font-black text-primary italic">₹12.4K</p>
                  </div>
              </div>
          </div>
      </div>
      
      <p className="text-[9px] text-center text-slate-200 mt-16 font-black uppercase tracking-[0.5em]">
          HiTex Monetization Core • Ver 8.2
      </p>
    </div>
  );
}
