import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowRight, Loader2, Lock, Zap, ShieldAlert, Cpu } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        toast.error("Bridge failure: Insufficient security clearance");
        return;
      }

      toast.success("Identity verified. Oracle uplink established.");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Uplink failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 p-40 opacity-10 blur-[120px] bg-primary rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 p-40 opacity-10 blur-[120px] bg-indigo-600 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <Card className="w-full max-w-[440px] border-none shadow-[0_32px_128px_rgba(0,0,0,0.5)] rounded-[3rem] bg-white/5 backdrop-blur-2xl ring-1 ring-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
            
            <CardHeader className="p-12 pb-6 flex flex-col items-center relative z-10">
                <div className="h-20 w-20 rounded-[2.5rem] bg-primary text-white flex items-center justify-center mb-8 shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500 relative">
                    <Shield className="h-10 w-10" />
                    <div className="absolute inset-0 rounded-[2.5rem] bg-primary animate-ping opacity-20 scale-125" />
                </div>
                <CardTitle className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">Gate <span className="text-primary truncate">Keeper</span></CardTitle>
                <CardDescription className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Oracle Command Nexus • Lvl 4</CardDescription>
            </CardHeader>
            
            <CardContent className="p-12 pt-6 relative z-10">
                <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-3">
                        <Label htmlFor="email" className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-2 italic">Access Identity</Label>
                        <div className="relative group/input">
                            <Input
                                id="email"
                                type="email"
                                placeholder="ADMIN@HITEX.MESH"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-16 bg-white/5 border-none rounded-2xl px-6 text-xs font-black text-white placeholder:text-white/10 uppercase tracking-widest shadow-inner focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-focus-within/input:text-primary transition-colors">
                                <Cpu className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-2">
                            <Label htmlFor="password" className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic">Access Cipher</Label>
                        </div>
                        <div className="relative group/input">
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-16 bg-white/5 border-none rounded-2xl px-6 text-xs font-black text-white placeholder:text-white/10 tracking-[0.5em] shadow-inner focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                            />
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-focus-within/input:text-primary transition-colors">
                                <Lock className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                    
                    <Button 
                        type="submit" 
                        className="w-full h-18 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 group/btn overflow-hidden relative py-8"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-3 relative z-10 italic">
                                Initiate Uplink <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-2" />
                            </span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    </Button>
                </form>
                
                <div className="mt-12 p-6 bg-red-950/20 rounded-[2.5rem] border border-red-900/10 flex items-start gap-4">
                    <ShieldAlert className="h-5 w-5 text-red-500/40 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-red-500/40 leading-relaxed uppercase tracking-widest italic">"Unauthorized entry into the Command Nexus will trigger a cryptographic security lockdown and hardware-level audit logs."</p>
                </div>
            </CardContent>
            
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary/20 overflow-hidden">
                <div className="h-full bg-primary w-1/3 animate-[shimmer_2s_infinite]" />
            </div>
        </Card>
        
        <p className="absolute bottom-8 text-[9px] font-black text-white/10 uppercase tracking-[0.8em]">HiTex Oracle Mesh • SecLvl-4 Integrity</p>
    </div>
  );
}
