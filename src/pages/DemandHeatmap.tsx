import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { mockDemandData, LeadCategory } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Flame, MapPin, Zap, Activity, Info, BarChart3, Navigation, Layers, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

  const getHeatIntensity = (count: number) => {
    return count / maxCount;
  };

  const catLabel = (cat: "All" | LeadCategory) => cat === "All" ? t("home.all") : cat;

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto animate-fade-in bg-slate-50 min-h-screen relative overflow-x-hidden">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center">
             <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none mb-1">{t("demand.title")}</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Market Interest Map</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-amber-500">
           <Flame className="h-5 w-5" />
        </div>
      </div>

      <div className="mb-10 space-y-6">
          <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCat(cat)}
                className={`flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCat === cat ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}>
                {catLabel(cat)}
            </button>
            ))}
          </div>
      </div>

      <Card className="mb-10 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-8 relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity className="h-24 w-24" />
        </div>
        
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <BarChart3 className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase">Demand Concentration</h2>
            </div>
            <Badge variant="outline" className="border-amber-100 text-amber-600 bg-amber-50 font-black text-[9px] uppercase tracking-widest px-3">Live Feed</Badge>
        </div>

        <div className="h-[220px] w-full -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="district" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'rgb(100 116 139)', fontWeight: 800 }} 
                width={80}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 8 }}
                contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={16}>
                  {districtData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#fbbf24'} opacity={1 - (index * 0.1)} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between ml-1">
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">HIGH INTENSITY SEARCHES</h2>
            <div className="flex items-center gap-1.5 pt-0.5">
                <div className="h-1 w-1 rounded-full bg-slate-200" />
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">Updated Hourly</span>
            </div>
        </div>

        <div className="space-y-4">
          {sorted.map((item, i) => {
            const intensity = getHeatIntensity(item.searchCount);
            return (
              <Card key={`${item.material}-${item.district}`} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group hover:shadow-lg transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${intensity > 0.7 ? "bg-orange-500 text-white" : intensity > 0.4 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-300"}`}>
                            {intensity > 0.7 ? <Flame className="h-6 w-6 animate-pulse" /> : <Search className="h-5 w-5" />}
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 block">{item.material}</span>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                    <MapPin className="h-2.5 w-2.5" /><span>{item.district}</span>
                                </div>
                                <Badge variant="outline" className="text-[7px] font-black px-1.5 py-0 border-slate-100 text-slate-300 uppercase">{item.category}</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-base font-black text-slate-900 leading-none mb-1">{item.searchCount}</p>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">SEARCHES</p>
                    </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 opacity-10">
              <Zap className="h-32 w-32" />
          </div>
          <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 rounded-lg bg-emerald/20 flex items-center justify-center text-emerald">
                      <Zap className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Market Insight</h3>
              </div>
              <p className="text-xs font-medium leading-relaxed text-white/70 italic">"Coimbatore exhibits a 42% spike in **Comber Noil** demand this morning. Anticipate a minor price correction in the next 48 hours."</p>
          </div>
      </div>
      
      <p className="text-[9px] text-center text-slate-200 mt-16 font-black uppercase tracking-[0.5em]">
          HiTex Neural Map • Alpha-X
      </p>
    </div>
  );
}
