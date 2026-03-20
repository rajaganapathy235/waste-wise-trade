import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LeadCategory, LeadType } from "@/lib/mockData";
import LeadCard from "@/components/LeadCard";
import { Input } from "@/components/ui/input";
import { Search, Megaphone, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/useLeads";
import { useContent } from "@/hooks/useContent";

const CATEGORIES: (LeadCategory | "All")[] = ["All", "Waste", "Fiber", "Yarn"];
const LEAD_TYPES: (LeadType | "All")[] = ["All", "Buy", "Sell"];

export default function Index() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<LeadCategory | "All">("All");
  const [activeType, setActiveType] = useState<LeadType | "All">("All");

  const { data: leads = [], isLoading, error } = useLeads({
    category: activeCategory,
    type: activeType,
    search: search
  });

  const { data: content = {} } = useContent();

  const filtered = leads.filter(l => 
    !search || 
    l.materialType.toLowerCase().includes(search.toLowerCase()) ||
    l.locationDistrict.toLowerCase().includes(search.toLowerCase())
  );

  const typeLabel = (type: LeadType | "All") => {
    if (type === "All") return t("home.all");
    if (type === "Buy") return t("home.buy");
    return t("home.sell");
  };

  const catLabel = (cat: LeadCategory | "All") => {
    if (cat === "All") return t("home.all");
    return cat;
  };

  return (
    <div className="px-4 pt-4">
      {/* Dynamic Ad Banner from CMS */}
      <Card className="mb-3 border-primary/20 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 overflow-hidden text-white shadow-xl shadow-indigo-500/10">
        <CardContent className="p-4 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
              <Megaphone className="h-20 w-20" />
          </div>
          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-primary shadow-2xl relative z-10">
            <Megaphone className="h-5 w-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-xs font-black tracking-tighter uppercase italic">{content['hero_banner_title'] || t("home.adTitle")}</p>
            <p className="text-[10px] text-white/50 font-medium line-clamp-1 uppercase tracking-widest">{content['hero_banner_description'] || t("home.adDesc")}</p>
          </div>
          <Button 
            size="sm" 
            className="shrink-0 text-[10px] font-black h-8 px-4 bg-primary text-white border-none rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            onClick={() => navigate('/subscribe')}
          >
            {content['hero_banner_button'] || t("home.adCta")}
          </Button>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("home.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 text-sm bg-secondary border-0"
        />
      </div>

      {/* Buy / Sell toggle */}
      <div className="flex gap-2 mb-3">
        {LEAD_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeType === type
                ? type === "Buy" ? "bg-primary text-primary-foreground" : type === "Sell" ? "bg-emerald text-emerald-foreground" : "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {typeLabel(type)}
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
            {catLabel(cat)}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-3 pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            <p className="text-sm text-muted-foreground animate-pulse">Syncing live marketplace...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 text-sm">Error loading leads. Please try again.</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">{t("home.noListings")}</div>
        ) : (
          filtered.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
