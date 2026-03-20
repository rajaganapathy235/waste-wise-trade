import { useState } from "react";
import { 
  Users, UserPlus, Shield, ShieldAlert, 
  MoreVertical, Edit2, Trash2, CheckCircle2, XCircle,
  Search, Filter, ShieldCheck, Mail, Phone, Calendar,
  Ban, Loader2, UserCheck, UserX, ExternalLink, BadgeCheck, Activity
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAllUsers, useUpdateUserStatus } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";

export default function UserManager() {
  const { data: usersData, isLoading, refetch } = useAllUsers();
  const users = (usersData as any[]) || [];
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateUserStatus();
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggleAdmin = async (userId: string, currentRoles: any[]) => {
    const isAdmin = currentRoles.some(r => r.role === 'admin');
    try {
      if (isAdmin) {
        await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
        toast.success("Admin privileges revoked");
      } else {
        await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
        toast.success("Admin privileges granted");
      }
      refetch();
    } catch (error: any) {
      toast.error("Action failed: Schema restriction apply");
    }
  };

  const handleVerify = (userId: string, status: 'verified' | 'rejected') => {
    updateStatus({ userId, status }, {
        onSuccess: () => {
            toast.success(`User marked as ${status}`);
        },
        onError: (err: any) => toast.error(err.message)
    });
  };

  const filteredUsers = users.filter(u => 
    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Trader Ecosystem</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Registry Management • Phase 4 Governance</p>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 font-black text-[10px] tracking-widest uppercase shadow-sm">
                <Filter className="h-4 w-4 mr-2" /> ADVANCED FILTERS
            </Button>
            <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-black text-[10px] tracking-widest uppercase shadow-xl shadow-primary/20 active:scale-95 transition-all">
                <UserPlus className="h-4 w-4 mr-2" /> PROVISION ACCESS
            </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="p-10 border-b border-slate-50 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Locate trader by name, digital ID or phone..." 
                className="pl-14 h-14 bg-slate-50 border-none rounded-2xl text-xs font-bold tracking-tight shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-6 pr-4">
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">TOTAL AGENTS</p>
                    <p className="text-xl font-black text-slate-900 leading-none">{users.length}</p>
                </div>
                <div className="h-10 w-[1px] bg-slate-100" />
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">ADMIN NODES</p>
                    <p className="text-xl font-black text-primary leading-none">{users.filter((u: any) => u.user_roles?.some((r: any) => r.role === 'admin')).length}</p>
                </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-50">
                <TableHead className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trader Identity</TableHead>
                <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Communication</TableHead>
                <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Tier</TableHead>
                <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</TableHead>
                <TableHead className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <TableRow key={i} className="animate-pulse border-slate-50">
                    <TableCell colSpan={5} className="p-10">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50" />
                            <div className="space-y-2">
                                <div className="h-4 w-40 bg-slate-50 rounded" />
                                <div className="h-2 w-20 bg-slate-50 rounded" />
                            </div>
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="group hover:bg-slate-50/50 transition-all duration-300 border-slate-50">
                    <TableCell className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-xl overflow-hidden group-hover:scale-110 transition-transform duration-500">
                          {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                              u.display_name?.charAt(0) || u.email?.charAt(0) || "?"
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-base leading-none mb-1.5 tracking-tight group-hover:text-primary transition-colors">
                            {u.display_name || "Anonymous Trader"}
                          </p>
                          <div className="flex items-center gap-2">
                              {u.is_subscribed && <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[8px] px-2 py-0 h-5">PREMIUM</Badge>}
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Since {new Date(u.created_at).getFullYear()}</p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs truncate max-w-[200px]">
                            <Mail className="h-3 w-3 text-slate-300" /> {u.email}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] tracking-tight">
                            <Phone className="h-3 w-3 text-slate-300" /> {u.phone || "VOICE NOT MAPPED"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-8">
                      <div className="flex flex-wrap gap-1.5">
                        {u.user_roles?.map((r: any) => (
                          <Badge 
                            key={r.role} 
                            className={`text-[9px] font-black px-3 py-1 rounded-lg border-none tracking-widest uppercase transition-all ${
                              r.role === 'admin' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {r.role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        {u.verification_status === 'verified' ? (
                            <div className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center gap-2 border border-emerald-100">
                                <BadgeCheck className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Trust Level 1</span>
                            </div>
                        ) : u.verification_status === 'rejected' ? (
                            <div className="px-4 py-2 rounded-2xl bg-red-50 text-red-600 flex items-center gap-2 border border-red-100">
                                <UserX className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Restricted</span>
                            </div>
                        ) : (
                            <div className="px-4 py-2 rounded-2xl bg-amber-50 text-amber-600 flex items-center gap-2 border border-amber-100 animate-pulse">
                                <Activity className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Scan Logic</span>
                            </div>
                        )}
                        {u.trust_score > 0 && (
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">SCORE: {u.trust_score}%</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-10 py-8 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-3 rounded-[2rem] shadow-2xl border-none bg-white">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Control Methods</p>
                          
                          <DropdownMenuItem className="p-4 rounded-xl gap-4 cursor-pointer hover:bg-slate-50 group">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                <Edit2 className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-800 tracking-tight">Edit Profile</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Update Identity</span>
                            </div>
                          </DropdownMenuItem>

                          <DropdownMenuItem 
                            className="p-4 rounded-xl gap-4 cursor-pointer hover:bg-slate-50 group"
                            onClick={() => handleToggleAdmin(u.id, u.user_roles || [])}
                          >
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${u.user_roles?.some((r: any) => r.role === 'admin') ? "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white" : "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white"}`}>
                                {u.user_roles?.some((r: any) => r.role === 'admin') ? <ShieldAlert className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-800 tracking-tight">{u.user_roles?.some((r: any) => r.role === 'admin') ? 'Revoke Admin' : 'Grant Admin'}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Security Protocol</span>
                            </div>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="my-2 bg-slate-50" />
                          
                          {u.verification_status !== 'verified' && (
                             <DropdownMenuItem 
                                className="p-4 rounded-xl gap-4 cursor-pointer hover:bg-emerald-50 group"
                                onClick={() => handleVerify(u.id, 'verified')}
                             >
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <UserCheck className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-800 tracking-tight">Approve Verification</span>
                                    <span className="text-[10px] text-emerald-500 font-bold uppercase">Pass Audit</span>
                                </div>
                             </DropdownMenuItem>
                          )}

                          <DropdownMenuItem className="p-4 rounded-xl gap-4 cursor-pointer hover:bg-red-50 group">
                            <div className="h-10 w-10 rounded-xl bg-red-50 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                                <Ban className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-red-600 group-hover:text-white tracking-tight">Deactivate Agent</span>
                                <span className="text-[10px] text-red-400 font-bold uppercase">Kill Signal</span>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 opacity-20">
                          <Users className="h-12 w-12" />
                          <p className="text-[10px] font-black uppercase tracking-widest italic">No active nodes found in this sector</p>
                      </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <p className="text-[9px] text-center text-slate-200 mt-16 font-black uppercase tracking-[0.5em]">
          HiTex Registry Mesh • Live Audit Track
      </p>
    </div>
  );
}
