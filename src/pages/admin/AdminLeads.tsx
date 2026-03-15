import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Eye, Search, Ban, CheckCircle } from "lucide-react";

interface Lead {
  id: string;
  lead_type: string;
  category: string;
  material_type: string;
  price_per_kg: number;
  quantity: number;
  status: string;
  poster_name: string | null;
  location_district: string | null;
  views: number;
  inquiries: number;
  created_at: string;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Active" | "Closed" | "Flagged">("all");

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads((data as Lead[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) toast.error("Failed to delete"); else { toast.success("Lead removed"); fetchData(); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) toast.error("Failed to update"); else { toast.success(`Lead ${status}`); fetchData(); }
  };

  const FILTERS = ["all", "Active", "Closed", "Flagged"] as const;

  const filtered = leads.filter(l => {
    const matchFilter = filter === "all" || l.status === filter;
    const matchSearch = !search ||
      l.material_type.toLowerCase().includes(search.toLowerCase()) ||
      (l.poster_name || "").toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-foreground">{leads.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-accent">{leads.filter(l => l.status === "Active").length}</p>
          <p className="text-[10px] text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-muted-foreground">{leads.filter(l => l.status === "Closed").length}</p>
          <p className="text-[10px] text-muted-foreground">Closed</p>
        </CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="pl-9 h-10 text-sm bg-secondary border-0" />
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium capitalize transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>{f}</button>
        ))}
      </div>

      {/* Leads list */}
      <div className="space-y-2">
        {filtered.map(lead => (
          <Card key={lead.id} className="border-border">
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <Badge variant={lead.lead_type === "Buy" ? "default" : "secondary"} className="text-[10px]">{lead.lead_type}</Badge>
                    <Badge variant="outline" className="text-[10px]">{lead.category}</Badge>
                    <Badge variant={lead.status === "Active" ? "default" : lead.status === "Flagged" ? "destructive" : "secondary"} className="text-[10px]">{lead.status}</Badge>
                  </div>
                  <p className="text-sm font-bold text-foreground">{lead.material_type}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{lead.price_per_kg}/kg · {lead.quantity}kg · {lead.poster_name || "Unknown"}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Eye className="h-3 w-3" /> {lead.views}</span>
                    <span className="text-[10px] text-muted-foreground">📍 {lead.location_district}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {lead.status === "Active" && (
                  <>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(lead.id, "Closed")}>
                      <Ban className="h-3 w-3 mr-1" /> Close
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30" onClick={() => updateStatus(lead.id, "Flagged")}>
                      <Ban className="h-3 w-3 mr-1" /> Flag
                    </Button>
                  </>
                )}
                {(lead.status === "Closed" || lead.status === "Flagged") && (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(lead.id, "Active")}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Reactivate
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => deleteLead(lead.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No leads found</p>}
      </div>
    </div>
  );
}
