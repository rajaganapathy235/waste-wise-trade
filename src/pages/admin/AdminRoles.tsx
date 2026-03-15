import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Shield, Plus, X, UserCog } from "lucide-react";

const ALL_ROLES = ["admin", "trader", "transporter", "manufacturer"] as const;
type AppRole = typeof ALL_ROLES[number];

interface UserWithRoles {
  id: string;
  user_id: string;
  display_name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  roles: AppRole[];
}

export default function AdminRoles() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("id, user_id, display_name, business_name, email, phone").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);

    const roleMap: Record<string, AppRole[]> = {};
    (rolesRes.data || []).forEach((r: any) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    });

    const merged = (profilesRes.data || []).map((p: any) => ({
      ...p,
      roles: roleMap[p.user_id] || [],
    }));

    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) {
      if (error.code === "23505") toast.error("Role already exists");
      else toast.error("Failed to add role");
    } else {
      toast.success(`Added ${role} role`);
      fetchData();
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) toast.error("Failed to remove role");
    else { toast.success(`Removed ${role} role`); fetchData(); }
  };

  const filtered = users.filter(u => {
    const matchFilter = roleFilter === "all" || u.roles.includes(roleFilter);
    const matchSearch = !search ||
      (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.business_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const roleCounts = ALL_ROLES.reduce((acc, role) => {
    acc[role] = users.filter(u => u.roles.includes(role)).length;
    return acc;
  }, {} as Record<AppRole, number>);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      {/* Role stats */}
      <div className="grid grid-cols-4 gap-2">
        {ALL_ROLES.map(role => (
          <Card key={role} className="border-border">
            <CardContent className="p-2 text-center">
              <p className="text-lg font-bold text-foreground">{roleCounts[role]}</p>
              <p className="text-[9px] text-muted-foreground capitalize">{role}s</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 h-10 text-sm bg-secondary border-0" />
      </div>

      {/* Filter by role */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setRoleFilter("all")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
            roleFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}>All</button>
        {ALL_ROLES.map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium capitalize transition-colors whitespace-nowrap ${
              roleFilter === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>{r}</button>
        ))}
      </div>

      {/* User list with role management */}
      <div className="space-y-2">
        {filtered.map(user => (
          <Card key={user.id} className="border-border">
            <CardContent className="p-3">
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm font-bold text-foreground truncate">{user.business_name || user.display_name || "Unknown"}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{user.email || user.phone || "No contact"}</p>
              </div>

              {/* Current roles */}
              <div className="flex gap-1.5 flex-wrap mb-2">
                {user.roles.length === 0 && <span className="text-[10px] text-muted-foreground italic">No roles assigned</span>}
                {user.roles.map(role => (
                  <Badge key={role} variant={role === "admin" ? "destructive" : "default"} className="text-[10px] gap-1 pr-1">
                    {role === "admin" && <Shield className="h-2.5 w-2.5" />}
                    {role}
                    <button onClick={() => removeRole(user.user_id, role)} className="ml-0.5 hover:bg-foreground/20 rounded-full p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Add roles */}
              <div className="flex gap-1 flex-wrap">
                {ALL_ROLES.filter(r => !user.roles.includes(r)).map(role => (
                  <Button key={role} size="sm" variant="outline" className="h-6 text-[10px] px-2 capitalize" onClick={() => addRole(user.user_id, role)}>
                    <Plus className="h-2.5 w-2.5 mr-0.5" /> {role}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No users found</p>}
      </div>
    </div>
  );
}
