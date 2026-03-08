import { useState } from "react";
import { useApp } from "@/lib/appContext";
import { LeadType } from "@/lib/mockData";
import LeadCard from "@/components/LeadCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyLeads() {
  const { leads, user } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LeadType | "All">("All");

  // In real app, filter by user.id. Mock: show first 4
  const myLeads = leads.slice(0, 4).filter((l) => activeTab === "All" || l.leadType === activeTab);

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">My Leads</h1>
        <Button size="sm" onClick={() => navigate("/post-lead")} className="bg-primary">
          <Plus className="h-4 w-4 mr-1" /> Post Lead
        </Button>
      </div>

      {/* Buy / Sell tabs */}
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
            {tab === "All" ? "All" : tab === "Buy" ? "🛒 I Buy" : "🏷️ I Sell"}
          </button>
        ))}
      </div>

      {myLeads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No leads found. Post your first lead!
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
