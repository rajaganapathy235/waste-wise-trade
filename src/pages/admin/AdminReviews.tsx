import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Trash2, Star } from "lucide-react";

interface Review {
  id: string;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  reviewee_id: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Review deleted"); fetchData(); }
  };

  const filtered = reviews.filter(r => {
    const matchSearch = !search ||
      (r.reviewer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.comment || "").toLowerCase().includes(search.toLowerCase());
    const matchRating = ratingFilter === null || r.rating === ratingFilter;
    return matchSearch && matchRating;
  });

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-foreground">{reviews.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-gold">{avgRating}</p>
          <p className="text-[10px] text-muted-foreground">Avg Rating</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-destructive">{reviews.filter(r => r.rating <= 2).length}</p>
          <p className="text-[10px] text-muted-foreground">Low Rating</p>
        </CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews..." className="pl-9 h-10 text-sm bg-secondary border-0" />
      </div>

      {/* Rating filter */}
      <div className="flex gap-1.5">
        <button onClick={() => setRatingFilter(null)}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
            ratingFilter === null ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}>All</button>
        {[5, 4, 3, 2, 1].map(r => (
          <button key={r} onClick={() => setRatingFilter(r)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
              ratingFilter === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>{r}★</button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-2">
        {filtered.map(review => (
          <Card key={review.id} className="border-border">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-foreground">{review.reviewer_name || "Anonymous"}</p>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "text-gold fill-gold" : "text-muted"}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-xs text-muted-foreground mt-1">{review.comment}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0 shrink-0" onClick={() => deleteReview(review.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No reviews found</p>}
      </div>
    </div>
  );
}
