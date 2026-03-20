import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Eye, MessageCircle, TrendingUp, BarChart3, Loader2, Sparkles, Zap, Target, MousePointer2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useMyLeads } from "@/hooks/useLeads";

export default function Analytics() {
  const navigate = useNavigate();
  const { user } = useApp();
  const { t } = useI18n();
  
  const { data: leads = [], isLoading } = useMyLeads(user.id);
  
  // Take top 5 leads for the chart
  const myLeads = leads.slice(0, 5);

  const chartData = myLeads.map((l) => ({
    name: l.materialType.length > 8 ? l.materialType.slice(0, 8) + "…" : l.materialType,
    views: l.views || 0, 
    inquiries: l.inquiries || 0,
  }));

  const totalViews = leads.reduce((s, l) => s + (l.views || 0), 0);
  const totalInquiries = leads.reduce((s, l) => s + (l.inquiries || 0), 0);
  const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : "0";

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto animate-fade-in bg-slate-50 min-h-screen relative overflow-x-hidden">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center">
             <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none mb-1">{t("analytics.title")}</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4">Performance Insights</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-primary">
           <BarChart3 className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden text-center group">
          <CardContent className="p-4 flex flex-col items-center">
             <div className="p-2.5 rounded-2xl bg-primary/5 text-primary mb-3 group-hover:scale-110 transition-transform">
                <Eye className="h-4 w-4" />
             </div>
             <p className="text-xl font-black text-slate-800 leading-none mb-1">{totalViews}</p>
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{t("analytics.views")}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden text-center group">
          <CardContent className="p-4 flex flex-col items-center">
             <div className="p-2.5 rounded-2xl bg-emerald/10 text-emerald mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-4 w-4" />
             </div>
             <p className="text-xl font-black text-slate-800 leading-none mb-1">{totalInquiries}</p>
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{t("analytics.inquiries")}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-primary text-white overflow-hidden text-center group">
          <CardContent className="p-4 flex flex-col items-center">
             <div className="p-2.5 rounded-2xl bg-white/10 text-white mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4" />
             </div>
             <p className="text-xl font-black leading-none mb-1">{conversionRate}%</p>
             <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Growth</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-10 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-8">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                    <Target className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase">Traffic Distribution</h2>
            </div>
            <Zap className="h-4 w-4 text-emerald" />
        </div>

        <div className="h-[220px] w-full -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: 'rgb(203 213 225)', fontWeight: 800 }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 12 }}
                contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900 }}
              />
              <Bar dataKey="views" fill="#0f172a" radius={[6, 6, 6, 6]} barSize={12}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#0f172a' : '#94a3b8'} opacity={0.8} />
                  ))}
              </Bar>
              <Bar dataKey="inquiries" fill="#10b981" radius={[6, 6, 6, 6]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-8 flex items-center justify-between px-2 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-900" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impressions</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversions</span>
            </div>
        </div>
      </Card>

      <div className="space-y-6">
        <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">TOP PERFORMING LEADS</h2>
        <div className="space-y-4">
        {leads.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No analytics data yet</p>
            </div>
        ) : (
            leads.map((lead) => (
            <Card key={lead.id} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group hover:shadow-lg transition-all">
                <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{lead.materialType}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{lead.category} · {lead.leadType}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                         <MousePointer2 className="h-5 w-5" />
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 rounded-2xl bg-slate-50/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">VIEWS</p>
                        <p className="text-sm font-black text-slate-800">{lead.views || 0}</p>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-slate-50/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">CHATS</p>
                        <p className="text-sm font-black text-slate-800">{lead.inquiries || 0}</p>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-primary/5">
                        <p className="text-[8px] font-black text-primary uppercase tracking-tighter mb-1">INDEX</p>
                        <p className="text-sm font-black text-primary">{lead.views && lead.views > 0 ? ((lead.inquiries || 0) / lead.views * 100).toFixed(0) : 0}%</p>
                    </div>
                </div>
                </CardContent>
            </Card>
            ))
        )}
        </div>
      </div>
      
      <p className="text-[9px] text-center text-slate-200 mt-16 font-black uppercase tracking-[0.5em]">
          HiTex Analytics Engine • V.2.1
      </p>
    </div>
  );
}
