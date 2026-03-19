import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMaterialImage } from "@/lib/materialImages";
import {
  MapPin, Package, IndianRupee, Search, MessageCircle,
  ShoppingCart, Tag, Store, Star, Shield, Share2, Phone
} from "lucide-react";
import { toast } from "sonner";

interface CatalogProfile {
  display_name: string | null;
  business_name: string | null;
  location: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  trust_score: number | null;
  total_reviews: number | null;
  verification_status: string | null;
}

interface CatalogLead {
  id: string;
  lead_type: string;
  category: string;
  material_type: string;
  price_per_kg: number;
  quantity: number;
  specs: unknown;
  status: string;
  location_district: string | null;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  Waste: "bg-destructive/10 text-destructive border-destructive/20",
  Fiber: "bg-primary/10 text-primary border-primary/20",
  Yarn: "bg-emerald/10 text-emerald border-emerald/20",
};

const CATEGORIES = ["All", "Waste", "Fiber", "Yarn"];

export default function Catalog() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CatalogProfile | null>(null);
  const [leads, setLeads] = useState<CatalogLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      setLoading(true);
      const [profileRes, leadsRes] = await Promise.all([
        supabase.from("profiles").select("display_name, business_name, location, phone, avatar_url, bio, trust_score, total_reviews, verification_status").eq("user_id", userId).single(),
        supabase.from("leads").select("id, lead_type, category, material_type, price_per_kg, quantity, specs, status, location_district, created_at").eq("user_id", userId).eq("status", "Active").order("created_at", { ascending: false }),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (leadsRes.data) setLeads(leadsRes.data);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const filtered = leads.filter((l) => {
    const matchCat = activeCategory === "All" || l.category === activeCategory;
    const matchType = activeType === "All" || l.lead_type === activeType;
    const matchSearch = !search || l.material_type.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchType && matchSearch;
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `${profile?.business_name || "Catalog"}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Catalog link copied!");
    }
  };

  const handleEnquiry = (leadId: string) => {
    navigate(`/chat/${leadId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading catalog...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 p-4">
        <Store className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Catalog not found</p>
      </div>
    );
  }

  const initials = (profile.business_name || profile.display_name || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Storefront Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-emerald/80 text-primary-foreground px-4 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg font-bold border border-white/30">
                {initials}
              </div>
              <div>
                <h1 className="text-lg font-bold">{profile.business_name || profile.display_name || "Unnamed Store"}</h1>
                {profile.location && (
                  <p className="text-xs opacity-80 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {profile.location}
                  </p>
                )}
              </div>
            </div>
            <Button size="icon" variant="ghost" className="text-primary-foreground hover:bg-white/20" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {profile.bio && (
            <p className="text-xs opacity-80 mb-3 line-clamp-2">{profile.bio}</p>
          )}

          <div className="flex items-center gap-4">
            {profile.verification_status === "verified" && (
              <Badge className="bg-white/20 border-white/30 text-primary-foreground text-[10px] gap-1">
                <Shield className="h-3 w-3" /> Verified
              </Badge>
            )}
            {profile.trust_score && profile.trust_score > 0 && (
              <div className="flex items-center gap-1 text-xs opacity-90">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="font-semibold">{profile.trust_score}</span>
              </div>
            )}
            <span className="text-xs opacity-70">{leads.length} listings</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 max-w-md mx-auto -mt-3">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm bg-card border shadow-sm rounded-xl"
          />
        </div>

        {/* Type toggle */}
        <div className="flex gap-2 mb-3">
          {["All", "Buy", "Sell"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeType === type
                  ? type === "Buy" ? "bg-primary text-primary-foreground"
                    : type === "Sell" ? "bg-emerald text-emerald-foreground"
                    : "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Listings */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No materials listed yet</p>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {filtered.map((lead) => {
              const image = getMaterialImage(lead.material_type);
              return (
                <Card key={lead.id} className="overflow-hidden hover:shadow-md transition-all animate-fade-in">
                  {image && (
                    <div className="aspect-[16/7] overflow-hidden">
                      <img src={image} alt={lead.material_type} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {lead.lead_type === "Buy" ? (
                          <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Tag className="h-3.5 w-3.5 text-emerald" />
                        )}
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">{lead.material_type}</h3>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{lead.lead_type}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${categoryColors[lead.category] || ""}`}>
                        {lead.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-3 mb-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IndianRupee className="h-3.5 w-3.5 text-emerald" />
                        <span className="font-bold text-foreground text-sm">₹{lead.price_per_kg}</span>
                        <span>/kg</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        <span>{lead.quantity.toLocaleString()} kg</span>
                      </div>
                      {lead.location_district && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{lead.location_district}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-emerald hover:bg-emerald/90 text-emerald-foreground"
                      onClick={() => handleEnquiry(lead.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1.5" /> Send Enquiry
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground">
          Powered by <span className="font-semibold text-primary">HiTex</span> Marketplace
        </p>
      </div>
    </div>
  );
}
