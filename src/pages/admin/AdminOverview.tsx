import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Truck, Star, CreditCard, Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface OverviewStats {
  totalUsers: number;
  pendingVerification: number;
  activeLeads: number;
  pendingTransport: number;
  totalReviews: number;
  subscribedUsers: number;
  recentUsers: any[];
  recentLeads: any[];
}

interface Props {
  onNavigate: (tab: any) => void;
}

export default function AdminOverview({ onNavigate }: Props) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [profiles, leads, transport, reviews] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("transport_requests").select("status"),
        supabase.from("reviews").select("id"),
      ]);

      const profilesData = profiles.data || [];
      const leadsData = leads.data || [];

      setStats({
        totalUsers: profilesData.length,
        pendingVerification: profilesData.filter((p: any) => p.verification_status === "pending").length,
        activeLeads: leadsData.filter((l: any) => l.status === "Active").length,
        pendingTransport: (transport.data || []).filter((t: any) => t.status === "Pending").length,
        totalReviews: (reviews.data || []).length,
        subscribedUsers: profilesData.filter((p: any) => p.is_subscribed).length,
        recentUsers: profilesData.slice(0, 5),
        recentLeads: leadsData.slice(0, 5),
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!stats) return null;

  const quickStats = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary", tab: "users" },
    { label: "Pending Verify", value: stats.pendingVerification, icon: AlertTriangle, color: "text-gold", tab: "users" },
    { label: "Active Leads", value: stats.activeLeads, icon: FileText, color: "text-accent", tab: "leads" },
    { label: "Pending Transport", value: stats.pendingTransport, icon: Truck, color: "text-primary", tab: "transport" },
    { label: "Reviews", value: stats.totalReviews, icon: Star, color: "text-gold", tab: "reviews" },
    { label: "Subscribers", value: stats.subscribedUsers, icon: CreditCard, color: "text-accent", tab: "subscriptions" },
  ];

  return (
    <div className="space-y-4">
      {/* Quick stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {quickStats.map(({ label, value, icon: Icon, color, tab }) => (
          <Card key={label} className="border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate(tab)}>
            <CardContent className="p-3 text-center">
              <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Users */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground">Recent Users</h3>
          <button onClick={() => onNavigate("users")} className="text-xs text-primary font-medium">View all →</button>
        </div>
        <div className="space-y-1.5">
          {stats.recentUsers.map((user: any) => (
            <div key={user.id} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user.business_name || user.display_name || "Unknown"}</p>
                <p className="text-[10px] text-muted-foreground">{user.email || user.phone || "No contact"}</p>
              </div>
              <Badge variant={user.verification_status === "verified" ? "default" : user.verification_status === "pending" ? "secondary" : "outline"} className="text-[10px] shrink-0">
                {user.verification_status || "none"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leads */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground">Recent Leads</h3>
          <button onClick={() => onNavigate("leads")} className="text-xs text-primary font-medium">View all →</button>
        </div>
        <div className="space-y-1.5">
          {stats.recentLeads.map((lead: any) => (
            <div key={lead.id} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{lead.material_type}</p>
                <p className="text-[10px] text-muted-foreground">₹{lead.price_per_kg}/kg · {lead.quantity}kg · {lead.poster_name || "Unknown"}</p>
              </div>
              <Badge variant={lead.status === "Active" ? "default" : "secondary"} className="text-[10px] shrink-0">
                {lead.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
