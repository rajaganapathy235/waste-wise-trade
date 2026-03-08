import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockMaterialPriceHistory, MATERIAL_TYPES, LeadCategory } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CATEGORIES: LeadCategory[] = ["Waste", "Fiber", "Yarn"];
const CHART_COLORS: Record<string, string> = {
  Waste: "hsl(0, 84%, 60%)",
  Fiber: "hsl(217, 91%, 60%)",
  Yarn: "hsl(160, 84%, 39%)",
};

export default function MarketPulse() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState<LeadCategory>("Waste");
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIAL_TYPES["Waste"][0]);

  const data = mockMaterialPriceHistory[selectedMaterial] || [];

  const handleCategoryChange = (cat: LeadCategory) => {
    setActiveCat(cat);
    setSelectedMaterial(MATERIAL_TYPES[cat][0]);
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="h-5 w-5 text-emerald" />
        <h1 className="text-lg font-bold">Market Pulse</h1>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Price trends per material type (₹/kg)</p>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCat === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Material Dropdown */}
      <div className="mb-4">
        <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MATERIAL_TYPES[activeCat].map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">{selectedMaterial} — 6 Month Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214, 32%, 91%)", fontSize: "12px" }} />
              <Line type="monotone" dataKey="avg" stroke={CHART_COLORS[activeCat]} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* All materials summary for category */}
      <h2 className="text-sm font-semibold mb-2">{activeCat} — All Materials</h2>
      <div className="space-y-2">
        {MATERIAL_TYPES[activeCat].map((mat) => {
          const d = mockMaterialPriceHistory[mat];
          if (!d) return null;
          const latest = d[d.length - 1].avg;
          const prev = d[d.length - 2].avg;
          const change = ((latest - prev) / prev * 100).toFixed(1);
          return (
            <button
              key={mat}
              onClick={() => setSelectedMaterial(mat)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                selectedMaterial === mat ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <span className="text-sm font-medium">{mat}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">₹{latest}</span>
                <span className={`text-xs font-medium ${Number(change) >= 0 ? "text-emerald" : "text-destructive"}`}>
                  {Number(change) >= 0 ? "+" : ""}{change}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
