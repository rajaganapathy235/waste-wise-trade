import { useState } from "react";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { LeadCategory, LeadType } from "@/lib/mockData";
import LeadCard from "@/components/LeadCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const CATEGORIES: (LeadCategory | "All")[] = ["All", "Waste", "Fiber", "Yarn"];
const LEAD_TYPES: (LeadType | "All")[] = ["All", "Buy", "Sell"];

export default function Index() {
  const { leads } = useApp();
  const { t } = useI18n();
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
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("home.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 text-sm bg-secondary border-0"
        />
      </div>

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
