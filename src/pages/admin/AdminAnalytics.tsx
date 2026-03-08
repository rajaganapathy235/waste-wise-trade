import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Truck, Star, TrendingUp, Package } from "lucide-react";

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  pendingUsers: number;
  totalLeads: number;
  activeLeads: number;
  totalTransport: number;
  totalReviews: number;
  avgRating: number;
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [profiles, leads, transport, reviews] = await Promise.all([
        supabase.from("profiles").select("verification_status"),
        supabase.from("leads").select("status"),
        supabase.from("transport_requests").select("id"),
        supabase.from("reviews").select("rating"),
      ]);

      const profilesData = profiles.data || [];
      const leadsData = leads.data || [];
      const reviewsData = reviews.data || [];

      const totalRating = reviewsData.reduce((s: number, r: any) => s + (r.rating || 0), 0);

      setStats({
        totalUsers: profilesData.length,
        verifiedUsers: profilesData.filter((p: any) => p.verification_status === "verified").length,
        pendingUsers: profilesData.filter((p: any) => p.verification_status === "pending").length,
        totalLeads: leadsData.length,
        activeLeads: leadsData.filter((l: any) => l.status === "Active").length,
        totalTransport: (transport.data || []).length,
        totalReviews: reviewsData.length,
        avgRating: reviewsData.length ? totalRating / reviewsData.length : 0,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!stats) return null;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Verified Users", value: stats.verifiedUsers, icon: Users, color: "text-accent" },
    { label: "Pending Verification", value: stats.pendingUsers, icon: Users, color: "text-gold" },
    { label: "Total Leads", value: stats.totalLeads, icon: FileText, color: "text-primary" },
    { label: "Active Leads", value: stats.activeLeads, icon: TrendingUp, color: "text-accent" },
    { label: "Transport Requests", value: stats.totalTransport, icon: Truck, color: "text-primary" },
    { label: "Total Reviews", value: stats.totalReviews, icon: Star, color: "text-gold" },
    { label: "Avg Rating", value: stats.avgRating.toFixed(1), icon: Star, color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="border-border">
          <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
            <Icon className={`h-6 w-6 ${color}`} />
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
