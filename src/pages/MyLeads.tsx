import { useState } from "react";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { LeadType } from "@/lib/mockData";
import LeadCard from "@/components/LeadCard";
import { Button } from "@/components/ui/button";
import { Plus, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function MyLeads() {
  const { leads, user } = useApp();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LeadType | "All">("All");

  const myLeads = leads.slice(0, 4).filter((l) => activeTab === "All" || l.leadType === activeTab);

  const tabLabel = (tab: LeadType | "All") => {
    if (tab === "All") return t("home.all");
    if (tab === "Buy") return t("myLeads.iBuy");
    return t("myLeads.iSell");
  };

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">{t("myLeads.title")}</h1>
        <Button size="sm" onClick={() => navigate("/post-lead")} className="bg-primary">
          <Plus className="h-4 w-4 mr-1" /> {t("myLeads.postLead")}
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["All", "Buy", "Sell"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === tab
                ? tab === "Buy" ? "bg-primary text-primary-foreground" : tab === "Sell" ? "bg-emerald text-emerald-foreground" : "bg-foreground text-background"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {myLeads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {t("myLeads.noLeads")}
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {myLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
