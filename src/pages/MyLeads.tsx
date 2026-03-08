import { useState } from "react";
import { useApp } from "@/lib/appContext";
import LeadCard from "@/components/LeadCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyLeads() {
  const { leads } = useApp();
  const navigate = useNavigate();
  // Mock: show first 3 as "my leads"
  const myLeads = leads.slice(0, 3);

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">My Leads</h1>
        <Button size="sm" onClick={() => navigate("/post-lead")} className="bg-primary">
          <Plus className="h-4 w-4 mr-1" /> Post Lead
        </Button>
      </div>

      {myLeads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          You haven't posted any leads yet.
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
