import { useState, useEffect } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, Users, ShoppingBag, CreditCard, 
  Key, Settings, FileText, Menu, X, LogOut, 
  ChevronRight, ArrowUpRight, BarChart3, ShieldCheck,
  Zap, Bell, Search, Globe, Activity, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAdminStats, useAdminLeads } from "@/hooks/useAdmin";

export default function AdminDashboard() {
  const { logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Users & Roles", icon: Users, path: "/admin/users" },
    { name: "Leads Manager", icon: ShoppingBag, path: "/admin/leads" },
    { name: "Subscriptions", icon: CreditCard, path: "/admin/subscriptions" },
    { name: "Payment Logs", icon: FileText, path: "/admin/payments" },
    { name: "API Key Manager", icon: Key, path: "/admin/api-keys" },
    { name: "Content Manager", icon: FileText, path: "/admin/content-manager" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } bg-slate-900 text-white transition-all duration-500 flex flex-col z-50 shadow-2xl relative`}
      >
        <div className="p-8 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="font-black text-2xl flex items-center gap-3 tracking-tighter">
              <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span>Hi<span className="text-primary">Tex</span> Core</span>
            </div>
          ) : (
            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 mx-auto">
                <ShieldCheck className="h-7 w-7" />
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 px-4 mt-4">
          <div className="space-y-2">
            <p className={`text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4 ${!sidebarOpen && 'hidden'}`}>MANAGEMENT</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group truncate ${
                    isActive 
                      ? "bg-primary text-white shadow-xl shadow-primary/20" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && <span className="text-sm font-black tracking-tight uppercase tracking-widest text-[10px]">{item.name}</span>}
                  {isActive && !sidebarOpen && (
                      <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-6">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className={`w-full h-14 rounded-2xl transition-all duration-300 ${sidebarOpen ? 'justify-start px-6' : 'justify-center px-0'} text-slate-500 hover:text-red-400 hover:bg-red-400/5 group`}
          >
            <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1" />
            {sidebarOpen && <span className="ml-4 text-[10px] font-black uppercase tracking-widest">Terminate Session</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-10 z-40 border-b border-slate-100">
          <div className="flex items-center gap-6">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-400 hover:text-slate-900 transition-colors"
            >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {menuItems.find(i => i.path === location.pathname)?.name || "Dashboard"}
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 group focus-within:ring-2 ring-primary/10 transition-all">
                <Search className="h-4 w-4" />
                <input placeholder="Command focus..." className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-40" />
            </div>
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-900">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
                </Button>
                <div className="h-10 w-10 rounded-2xl bg-slate-900 overflow-hidden border-2 border-slate-100 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                    <img src="https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff" alt="Admin" />
                </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 relative scroll-smooth no-scrollbar">
          <ScrollArea className="h-full p-10">
            {location.pathname === "/admin/dashboard" ? <DashboardOverview /> : <Outlet />}
          </ScrollArea>
        </div>
      </main>
    </div>
  );
}

function DashboardOverview() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: leads = [], isLoading: leadsLoading } = useAdminLeads();

  if (isLoading || leadsLoading) {
      return (
          <div className="h-[60vh] flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          </div>
      );
  }

  const statCards = [
    { label: "Trader Force", value: stats?.users.toLocaleString(), change: "+3.2%", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Market Volume", value: stats?.leads.toLocaleString(), change: "+5.1%", icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Cash Flow", value: `₹${stats?.revenue.toLocaleString()}`, change: "+12.4%", icon: CreditCard, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Premium Nodes", value: stats?.subscriptions.toLocaleString(), change: "+2.5%", icon: Zap, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Systems Status: <span className="text-primary tracking-tighter uppercase italic">Optimal</span></h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">REAL-TIME PLATFORM DATA • Tiruppur Control Hub</p>
        </div>
        <div className="flex items-center gap-3">
            <Button className="h-12 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-600 hover:bg-slate-50 font-black text-[10px] tracking-widest uppercase">
                EXPORT AUDIT
            </Button>
            <Button className="h-12 rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-300 font-black text-[10px] tracking-widest uppercase px-8 group active:scale-95 transition-all">
                CORE UPDATE <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{stat.value}</h3>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-tighter">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>{stat.change} GROWTH</span>
                  </div>
                </div>
                <div className={`p-5 rounded-[2rem] ${stat.bg} ${stat.color} group-hover:scale-110 transition-all duration-500`}>
                  <stat.icon className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-lg font-black text-slate-800 tracking-tight uppercase">Recent Core Activity</CardTitle>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Marketplace Stream</p>
            </div>
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl">VIEW ALL TRANSFERS</Button>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <div className="space-y-6">
              {leads.slice(0, 5).map((lead, i) => (
                <div key={lead.id} className="flex items-center justify-between p-6 rounded-[2rem] hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      {lead.poster_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">{lead.material_type}</p>
                      <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{lead.location_district}</span>
                          <div className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest">{lead.lead_type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                      <p className="text-xs font-black text-slate-900 leading-none mb-1">{lead.quantity.toLocaleString()} KG</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active State</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-10">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden p-10 relative">
                <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <Activity className="h-5 w-5 text-emerald" />
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Neural Health</CardTitle>
                    </div>
                    
                    <div className="space-y-8">
                        {[
                            { label: "Core Database", status: "Operational", color: "bg-emerald-500" },
                            { label: "Auth Mesh", status: "Operational", color: "bg-emerald-500" },
                            { label: "Payment Gateway", status: "Operational", color: "bg-emerald-500" },
                            { label: "Realtime Engine", status: "Degraded", color: "bg-amber-500" },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{s.label}</span>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${s.color === 'bg-emerald-500' ? 'text-emerald' : 'text-amber-500'}`}>{s.status}</span>
                                    <span className={`h-2 w-2 rounded-full ${s.color} ring-4 ${s.color === 'bg-emerald-500' ? 'ring-emerald-500/10' : 'ring-amber-500/10'}`} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-white/5 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-all">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Storage Optimization</p>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-3xl font-black tracking-tighter italic">12.4%</span>
                            <span className="text-[10px] font-black text-white/20 mb-1 uppercase tracking-widest">of 5TB Pool</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[12.4%] transition-all duration-1000" />
                        </div>
                    </div>
                </div>
            </Card>
            
            <Card className="border-none shadow-sm rounded-[3rem] bg-indigo-600 text-white p-10 relative overflow-hidden group cursor-pointer hover:shadow-indigo-200 hover:shadow-2xl transition-all">
                <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <Globe className="h-8 w-8 mb-6 text-white/40 group-hover:rotate-12 transition-transform" />
                <h3 className="text-lg font-black tracking-tight mb-2 uppercase italic tracking-tighter">Global Audit</h3>
                <p className="text-xs text-white/60 font-medium leading-relaxed mb-8">Generate a complete platform compliance report for industrial standards.</p>
                <Button className="h-12 w-full rounded-2xl bg-white text-indigo-600 font-black text-[10px] tracking-widest uppercase hover:bg-indigo-50">INITIATE EXPORT</Button>
            </Card>
        </div>
      </div>
    </div>
  );
}
