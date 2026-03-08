import { useState } from "react";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { LeadCategory, LeadType } from "@/lib/mockData";
import LeadCard from "@/components/LeadCard";
import { Input } from "@/components/ui/input";
import { Search, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CATEGORIES: (LeadCategory | "All")[] = ["All", "Waste", "Fiber", "Yarn"];
const LEAD_TYPES: (LeadType | "All")[] = ["All", "Buy", "Sell"];

export default function Index() {
  const { leads } = useApp();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<LeadCategory | "All">("All");
  const [activeType, setActiveType] = useState<LeadType | "All">("All");

  const filtered = leads.filter((l) => {
    const matchCategory = activeCategory === "All" || l.category === activeCategory;
    const matchType = activeType === "All" || l.leadType === activeType;
    const matchSearch =
      !search ||
      l.materialType.toLowerCase().includes(search.toLowerCase()) ||
      l.locationDistrict.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchType && matchSearch;
  });

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
      {/* Ad Banner */}
      <Card className="mb-3 border-gold/30 bg-gradient-to-r from-gold/10 via-gold/5 to-emerald/10 overflow-hidden">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gold/20 flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{t("home.adTitle")}</p>
            <p className="text-[10px] text-muted-foreground line-clamp-2">{t("home.adDesc")}</p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 text-[10px] h-7 px-2 border-gold/30 text-gold hover:bg-gold/10">
            {t("home.adCta")}
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

      {/* Job Work Section */}
      <Card className="mb-4 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{t("home.jobWork")}</h3>
                <p className="text-[10px] text-muted-foreground">{t("home.jobWorkDesc")}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-xs h-8 border-primary/30 text-primary hover:bg-primary/10">
              {t("home.findJobWorkers")} <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-3 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">{t("home.noListings")}</div>
        ) : (
          filtered.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
