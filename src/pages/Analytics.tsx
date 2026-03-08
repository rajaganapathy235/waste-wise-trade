import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Eye, MessageCircle, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const navigate = useNavigate();
  const { leads } = useApp();
  const { t } = useI18n();
  const myLeads = leads.slice(0, 4);

  const chartData = myLeads.map((l) => ({
    name: l.materialType.length > 10 ? l.materialType.slice(0, 10) + "…" : l.materialType,
    views: l.views, inquiries: l.inquiries,
  }));
  const totalViews = myLeads.reduce((s, l) => s + l.views, 0);
  const totalInquiries = myLeads.reduce((s, l) => s + l.inquiries, 0);
  const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : "0";

  return (
    <div className="px-4 pt-3 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("analytics.back")}
      </button>
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">{t("analytics.title")}</h1>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{t("analytics.subtitle")}</p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card><CardContent className="p-3 text-center">
          <Eye className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{totalViews}</p>
          <p className="text-[10px] text-muted-foreground">{t("analytics.views")}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <MessageCircle className="h-4 w-4 text-emerald mx-auto mb-1" />
          <p className="text-lg font-bold">{totalInquiries}</p>
          <p className="text-[10px] text-muted-foreground">{t("analytics.inquiries")}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 text-gold mx-auto mb-1" />
          <p className="text-lg font-bold">{conversionRate}%</p>
          <p className="text-[10px] text-muted-foreground">{t("analytics.conversion")}</p>
        </CardContent></Card>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">{t("analytics.chartLabel")}</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="views" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inquiries" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <h2 className="text-sm font-semibold mb-2">{t("analytics.perListing")}</h2>
      <div className="space-y-2">
        {myLeads.map((lead) => (
          <Card key={lead.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{lead.materialType}</p>
                  <p className="text-[10px] text-muted-foreground">{lead.leadType} · {lead.category}</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-0.5"><Eye className="h-3 w-3 text-primary" /> {lead.views}</span>
                  <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3 text-emerald" /> {lead.inquiries}</span>
                  <span className="text-muted-foreground">{lead.views > 0 ? ((lead.inquiries / lead.views) * 100).toFixed(0) : 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
