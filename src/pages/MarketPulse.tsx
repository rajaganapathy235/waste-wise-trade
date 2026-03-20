import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { mockMaterialPriceHistory, MATERIAL_TYPES, LeadCategory } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, Sparkles, TrendingDown, ArrowUpRight, Activity, Calendar, Info, Globe, ShieldCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Badge } from "@/components/ui/badge";

const CATEGORIES: LeadCategory[] = ["Waste", "Fiber", "Yarn"];
const CHART_COLORS: Record<string, string> = {
  Waste: "hsl(0, 84%, 60%)", Fiber: "hsl(217, 91%, 60%)", Yarn: "hsl(160, 84%, 39%)",
};

export default function MarketPulse() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [activeCat, setActiveCat] = useState<LeadCategory>("Waste");
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIAL_TYPES["Waste"][0]);

  const data = mockMaterialPriceHistory[selectedMaterial] || [];
  const handleCategoryChange = (cat: LeadCategory) => { setActiveCat(cat); setSelectedMaterial(MATERIAL_TYPES[cat][0]); };

  const latestData = data[data.length - 1];
  const prevData = data[data.length - 2];
  const mainChange = latestData && prevData ? ((latestData.avg - prevData.avg) / prevData.avg * 100).toFixed(1) : "0";

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto animate-fade-in bg-slate-50 min-h-screen relative overflow-x-hidden">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center">
             <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none mb-1">{t("pulse.title")}</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Textile Index</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-emerald">
           <Activity className="h-5 w-5" />
        </div>
      </div>

      <div className="mb-10 space-y-6">
          <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm">
            {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => handleCategoryChange(cat)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCat === cat ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}>
                {cat}
            </button>
            ))}
          </div>

          <div className="relative group">
            <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
            <SelectTrigger className="h-14 border-none bg-white rounded-2xl shadow-sm font-black text-slate-800 text-sm px-6">
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
                {MATERIAL_TYPES[activeCat].map((m) => (<SelectItem key={m} value={m} className="font-bold py-3">{m}</SelectItem>))}
            </SelectContent>
            </Select>
            <Sparkles className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald animate-pulse pointer-events-none" />
          </div>
      </div>

      <Card className="mb-10 border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Index Overview</p>
                <h2 className="text-lg font-black tracking-tight">{selectedMaterial}</h2>
              </div>
              <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">24H Change</p>
                  <div className={`flex items-center justify-end gap-1 font-black ${Number(mainChange) >= 0 ? "text-emerald" : "text-destructive"}`}>
                      {Number(mainChange) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="text-lg">{Math.abs(Number(mainChange))}%</span>
                  </div>
              </div>
          </div>

          <div className="h-[220px] w-full mt-4 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontWeight: 800 }} 
                />
                <YAxis 
                    hide 
                    domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', padding: '8px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 900 }}
                />
                <Area 
                    type="monotone" 
                    dataKey="avg" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorAvg)" 
                    dot={{ r: 4, strokeWidth: 2, fill: '#10b981', stroke: '#0f172a' }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5"><Calendar className="h-4 w-4 opacity-40" /></div>
                  <div>
                      <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">Volatility</p>
                      <p className="text-xs font-black">Medium</p>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5"><Info className="h-4 w-4 opacity-40" /></div>
                  <div>
                      <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">Accuracy</p>
                      <p className="text-xs font-black">99.2%</p>
                  </div>
              </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">MARKET MOVERS</h2>
        <div className="space-y-3">
            {MATERIAL_TYPES[activeCat].map((mat) => {
            const d = mockMaterialPriceHistory[mat];
            if (!d) return null;
            const latest = d[d.length - 1].avg;
            const prev = d[d.length - 2].avg;
            const change = ((latest - prev) / prev * 100).toFixed(1);
            return (
                <button key={mat} onClick={() => setSelectedMaterial(mat)}
                className={`w-full group flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 ${selectedMaterial === mat ? "border-primary bg-white shadow-xl shadow-slate-200" : "border-slate-100 bg-white hover:border-slate-200"}`}>
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${selectedMaterial === mat ? "bg-primary text-white scale-110" : "bg-slate-50 text-slate-300 group-hover:bg-slate-100"}`}>
                            {Number(change) >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-black text-slate-800 tracking-tight">{mat}</span>
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-black ${Number(change) >= 0 ? "text-emerald" : "text-destructive"}`}>
                                    {Number(change) >= 0 ? "+" : ""}{change}%
                                </span>
                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">Verified Daily</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-base font-black text-slate-900">₹{latest}</span>
                    </div>
                </button>
            );
            })}
        </div>
      </div>

      <div className="mt-12 p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Globe className="h-6 w-6" />
          </div>
          <div>
              <h3 className="text-sm font-black text-slate-800 mb-1">Market Sentiment</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Demand for recycled waste is seeing a sharp uptick in the Tiruppur circuit due to new EU transparency norms. Current sentiment is <span className="text-emerald font-black">BULLISH</span>.</p>
          </div>
      </div>
      
      <p className="text-[9px] text-center text-slate-200 mt-16 font-black uppercase tracking-[0.5em]">
          HiTex Quant Engine • RT-900
      </p>
    </div>
  );
}
