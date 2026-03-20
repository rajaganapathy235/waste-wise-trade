import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Key, Plus, Eye, EyeOff, Copy, 
  Trash2, ShieldCheck, AlertTriangle, 
  Settings2, LucideIcon, CreditCard, Mail, Image,
  Lock, ArrowUpRight, Check, X, Terminal,
  RefreshCw, ShieldAlert, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ApiKey {
  id: string;
  service_name: string;
  key_value: string;
  metadata: any;
  created_at: string;
}

export default function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKeyId, setShowKeyId] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("api_keys")
        .select("*");

      if (error) throw error;
      setKeys(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Hashed signal copied to clipboard");
  };

  const getServiceIcon = (name: string): LucideIcon => {
    const n = name.toLowerCase();
    if (n.includes('razorpay')) return CreditCard;
    if (n.includes('resend') || n.includes('smtp')) return Mail;
    if (n.includes('supabase')) return ShieldCheck;
    if (n.includes('cloudinary') || n.includes('storage')) return Image;
    return Key;
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Vault Access</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Credential Grid • Backend Oracles</p>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 font-black text-[10px] tracking-widest uppercase shadow-sm" onClick={fetchKeys}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> SCAN GRID
            </Button>
            <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-black text-[10px] tracking-widest uppercase shadow-xl shadow-primary/20 active:scale-95 transition-all">
                <Plus className="h-4 w-4 mr-2" /> ENROLL SERVICE
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          [1, 2, 3, 4].map(i => <Card key={i} className="h-56 animate-pulse border-none shadow-xl rounded-[3rem] bg-white" />)
        ) : keys.length > 0 ? (
          keys.map((k) => {
            const Icon = getServiceIcon(k.service_name);
            return (
              <Card key={k.id} className="border-none shadow-2xl rounded-[3.5rem] bg-white overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                <CardHeader className="p-10 pb-6 border-b border-slate-50 relative">
                  <div className="flex items-center justify-between z-10 relative">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black text-slate-800 tracking-tighter uppercase mb-0.5">{k.service_name}</CardTitle>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none italic">
                          SECURED SINCE {new Date(k.created_at).getFullYear()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] tracking-[0.2em] px-3 py-1.5 rounded-full">
                      ACTIVE LINK
                    </Badge>
                  </div>
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                      <Cpu className="h-24 w-24" />
                  </div>
                </CardHeader>
                
                <CardContent className="p-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Primary Cipher</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-4"
                          onClick={() => setShowKeyId(showKeyId === k.id ? null : k.id)}
                        >
                          {showKeyId === k.id ? <><EyeOff className="h-3.5 w-3.5 mr-2" /> Conceal</> : <><Eye className="h-3.5 w-3.5 mr-2" />揭露 Manifest</>}
                        </Button>
                      </div>
                      <div className="relative group/input">
                        <Input 
                          type={showKeyId === k.id ? "text" : "password"} 
                          value={k.key_value} 
                          readOnly 
                          className="font-mono text-xs px-6 h-14 bg-slate-50 border-none rounded-2xl shadow-inner select-all text-slate-900 font-bold"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-400 opacity-0 group-hover/input:opacity-100 transition-opacity bg-white/50 backdrop-blur rounded-xl border border-slate-100"
                          onClick={() => copyToClipboard(k.key_value)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {k.metadata && Object.keys(k.metadata).length > 0 && (
                      <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50">
                        {Object.entries(k.metadata).map(([key, val]: [string, any]) => (
                          <div key={key} className="space-y-1.5">
                            <Label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{key}</Label>
                            <p className="text-xs font-black text-slate-700 truncate tracking-tight uppercase italic">{val.toString().slice(0, 15)}...</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-8 pt-0 flex justify-end gap-3 bg-slate-50/20">
                  <Button variant="ghost" className="h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white hover:text-slate-900 transition-all">
                    <Settings2 className="h-4 w-4 mr-2" /> CONFIGURE
                  </Button>
                  <Button variant="ghost" className="h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
                    <Trash2 className="h-4 w-4 mr-2" /> PURGE
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border border-dashed border-slate-100 shadow-sm px-10 group cursor-pointer hover:border-primary/20 transition-all">
            <div className="h-24 w-24 rounded-[3rem] bg-slate-50 flex items-center justify-center mx-auto mb-8 text-slate-200 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                <Lock className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase mb-2">Vault is Depleted</h3>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-relaxed italic">System oracles require credential mapping<br/>to initiate autonomous sector operations.</p>
          </div>
        )}
      </div>

      <div className="mt-12 p-10 bg-indigo-600 rounded-[3.5rem] text-white flex items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
              <Terminal className="h-32 w-32" />
          </div>
          <div className="p-5 rounded-3xl bg-white/10 text-white backdrop-blur-xl shrink-0 shadow-2xl">
              <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="relative z-10">
              <h3 className="text-lg font-black tracking-tight mb-1 uppercase italic tracking-tighter">Security Protocol L4</h3>
              <p className="text-xs font-medium text-white/50 leading-relaxed uppercase tracking-widest max-w-2xl"> credentials stored in the HiTex Vault are AES-256 encrypted at rest. NEVER expose backend oracles (Resend Secret, Razorpay Secret) to client-side components. Use the <span className="text-white font-black italic">Server Protocol Mesh</span> for all secure relay operations.</p>
          </div>
      </div>
      
      <p className="text-[9px] text-center text-slate-200 mt-16 font-black uppercase tracking-[0.5em]">
          HiTex Oracle Vault • V.4.2.1
      </p>
    </div>
  );
}
