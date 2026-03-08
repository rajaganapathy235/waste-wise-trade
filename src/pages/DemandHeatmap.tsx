import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { mockDemandData, LeadCategory } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Flame, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CATEGORIES: ("All" | LeadCategory)[] = ["All", "Waste", "Fiber", "Yarn"];

export default function DemandHeatmap() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [activeCat, setActiveCat] = useState<"All" | LeadCategory>("All");

  const filtered = activeCat === "All" ? mockDemandData : mockDemandData.filter((d) => d.category === activeCat);
  const sorted = [...filtered].sort((a, b) => b.searchCount - a.searchCount);
  const maxCount = sorted[0]?.searchCount || 1;

  const districtMap: Record<string, number> = {};
  filtered.forEach((d) => { districtMap[d.district] = (districtMap[d.district] || 0) + d.searchCount; });
  const districtData = Object.entries(districtMap).map(([district, count]) => ({ district, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const getHeatColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.7) return "bg-destructive/20 border-destructive/30";
    if (intensity > 0.4) return "bg-gold/20 border-gold/30";
    return "bg-emerald/10 border-emerald/20";
  };

  const catLabel = (cat: "All" | LeadCategory) => cat === "All" ? t("home.all") : cat;

  return (
    <div className="px-4 pt-3 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("demand.back")}
      </button>
      <div className="flex items-center gap-2 mb-1">
        <Flame className="h-5 w-5 text-gold" />
        <h1 className="text-lg font-bold">{t("demand.title")}</h1>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{t("demand.subtitle")}</p>

      <div className="flex gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCat === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {catLabel(cat)}
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">{t("demand.byDistrict")}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={districtData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis type="category" dataKey="district" tick={{ fontSize: 10 }} width={80} stroke="hsl(215, 16%, 47%)" />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="count" fill="hsl(45, 93%, 47%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <h2 className="text-sm font-semibold mb-2">{t("demand.topMaterials")}</h2>
      <div className="space-y-2">
        {sorted.map((item, i) => (
          <div key={`${item.material}-${item.district}`} className={`flex items-center justify-between p-3 rounded-lg border ${getHeatColor(item.searchCount)}`}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
              <div>
                <p className="text-sm font-medium">{item.material}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin className="h-3 w-3" /><span>{item.district}</span>
                  <Badge variant="outline" className="text-[8px] px-1 py-0 ml-1">{item.category}</Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{item.searchCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("demand.searches")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
