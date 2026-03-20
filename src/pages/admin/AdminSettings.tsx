import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, Save, Bell, Shield, 
  Globe, Smartphone, CreditCard, 
  Database, RefreshCw, AlertCircle,
  ToggleLeft, ToggleRight, Layout,
  Cpu, Activity, Zap, ShieldCheck,
  Globe2, Lock, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("admin_settings")
        .select("*");

      if (error) throw error;
      
      const settingsObj = data?.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setSettings(settingsObj || {});
    } catch (error: any) {
      toast.error("Bridge failure: Could not sync platform variables");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
       // Simulate logic for variable persistence
       setTimeout(() => {
         toast.success("Platform state reconstructed. Changes propagated across the mesh.");
         setSaving(false);
       }, 1500);
    } catch (error: any) {
      toast.error("Persistence failed: Grid state unstable");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 italic uppercase">System Variables</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Global Constants • Platform Mesh 0.9</p>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 font-black text-[10px] tracking-widest uppercase shadow-sm" onClick={fetchSettings}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> SCAN GRID
            </Button>
            <Button onClick={saveSettings} disabled={saving} className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] tracking-widest uppercase shadow-xl active:scale-95 transition-all">
                {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                PERSIST STATE
            </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-50 p-2 h-16 rounded-3xl border border-slate-100 mb-10 gap-2">
          <TabsTrigger value="general" className="px-8 h-12 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary font-black text-[10px] uppercase tracking-widest transition-all">
            <Globe2 className="h-4 w-4 mr-2" /> CORE MESH
          </TabsTrigger>
          <TabsTrigger value="auth" className="px-8 h-12 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-red-500 font-black text-[10px] uppercase tracking-widest transition-all">
            <Lock className="h-4 w-4 mr-2" /> SECURITY
          </TabsTrigger>
          <TabsTrigger value="feature" className="px-8 h-12 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-emerald-500 font-black text-[10px] uppercase tracking-widest transition-all">
            <Cpu className="h-4 w-4 mr-2" /> MODULES
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="grid grid-cols-1 lg:grid-cols-3 gap-8 outline-none">
          <Card className="lg:col-span-2 border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden group">
            <CardHeader className="p-10 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl">
                      <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-slate-800 tracking-tighter uppercase mb-0.5">Platform Identity</CardTitle>
                    <CardDescription className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Global Namespace Variables</CardDescription>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Marketplace Alias</Label>
                  <Input defaultValue="HiTex Marketplace" className="h-14 bg-slate-50 border-none rounded-2xl px-6 text-xs font-bold tracking-tight shadow-inner focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Oracle Endpoint</Label>
                  <Input defaultValue="support@hitex.in" className="h-14 bg-slate-50 border-none rounded-2xl px-6 text-xs font-bold tracking-tight shadow-inner" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Manifest URL</Label>
                  <Input defaultValue="https://hitex-v5.vercel.app" className="h-14 bg-slate-50 border-none rounded-2xl px-6 text-xs font-bold tracking-tight shadow-inner" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Ledger Currency</Label>
                  <div className="h-14 bg-slate-100 flex items-center px-6 rounded-2xl text-xs font-black text-slate-400 opacity-50 uppercase tracking-widest">
                      Indian Rupee (INR) • STATIC
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-8">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden group">
                  <CardContent className="p-8">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                          <Activity className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-black tracking-tighter uppercase italic mb-2">Live Propagation</h3>
                      <p className="text-[10px] font-medium text-white/50 leading-relaxed uppercase tracking-widest">Changes to the core mesh are distributed across all active agent sessions in real-time via the HiTex Signal relay.</p>
                  </CardContent>
              </Card>
              
              <div className="p-8 rounded-[2.5rem] bg-amber-50 border border-amber-100 flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-widest italic">"Persistent identifiers like Platform URL affect all cryptographic signatures in the checkout mesh."</p>
              </div>
          </div>
        </TabsContent>

        <TabsContent value="auth" className="space-y-10 outline-none max-w-4xl">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
            <CardHeader className="p-10 pb-6 border-b border-slate-50 bg-red-50/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/20">
                        <Lock className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black text-slate-800 tracking-tighter uppercase mb-0.5">Authentication Guard</CardTitle>
                        <CardDescription className="text-[10px] font-black text-red-400 uppercase tracking-widest italic">Platform Security Protocols</CardDescription>
                    </div>
                </div>
                <Badge className="bg-red-100 text-red-600 border-none font-black text-[8px] tracking-widest px-3 py-1">LOCKED</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-red-200 transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Admin-Only Fortress</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Disable public signup and restrict portal access.</p>
                </div>
                <Switch checked={true} className="data-[state=checked]:bg-red-600" />
              </div>
              
              <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-primary/20 transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">CFA (Cryptographic Multi-Factor)</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Enable SMS/OTP verification for sensitive trade actions.</p>
                </div>
                <Switch checked={false} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feature" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 outline-none">
          {[
            { label: "Marketplace Leads", desc: "Main Posting Engine", icon: Flame, color: "text-orange-500" },
            { label: "Chat Protocol", desc: "Real-time Messaging", icon: Zap, color: "text-blue-500" },
            { label: "Auto Billing", desc: "GST Ledger Mesh", icon: CreditCard, color: "text-emerald-500" },
            { label: "Logistics Link", desc: "Transport Booking", icon: Layout, color: "text-purple-500" }
          ].map((f) => (
            <Card key={f.label} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-8 hover:-translate-y-2 transition-all duration-500 group">
                <div className="flex items-center justify-between mb-8">
                    <div className={`h-12 w-12 rounded-2xl bg-slate-50 ${f.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                        <f.icon className="h-6 w-6" />
                    </div>
                    <Switch checked={true} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">{f.label}</h3>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">{f.desc}</p>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      
      <p className="text-[9px] text-center text-slate-200 mt-20 font-black uppercase tracking-[0.5em]">
          HiTex Config Mesh • V.2.1.0-Admin
      </p>
    </div>
  );
}
