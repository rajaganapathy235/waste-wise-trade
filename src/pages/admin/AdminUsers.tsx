import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  location: string | null;
  verification_status: string | null;
  is_subscribed: boolean | null;
  trust_score: number | null;
  created_at: string;
}

interface UserRole {
  role: "admin" | "trader" | "transporter" | "manufacturer";
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Record<string, UserRole[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  const fetchData = async () => {
    setLoading(true);
    const { data: profilesData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: rolesData } = await supabase.from("user_roles").select("*");

    setProfiles((profilesData as UserProfile[]) || []);

    const roleMap: Record<string, UserRole[]> = {};
    (rolesData || []).forEach((r: any) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push({ role: r.role });
    });
    setRoles(roleMap);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateVerification = async (userId: string, status: "verified" | "rejected") => {
    const { error } = await supabase
      .from("profiles")
      .update({ verification_status: status })
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`User ${status}`);
      fetchData();
    }
  };

  const filtered = profiles.filter(p => {
    const matchFilter = filter === "all" || p.verification_status === filter;
    const matchSearch = !search ||
      (p.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.business_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusIcon = (status: string | null) => {
    switch (status) {
      case "verified": return <CheckCircle className="h-4 w-4 text-accent" />;
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      case "pending": return <Clock className="h-4 w-4 text-gold" />;
      default: return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const FILTERS = ["all", "pending", "verified", "rejected"] as const;

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-foreground">{profiles.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Users</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-gold">{profiles.filter(p => p.verification_status === "pending").length}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <p className="text-lg font-bold text-accent">{profiles.filter(p => p.verification_status === "verified").length}</p>
          <p className="text-[10px] text-muted-foreground">Verified</p>
        </CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 h-10 text-sm bg-secondary border-0" />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >{f}</button>
        ))}
      </div>

      {/* User list */}
      <div className="space-y-2">
        {filtered.map(profile => (
          <Card key={profile.id} className="border-border">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {statusIcon(profile.verification_status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">
                      {profile.business_name || profile.display_name || "Unknown"}
                    </p>
                    <Badge variant={profile.verification_status === "verified" ? "default" : profile.verification_status === "pending" ? "secondary" : "destructive"} className="text-[10px]">
                      {profile.verification_status || "none"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{profile.email || profile.phone || "No contact"}</p>
                  {profile.gstin && <p className="text-[10px] text-muted-foreground">GSTIN: {profile.gstin}</p>}
                  {profile.location && <p className="text-[10px] text-muted-foreground">📍 {profile.location}</p>}

                  {/* Roles */}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(roles[profile.user_id] || []).map((r, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{r.role}</Badge>
                    ))}
                  </div>

                  {/* Actions for pending users */}
                  {profile.verification_status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="h-7 text-xs bg-accent hover:bg-accent/90" onClick={() => updateVerification(profile.user_id, "verified")}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => updateVerification(profile.user_id, "rejected")}>
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No users found</p>}
      </div>
    </div>
  );
}
