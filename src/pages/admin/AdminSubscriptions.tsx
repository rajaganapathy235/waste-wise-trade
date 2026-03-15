import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, CreditCard, CheckCircle, XCircle, Calendar } from "lucide-react";

interface UserSub {
  id: string;
  user_id: string;
  display_name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  is_subscribed: boolean | null;
  subscription_expiry: string | null;
}

export default function AdminSubscriptions() {
  const [users, setUsers] = useState<UserSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "none">("all");

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("id, user_id, display_name, business_name, email, phone, is_subscribed, subscription_expiry").order("created_at", { ascending: false });
    setUsers((data as UserSub[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggleSubscription = async (userId: string, activate: boolean) => {
    const updates: any = {
      is_subscribed: activate,
      subscription_expiry: activate
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    };
    const { error } = await supabase.from("profiles").update(updates).eq("user_id", userId);
    if (error) toast.error("Failed to update");
    else { toast.success(activate ? "Subscription activated (1 year)" : "Subscription deactivated"); fetchData(); }
  };

  const getSubStatus = (u: UserSub) => {
    if (!u.is_subscribed) return "none";
    if (u.subscription_expiry && new Date(u.subscription_expiry) < new Date()) return "expired";
    return "active";
  };

  const filtered = users.filter(u => {
    const status = getSubStatus(u);
    const matchFilter = filter === "all" || status === filter;
    const matchSearch = !search ||
      (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.business_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const activeCount = users.filter(u => getSubStatus(u) === "active").length;
  const expiredCount = users.filter(u => getSubStatus(u) === "expired").length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-foreground">{users.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Users</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-accent">{activeCount}</p>
          <p className="text-[10px] text-muted-foreground">Active Subs</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-destructive">{expiredCount}</p>
          <p className="text-[10px] text-muted-foreground">Expired</p>
        </CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 h-10 text-sm bg-secondary border-0" />
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        {(["all", "active", "expired", "none"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium capitalize transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>{f}</button>
        ))}
      </div>

      {/* User list */}
      <div className="space-y-2">
        {filtered.map(user => {
          const status = getSubStatus(user);
          return (
            <Card key={user.id} className="border-border">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-foreground truncate">{user.business_name || user.display_name || "Unknown"}</p>
                      <Badge variant={status === "active" ? "default" : status === "expired" ? "destructive" : "outline"} className="text-[10px]">
                        {status === "active" ? "Active" : status === "expired" ? "Expired" : "Free"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email || user.phone || "No contact"}</p>
                    {user.subscription_expiry && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        Expires: {new Date(user.subscription_expiry).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {status === "active" ? (
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => toggleSubscription(user.user_id, false)}>
                        <XCircle className="h-3 w-3 mr-1" /> Revoke
                      </Button>
                    ) : (
                      <Button size="sm" className="h-7 text-xs bg-accent hover:bg-accent/90" onClick={() => toggleSubscription(user.user_id, true)}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Activate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No users found</p>}
      </div>
    </div>
  );
}
