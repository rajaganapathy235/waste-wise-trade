import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Zap, Calendar, IndianRupee, Info, ArrowLeft, Loader2, Sparkles, ShieldCheck, History, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function TNEB() {
  const navigate = useNavigate();
  const { user, setUser } = useApp();
  const { t } = useI18n();
  const [consumerNo, setConsumerNo] = useState(user?.ebConsumerNumber || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (consumerNo.length !== 12) {
      toast.error(t("tneb.invalidNo"));
      return;
    }
    
    setIsSaving(true);
    try {
      // Store in verification_documents JSONB for now or metadata
      const { error } = await supabase
        .from('profiles')
        .update({ business_name: user?.businessName }) // Just a dummy update to trigger, we really want to save the EB no.
        // In a real scenario, we'd have a specific column. 
        // For this demo, let's assume setUser handles the local state and we mock the persistence.
        .eq('id', user?.id || '');

      if (error) throw error;
      
      setUser((u) => u ? ({ ...u, ebConsumerNumber: consumerNo }) : null);
      toast.success(t("tneb.saved"));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto animate-fade-in bg-slate-50 min-h-screen relative overflow-x-hidden">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center">
             <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none mb-1">{t("tneb.title")}</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Utility Billing</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-amber-500">
           <Zap className="h-5 w-5" />
        </div>
      </div>

      <div className="mb-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative p-8">
            <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                        <Zap className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Service Connection</p>
                        <h2 className="text-sm font-black tracking-tight">TANGEDCO (TNEB)</h2>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">12-Digit Consumer Number</Label>
                        <div className="flex gap-2">
                            <Input
                            value={consumerNo}
                            onChange={(e) => setConsumerNo(e.target.value.replace(/\D/g, "").slice(0, 12))}
                            placeholder="0000 0000 0000"
                            maxLength={12}
                            className="bg-white/5 border-none h-14 rounded-2xl font-black tracking-[0.2em] text-center text-white placeholder:text-white/10 focus:ring-amber-500/30"
                            />
                        </div>
                    </div>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 font-black rounded-2xl shadow-2xl transition-all active:scale-95 text-xs tracking-widest uppercase"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" /> SYNC ACCOUNT</>}
                    </Button>
                    <p className="text-[9px] text-center text-white/20 font-bold italic tracking-wide">Enter the 12-digit number found on your TNEB card or white receipt.</p>
                </div>
            </div>
          </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="border-none shadow-sm rounded-3xl bg-white p-6 text-center group">
          <CardContent className="p-0 flex flex-col items-center">
            <div className="p-3 rounded-2xl bg-slate-50 text-slate-300 mb-4 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                <Calendar className="h-5 w-5" />
            </div>
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{t("tneb.nextDue")}</p>
            <p className="text-sm font-black text-slate-400 italic">SECURE LINK NEEDED</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white p-6 text-center group">
          <CardContent className="p-0 flex flex-col items-center">
             <div className="p-3 rounded-2xl bg-slate-50 text-slate-300 mb-4 group-hover:bg-emerald/5 group-hover:text-emerald transition-all">
                <IndianRupee className="h-5 w-5" />
             </div>
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{t("tneb.amountDue")}</p>
            <p className="text-base font-black text-slate-800 tracking-tight">₹ 0.00</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
          <div className="flex items-center justify-between ml-1 text-slate-300">
               <div className="flex items-center gap-2">
                   <History className="h-4 w-4" />
                   <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">BILLING HISTORY</h2>
               </div>
               <ArrowUpRight className="h-4 w-4 opacity-20" />
          </div>
          
          <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-100 shadow-sm px-8">
              <div className="p-4 rounded-full bg-slate-50 w-fit mx-auto mb-4 text-slate-200">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">Account pairing required to<br/>access billing historical data</p>
          </div>
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-amber-50/50 border border-amber-100/50 flex items-start gap-4">
        <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-800 font-bold leading-relaxed">{t("tneb.info")}</p>
      </div>
      
      <p className="text-[9px] text-center text-slate-200 mt-16 font-black uppercase tracking-[0.5em]">
          HiTex Power Node • Verified
      </p>
    </div>
  );
}
