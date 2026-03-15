import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useProfile";
import { Shield, Users, FileText, BarChart3, ChevronLeft } from "lucide-react";
import AdminUsers from "./AdminUsers";
import AdminLeads from "./AdminLeads";
import AdminAnalytics from "./AdminAnalytics";

type AdminTab = "users" | "leads" | "analytics";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useIsAdmin();
  const [tab, setTab] = useState<AdminTab>("users");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6">
        <Shield className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">You don't have admin privileges.</p>
        <button onClick={() => navigate("/")} className="text-sm text-primary font-semibold">← Back to Home</button>
      </div>
    );
  }

  const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "users", label: "Users", icon: Users },
    { id: "leads", label: "Content", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-navy text-navy-foreground px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-1 rounded-lg hover:bg-navy-foreground/10">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <Shield className="h-5 w-5" />
        <h1 className="text-base font-bold">Admin Panel</h1>
      </header>

      {/* Tab bar */}
      <div className="flex border-b border-border bg-card">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors border-b-2 ${
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {tab === "users" && <AdminUsers />}
        {tab === "leads" && <AdminLeads />}
        {tab === "analytics" && <AdminAnalytics />}
      </main>
    </div>
  );
}
