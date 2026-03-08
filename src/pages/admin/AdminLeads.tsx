import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

interface Review {
  id: string;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"leads" | "reviews">("leads");

  const fetchData = async () => {
    setLoading(true);
    const [leadsRes, reviewsRes] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    ]);
    setLeads((leadsRes.data as Lead[]) || []);
    setReviews((reviewsRes.data as Review[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) toast.error("Failed to delete"); else { toast.success("Lead removed"); fetchData(); }
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error("Failed to delete"); else { toast.success("Review removed"); fetchData(); }
  };

  const filteredLeads = leads.filter(l =>
    !search || l.material_type.toLowerCase().includes(search.toLowerCase()) ||
    (l.poster_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex gap-2">
        {(["leads", "reviews"] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
              view === v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >{v} ({v === "leads" ? leads.length : reviews.length})</button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 h-10 text-sm bg-secondary border-0" />
      </div>

      {view === "leads" ? (
        <div className="space-y-2">
          {filteredLeads.map(lead => (
            <Card key={lead.id} className="border-border">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={lead.lead_type === "Buy" ? "default" : "secondary"} className="text-[10px]">
                        {lead.lead_type}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{lead.category}</Badge>
                      <Badge variant={lead.status === "Active" ? "default" : "secondary"} className="text-[10px]">
                        {lead.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-foreground">{lead.material_type}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{lead.price_per_kg}/kg · {lead.quantity} kg · {lead.poster_name || "Unknown"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Eye className="h-3 w-3" /> {lead.views}</span>
                      <span className="text-[10px] text-muted-foreground">📍 {lead.location_district}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => deleteLead(lead.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredLeads.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No leads yet</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map(review => (
            <Card key={review.id} className="border-border">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{review.reviewer_name || "Anonymous"}</p>
                    <div className="flex items-center gap-1 my-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-xs ${i < review.rating ? "text-gold" : "text-muted"}`}>★</span>
                      ))}
                    </div>
                    {review.comment && <p className="text-xs text-muted-foreground">{review.comment}</p>}
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => deleteReview(review.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {reviews.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No reviews yet</p>}
        </div>
      )}
    </div>
  );
}
