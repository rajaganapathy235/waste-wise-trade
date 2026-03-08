import { useState } from "react";
import { useApp } from "@/lib/appContext";
import { LeadCategory, LeadType } from "@/lib/mockData";
import LeadCard from "@/components/LeadCard";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, BarChart3, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CATEGORIES: (LeadCategory | "All")[] = ["All", "Waste", "Fiber", "Yarn"];
const LEAD_TYPES: (LeadType | "All")[] = ["All", "Buy", "Sell"];

export default function Index() {
  const { leads } = useApp();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<LeadCategory | "All">("All");
  const [activeType, setActiveType] = useState<LeadType | "All">("All");
  const navigate = useNavigate();

  const filtered = leads.filter((l) => {
    const matchCategory = activeCategory === "All" || l.category === activeCategory;
    const matchType = activeType === "All" || l.leadType === activeType;
    const matchSearch =
      !search ||
      l.materialType.toLowerCase().includes(search.toLowerCase()) ||
      l.locationDistrict.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchType && matchSearch;
  });

  return (
    <div className="px-4 pt-4">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search material, location…"
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
        <button
          onClick={() => navigate("/market-pulse")}
          className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-emerald/10 text-emerald flex items-center gap-1"
        >
          <TrendingUp className="h-3 w-3" /> Pulse
        </button>
        <button
          onClick={() => navigate("/analytics")}
          className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-primary/10 text-primary flex items-center gap-1"
        >
          <BarChart3 className="h-3 w-3" /> Analytics
        </button>
        <button
          onClick={() => navigate("/demand-heatmap")}
          className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-gold/10 text-gold flex items-center gap-1"
        >
          <Flame className="h-3 w-3" /> Demand
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-3 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No listings found</div>
        ) : (
          filtered.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
