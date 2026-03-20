import { useState } from "react";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { LeadType } from "@/lib/mockData";
import LeadCard from "@/components/LeadCard";
import { Button } from "@/components/ui/button";
import { Plus, Share2, Loader2, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMyLeads } from "@/hooks/useLeads";

export default function MyLeads() {
  const { user } = useApp();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LeadType | "All">("All");

  const { data: leads = [], isLoading } = useMyLeads(user.id);

  const filteredLeads = leads.filter((l) => activeTab === "All" || l.leadType === activeTab);

  const tabLabel = (tab: LeadType | "All") => {
    if (tab === "All") return t("home.all");
    if (tab === "Buy") return t("myLeads.iBuy");
    return t("myLeads.iSell");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/catalog/${user.id}`;
    if (navigator.share) {
      await navigator.share({ title: "My Catalog", url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Catalog link copied!");
    }
  };

  return (
    <div className="px-6 pt-8 pb-20 max-w-md mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black tracking-tight">{t("myLeads.title")}</h1>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleShare}
            className="text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl h-10 w-10"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button 
            onClick={() => navigate("/post-lead")} 
            className="bg-slate-900 hover:bg-black text-white font-black h-10 px-4 rounded-xl shadow-lg active:scale-95 transition-all text-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" /> POST LEAD
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
        {(["All", "Buy", "Sell"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all ${
              activeTab === tab
                ? tab === "Buy" ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : tab === "Sell" ? "bg-emerald text-white shadow-lg shadow-emerald/20" 
                  : "bg-slate-900 text-white shadow-lg"
                : "bg-white text-slate-400 border border-slate-100"
            }`}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          <p className="text-sm text-slate-400 font-medium">Checking your inventory...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] shadow-sm border border-dashed border-slate-200">
           <div className="p-5 rounded-full bg-slate-50 w-fit mx-auto mb-4">
            <Package className="h-10 w-10 text-slate-200" />
          </div>
          <p className="text-slate-400 font-bold mb-1">{t("myLeads.noLeads")}</p>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">Your marketplace activity will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="relative group">
               <LeadCard lead={lead} />
               <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge className="bg-white/80 backdrop-blur-sm text-slate-500 border-slate-100 text-[9px] font-bold">MANAGE</Badge>
               </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-12 p-6 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-primary text-white text-center shadow-xl shadow-primary/10">
         <h3 className="font-black text-lg mb-1 italic">Want more visibility?</h3>
         <p className="text-xs text-white/70 mb-5 font-medium">Verified traders get 5x more enquiries on their leads.</p>
         <Button 
           variant="secondary" 
           size="sm" 
           className="bg-white text-primary font-black rounded-xl px-6 h-10 hover:bg-slate-50 active:scale-95 transition-all text-[11px] tracking-widest uppercase"
           onClick={() => navigate("/profile")}
         >
           GET VERIFIED
         </Button>
      </div>
    </div>
  );
}
