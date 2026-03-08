import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart3, Flame, Truck, Receipt, ShieldCheck, Landmark, Zap } from "lucide-react";

const SERVICES = [
  { key: "services.marketPulse", icon: TrendingUp, color: "text-emerald", path: "/market-pulse" },
  { key: "services.analytics", icon: BarChart3, color: "text-primary", path: "/analytics" },
  { key: "services.demandMap", icon: Flame, color: "text-gold", path: "/demand-heatmap" },
  { key: "services.transport", icon: Truck, color: "text-primary", path: "/transport" },
  { key: "services.tneb", icon: Zap, color: "text-gold", path: "/tneb" },
  { key: "services.billing", icon: Receipt, color: "text-emerald", path: null },
  { key: "services.insurance", icon: ShieldCheck, color: "text-gold", path: null },
  { key: "services.nbfc", icon: Landmark, color: "text-primary", path: null },
];

export default function Services() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="px-4 pt-4 pb-8">
      <h1 className="text-lg font-bold mb-4">{t("services.title")}</h1>
      <div className="grid grid-cols-2 gap-3">
        {SERVICES.map(({ key, icon: Icon, color, path }) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all hover:shadow-md ${!path ? "opacity-60" : ""}`}
            onClick={() => path && navigate(path)}
          >
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <span className="text-xs font-medium">{t(key)}</span>
              {!path && (
                <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {t("services.comingSoon")}
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
