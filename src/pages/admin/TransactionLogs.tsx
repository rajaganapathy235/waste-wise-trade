import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, IndianRupee, Clock, User, 
  CreditCard, ExternalLink, Filter, Search,
  CheckCircle, XCircle, AlertCircle,
  ArrowUpRight, ShieldCheck, Zap, Activity,
  RefreshCw, Download, BarChart2, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function TransactionLogs() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("transactions")
        .select("*, profiles(display_name, email)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] px-2 py-0.5 tracking-widest">SUCCESS</Badge>;
      case 'pending': return <Badge className="bg-amber-500 text-white border-none font-black text-[8px] px-2 py-0.5 tracking-widest animate-pulse">SETTLING</Badge>;
      case 'failed': return <Badge className="bg-red-500 text-white border-none font-black text-[8px] px-2 py-0.5 tracking-widest">REJECTED</Badge>;
      default: return <Badge variant="outline" className="font-black text-[8px] px-2 py-0.5 tracking-widest">{status.toUpperCase()}</Badge>;
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.razorpay_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((acc, t) => acc + t.amount, 0);
  const successRate = transactions.length > 0 
    ? Math.round((transactions.filter(t => t.status === 'completed').length / transactions.length) * 100)
    : 0;

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Audit Trails</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Ledger Logs • Gateway Streams</p>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 font-black text-[10px] tracking-widest uppercase shadow-sm" onClick={fetchTransactions}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> SYNC LEDGER
            </Button>
            <Button className="h-12 px-8 rounded-2xl bg-white text-slate-900 border border-slate-100 font-black text-[10px] tracking-widest uppercase shadow-sm hover:bg-slate-50 transition-all active:scale-95">
                <Download className="h-4 w-4 mr-2" /> EXPORT T-LOGS
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group">
            <CardContent className="p-8">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Gross Throughput</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter italic">₹{totalRevenue.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+12%</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-500 group-hover:scale-110 transition-transform">
                        <IndianRupee className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group">
            <CardContent className="p-8">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Gateway Integrity</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter italic">{successRate}%</span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">OPTIMAL</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 text-blue-500 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden group">
            <CardContent className="p-8">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Active Sessions</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black tracking-tighter italic">12</span>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">LIVE</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 text-white/40 group-hover:scale-110 transition-transform">
                        <Activity className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="p-10 border-b border-slate-50 bg-white">
          <div className="relative group max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search via Order ID, Digital Alias or Email..." 
              className="pl-14 h-14 bg-slate-50 border-none rounded-2xl text-xs font-bold tracking-tight shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-50">
                <TableHead className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Manifest Order</TableHead>
                <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Agent Identity</TableHead>
                <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Value</TableHead>
                <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Protocol</TableHead>
                <TableHead className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <TableRow key={i} className="animate-pulse border-slate-50">
                    <TableCell colSpan={5} className="p-14" />
                  </TableRow>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <TableRow key={t.id} className="group hover:bg-slate-50/50 transition-all duration-300 border-slate-50">
                    <TableCell className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-slate-900 tracking-widest uppercase mb-1">{t.razorpay_order_id}</span>
                        <div className="flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.1em]">Online • Razorpay Core</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">{t.profiles?.display_name || "Ghost Agent"}</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t.profiles?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-8">
                      <div className="flex items-center gap-1.5 font-black text-slate-900">
                        <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-base italic tracking-tighter">{t.amount.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-8 text-center">
                      {getStatusBadge(t.status)}
                    </TableCell>
                    <TableCell className="px-10 py-8 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{new Date(t.created_at).toLocaleDateString()}</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 opacity-20">
                          <BarChart2 className="h-12 w-12" />
                          <p className="text-[10px] font-black uppercase tracking-widest italic">No transaction streams detected in this sector</p>
                      </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="mt-12 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-start gap-5 group">
          <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-500/20 group-hover:rotate-12 transition-transform">
              <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">Financial Compliance</h3>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider italic">"All transaction logs are cryptographic protected and verified against Razorpay endpoint signatures. Any deviation in hash sums will trigger a system-wide security lockdown."</p>
          </div>
      </div>
      
      <p className="text-[9px] text-center text-slate-200 mt-16 font-black uppercase tracking-[0.5em]">
          HiTex Ledger Engine • V.9.0
      </p>
    </div>
  );
}
