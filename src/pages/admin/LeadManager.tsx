import { useState } from "react";
import { 
  ShoppingBag, CheckCircle, XCircle, Clock, 
  MapPin, Scale, IndianRupee, Eye, Trash2, 
  AlertCircle, Filter, Search, Tag, 
  ArrowUpRight, ShieldCheck, Zap, MoreVertical,
  Loader2, Check, X, ShieldAlert, BarChart3, Layers
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminLeads, useUpdateLeadStatus } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LeadManager() {
  const navigate = useNavigate();
  const { data: leads = [], isLoading } = useAdminLeads();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateLeadStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleUpdateStatus = (leadId: string, status: string) => {
    updateStatus({ leadId, status }, {
      onSuccess: () => {
        toast.success(`Trade node status updated to ${status}`);
      },
      onError: (err: any) => toast.error(err.message)
    });
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.material_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.poster_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.location_district?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && l.status?.toLowerCase() === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] px-2 py-0.5 tracking-widest">ACTIVE</Badge>;
      case 'sold': return <Badge className="bg-slate-900 text-white border-none font-black text-[8px] px-2 py-0.5 tracking-widest">TERMINATED</Badge>;
      case 'pending': return <Badge className="bg-amber-500 text-white border-none font-black text-[8px] px-2 py-0.5 tracking-widest animate-pulse">PENDING</Badge>;
      case 'rejected': return <Badge className="bg-red-500 text-white border-none font-black text-[8px] px-2 py-0.5 tracking-widest">BLOCKED</Badge>;
      default: return <Badge variant="outline" className="font-black text-[8px] px-2 py-0.5 tracking-widest">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Trade Inventory</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Ledger Moderation • Real-time Market Guard</p>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 font-black text-[10px] tracking-widest uppercase shadow-sm">
                <BarChart3 className="h-4 w-4 mr-2" /> VOLUMETRIC ANALYSIS
            </Button>
            <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-black text-[10px] tracking-widest uppercase shadow-xl shadow-primary/20 active:scale-95 transition-all">
                <Layers className="h-4 w-4 mr-2" /> BULK MODERATION
            </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 h-14 w-full md:w-auto">
            <TabsTrigger value="all" className="h-full px-6 rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all">All Nodes</TabsTrigger>
            <TabsTrigger value="pending" className="h-full px-6 rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all">Awaiting Review</TabsTrigger>
            <TabsTrigger value="active" className="h-full px-6 rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all">Live Inventory</TabsTrigger>
            <TabsTrigger value="sold" className="h-full px-6 rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all">Terminated</TabsTrigger>
          </TabsList>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search via material, district or poster..." 
              className="pl-14 h-14 bg-white border-none rounded-2xl text-xs font-bold tracking-tight shadow-sm focus:ring-2 ring-primary/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-50">
                    <TableHead className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Material & Origin</TableHead>
                    <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trade Specs</TableHead>
                    <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Market Value</TableHead>
                    <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Protocol State</TableHead>
                    <TableHead className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Moderation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <TableRow key={i} className="animate-pulse border-slate-50">
                        <TableCell colSpan={5} className="p-14" />
                      </TableRow>
                    ))
                  ) : filteredLeads.length > 0 ? (
                    filteredLeads.map((l) => (
                      <TableRow key={l.id} className="group hover:bg-slate-50/50 transition-all duration-300 border-slate-50">
                        <TableCell className="px-10 py-8">
                          <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                <ShoppingBag className="h-7 w-7" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-base text-slate-800 tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">{l.material_type}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{l.category}</span>
                                    <div className="h-1 w-1 rounded-full bg-slate-200" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">{l.poster_name || "OFF-PLATE"}</span>
                                </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-8">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                              <MapPin className="h-3.5 w-3.5 text-slate-300" /> {l.location_district}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                              <Clock className="h-3.5 w-3.5 text-slate-300" /> INITIATED {new Date(l.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-8">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-900 font-black">
                              <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-lg tracking-tighter">₹{l.price_per_kg}</span>
                              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest ml-1">SET POINT</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                              <Scale className="h-3.5 w-3.5 opacity-20" /> {l.quantity.toLocaleString()} KG MEASURE
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            {getStatusBadge(l.status)}
                            <p className="text-[8px] font-black text-slate-200 uppercase tracking-widest">Integrity Check v.2</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {l.status === 'pending' && (
                                <div className="flex items-center gap-2 mr-2">
                                    <Button 
                                        size="icon" 
                                        className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95"
                                        onClick={() => handleUpdateStatus(l.id, 'active')}
                                        disabled={isUpdating}
                                    >
                                        <Check className="h-5 w-5" />
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        className="h-10 w-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                                        onClick={() => handleUpdateStatus(l.id, 'rejected')}
                                        disabled={isUpdating}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            )}
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900 rounded-xl">
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-none bg-white">
                                    <DropdownMenuItem className="p-3 gap-3 rounded-xl cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/leads/${l.id}`)}>
                                        <Eye className="h-4 w-4 text-slate-400" />
                                        <span className="text-xs font-black uppercase tracking-widest">Inspect Node</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="p-3 gap-3 rounded-xl cursor-pointer hover:bg-slate-50" onClick={() => handleUpdateStatus(l.id, 'sold')}>
                                        <Zap className="h-4 w-4 text-amber-500" />
                                        <span className="text-xs font-black uppercase tracking-widest text-amber-600">Mark Terminated</span>
                                    </DropdownMenuItem>
                                    <div className="h-[1px] bg-slate-50 my-1" />
                                    <DropdownMenuItem className="p-3 gap-3 rounded-xl cursor-pointer hover:bg-red-50 group">
                                        <Trash2 className="h-4 w-4 text-red-400 group-hover:text-red-600" />
                                        <span className="text-xs font-black uppercase tracking-widest text-red-400 group-hover:text-red-600">Delete Permanently</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center gap-4 opacity-20">
                              <ShoppingBag className="h-12 w-12" />
                              <p className="text-[10px] font-black uppercase tracking-widest italic">No trade nodes detected in this sector</p>
                          </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <p className="text-[9px] text-center text-slate-200 mt-16 font-black uppercase tracking-[0.5em]">
          HiTex Market Sentinel • Real-time Monitoring
      </p>
    </div>
  );
}
