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
  ShoppingCart, Tag, Store, Star, Shield, Share2, Loader2, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface CatalogProfile {
  id: string;
  display_name: string | null;
  business_name: string | null;
  location_district: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  trust_score: number | null;
  total_reviews: number | null;
  verification_status: string | null;
}

const CATEGORIES = ["All", "Waste", "Fiber", "Yarn"];

export default function Catalog() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType] = useState("All");

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data as CatalogProfile;
    },
    enabled: !!userId,
  });

  const { data: leads = [], isLoading: isLeadsLoading } = useQuery({
    queryKey: ["leads", "user", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("poster_id", userId)
        .eq("status", "Active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const filtered = leads.filter((l: any) => {
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

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Setting up the store...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="p-6 rounded-full bg-slate-50 text-slate-300">
          <Store className="h-12 w-12" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Catalog Not Found</h1>
          <p className="text-sm text-slate-500 mt-2">The profile you're looking for doesn't exist or has been disabled.</p>
        </div>
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-xl px-8 h-12 font-bold shadow-sm">
          Go to Marketplace
        </Button>
      </div>
    );
  }

  const initials = (profile.business_name || profile.display_name || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      {/* Premium Storefront Header */}
      <div className="bg-navy text-white px-6 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 blur-3xl h-64 w-64 bg-emerald rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate("/")} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Button size="icon" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-5 mb-6">
            <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/20 shadow-2xl">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{profile.business_name || profile.display_name}</h1>
                {profile.verification_status === "verified" && (
                  <Shield className="h-5 w-5 text-emerald fill-emerald/20" />
                )}
              </div>
              <p className="text-white/50 text-sm flex items-center gap-1.5 font-medium">
                <MapPin className="h-3.5 w-3.5" /> {profile.location_district || "Tamil Nadu"}, India
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Trust</p>
              <div className="flex items-center justify-center gap-1 font-black text-emerald">
                <Star className="h-3 w-3 fill-emerald" />
                <span>{profile.trust_score || "N/A"}</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Listings</p>
              <p className="font-black text-white">{leads.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Reviews</p>
              <p className="font-black text-white">{profile.total_reviews || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Materials Feed */}
      <div className="px-6 max-w-md mx-auto -mt-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 text-sm bg-slate-50 border-none rounded-2xl focus:ring-2 ring-primary/20"
            />
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {["All", "Buy", "Sell"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeType === type
                    ? type === "Buy" ? "bg-primary text-white shadow-lg"
                      : type === "Sell" ? "bg-emerald text-white shadow-lg"
                      : "bg-slate-900 text-white shadow-lg"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLeadsLoading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
            </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Package className="h-10 w-10 mx-auto mb-3 text-slate-200" />
            <p className="text-slate-400 font-medium text-sm">No materials found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((lead: any) => {
              const image = getMaterialImage(lead.material_type);
              return (
                <Card 
                  key={lead.id} 
                  onClick={() => navigate(`/lead/${lead.id}`)}
                  className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group rounded-3xl cursor-pointer active:scale-[0.98]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img 
                      src={image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop"} 
                      alt={lead.material_type} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-5">
                       <Badge className={`${lead.lead_type === 'Buy' ? 'bg-primary' : 'bg-emerald'} text-white border-none w-fit mb-2`}>
                        {lead.lead_type === 'Buy' ? <ShoppingCart className="h-3 w-3 mr-1" /> : <Tag className="h-3 w-3 mr-1" />}
                        {lead.lead_type}
                       </Badge>
                       <h3 className="text-lg font-black text-white">{lead.material_type}</h3>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5 font-black text-emerald text-lg">
                        <IndianRupee className="h-4 w-4" />
                        <span>{lead.price_per_kg}</span>
                        <span className="text-[10px] text-slate-400 font-normal">/kg</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                        <Package className="h-3.5 w-3.5" />
                        <span>{lead.quantity.toLocaleString()} kg</span>
                      </div>
                    </div>
                    
                    <Button
                      size="lg"
                      className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl font-black tracking-tight"
                    >
                      SEND ENQUIRY
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Hi<span className="text-emerald">Tex</span> Marketplace Secure Catalog
        </div>
      </div>
    </div>
  );
}
