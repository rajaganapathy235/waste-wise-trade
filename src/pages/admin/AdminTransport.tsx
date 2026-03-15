import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Truck, CheckCircle, XCircle, Clock, MapPin } from "lucide-react";

interface TransportRequest {
  id: string;
  from_district: string | null;
  to_district: string | null;
  material_type: string | null;
  quantity: number | null;
  vehicle_type: string | null;
  status: string;
  estimated_cost: number | null;
  provider_name: string | null;
  provider_phone: string | null;
  requested_date: string | null;
  created_at: string;
  user_id: string;
}

export default function AdminTransport() {
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Pending" | "Confirmed" | "Completed" | "Cancelled">("all");

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("transport_requests").select("*").order("created_at", { ascending: false });
    setRequests((data as TransportRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("transport_requests").update({ status }).eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success(`Status → ${status}`); fetchData(); }
  };

  const FILTERS = ["all", "Pending", "Confirmed", "Completed", "Cancelled"] as const;

  const filtered = requests.filter(r => {
    const matchFilter = filter === "all" || r.status === filter;
    const matchSearch = !search ||
      (r.material_type || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.from_district || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.to_district || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "Pending": return "secondary";
      case "Confirmed": return "default";
      case "Completed": return "default";
      case "Cancelled": return "destructive";
      default: return "outline" as const;
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {(["Pending", "Confirmed", "Completed", "Cancelled"] as const).map(s => (
          <Card key={s} className="border-border">
            <CardContent className="p-2 text-center">
              <p className="text-lg font-bold text-foreground">{requests.filter(r => r.status === s).length}</p>
              <p className="text-[9px] text-muted-foreground">{s}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transport..." className="pl-9 h-10 text-sm bg-secondary border-0" />
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium capitalize whitespace-nowrap transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >{f}</button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(req => (
          <Card key={req.id} className="border-border">
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-sm font-bold text-foreground truncate">{req.material_type || "Unknown"}</p>
                    <Badge variant={statusColor(req.status)} className="text-[10px]">{req.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{req.from_district || "?"} → {req.to_district || "?"}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {req.quantity}kg · {req.vehicle_type || "Any"} · {req.estimated_cost ? `₹${req.estimated_cost}` : "No estimate"}
                  </p>
                  {req.provider_name && <p className="text-[10px] text-muted-foreground">Provider: {req.provider_name} ({req.provider_phone})</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {req.status === "Pending" && (
                  <>
                    <Button size="sm" className="h-7 text-xs bg-accent hover:bg-accent/90" onClick={() => updateStatus(req.id, "Confirmed")}>
                      <CheckCircle className="h-3 w-3 mr-1" /> Confirm
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => updateStatus(req.id, "Cancelled")}>
                      <XCircle className="h-3 w-3 mr-1" /> Cancel
                    </Button>
                  </>
                )}
                {req.status === "Confirmed" && (
                  <Button size="sm" className="h-7 text-xs bg-accent hover:bg-accent/90" onClick={() => updateStatus(req.id, "Completed")}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Complete
                  </Button>
                )}
                {(req.status === "Completed" || req.status === "Cancelled") && (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(req.id, "Pending")}>
                    <Clock className="h-3 w-3 mr-1" /> Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No transport requests</p>}
      </div>
    </div>
  );
}
