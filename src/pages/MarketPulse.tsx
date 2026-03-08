import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockPriceHistory, LeadCategory } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
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

  const data = mockPriceHistory[activeCat];

  return (
    <div className="px-4 pt-3 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="h-5 w-5 text-emerald" />
        <h1 className="text-lg font-bold">Market Pulse</h1>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Average selling price trends (₹/kg)</p>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCat === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Chart */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(214, 32%, 91%)",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke={CHART_COLORS[activeCat]}
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const d = mockPriceHistory[cat];
          const latest = d[d.length - 1].avg;
          const prev = d[d.length - 2].avg;
          const change = ((latest - prev) / prev * 100).toFixed(1);
          return (
            <Card key={cat}>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">{cat}</p>
                <p className="text-lg font-bold">₹{latest}</p>
                <p className={`text-[10px] font-medium ${Number(change) >= 0 ? "text-emerald" : "text-destructive"}`}>
                  {Number(change) >= 0 ? "+" : ""}{change}%
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
