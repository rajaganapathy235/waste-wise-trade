import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart3, Flame, Truck, Receipt, ShieldCheck, Landmark, Zap, Store, ArrowLeft, Sparkles, ChevronRight, Globe, LifeBuoy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BASE_SERVICES = [
  { key: "services.marketPulse", icon: TrendingUp, color: "text-emerald", bg: "bg-emerald/10", path: "/market-pulse", desc: "Live price index & trends" },
  { key: "services.analytics", icon: BarChart3, color: "text-primary", bg: "bg-primary/10", path: "/analytics", desc: "Your listing performance" },
  { key: "services.demandMap", icon: Flame, color: "text-orange-500", bg: "bg-orange-50", path: "/demand-heatmap", desc: "Regional demand hotspots" },
  { key: "services.transport", icon: Truck, color: "text-blue-500", bg: "bg-blue-50", path: "/transport", desc: "Logistics & shipments" },
  { key: "services.tneb", icon: Zap, color: "text-amber-500", bg: "bg-amber-50", path: "/tneb", desc: "Electricity bill calculator" },
  { key: "services.insurance", icon: ShieldCheck, color: "text-indigo-500", bg: "bg-indigo-50", path: null, desc: "Business asset protection" },
  { key: "services.nbfc", icon: Landmark, color: "text-slate-600", bg: "bg-slate-100", path: null, desc: "Working capital loans" },
];

export default function Services() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const fromBilling = location.state?.from === "billing";

  const SERVICES = fromBilling
    ? [
        { key: "HiTex Marketplace", icon: Store, color: "text-emerald", bg: "bg-emerald/10", path: "/", desc: "Return to trading floor" },
        ...BASE_SERVICES,
      ]
    : [
        { key: "services.billing", icon: Receipt, color: "text-emerald", bg: "bg-emerald/10", path: "/billing", desc: "Ledger & Invoicing" },
        ...BASE_SERVICES,
      ];

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto animate-fade-in bg-slate-50 min-h-screen relative overflow-x-hidden">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center">
             <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none mb-1">{t("services.title")}</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4">Utility Ecosystem</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-primary">
           <Globe className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {SERVICES.map(({ key, icon: Icon, color, bg, path, desc }) => (
          <Card
            key={key}
            className={`group border-none shadow-sm rounded-3xl bg-white overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${!path ? "opacity-60" : ""}`}
            onClick={() => path && navigate(path)}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${bg}`}>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
                <div className="text-left">
                  <span className="text-sm font-black text-slate-800 tracking-tight block">
                      {key.startsWith("services.") ? t(key) : key}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter line-clamp-1">{desc}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!path ? (
                    <Badge variant="secondary" className="bg-slate-50 text-slate-300 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">SOON</Badge>
                ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ChevronRight className="h-4 w-4" />
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
          <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-120 transition-transform duration-1000">
              <Sparkles className="h-32 w-32" />
          </div>
          <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 rounded-lg bg-emerald/20 flex items-center justify-center text-emerald">
                      <LifeBuoy className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Premium Support</h3>
              </div>
              <p className="text-xs font-medium leading-relaxed text-white/70 mb-6">"Our industrial experts are available 24/7 to help you with logistics and market analysis."</p>
              <Button className="w-full bg-white text-slate-900 border-none hover:bg-slate-100 font-black h-12 rounded-2xl text-[10px] tracking-widest uppercase shadow-2xl transition-all active:scale-95">
                  CONTACT CONCIERGE
              </Button>
          </div>
      </div>
      
      <p className="text-[9px] text-center text-slate-200 mt-16 font-black uppercase tracking-[0.5em]">
          HiTex Service Mesh • V.4.0
      </p>
    </div>
  );
}
