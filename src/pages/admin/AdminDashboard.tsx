import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useProfile";
import {
  Shield, Users, FileText, BarChart3, ChevronLeft,
  Truck, Star, CreditCard, Settings, LayoutDashboard, UserCog
} from "lucide-react";
import AdminOverview from "./AdminOverview";
import AdminUsers from "./AdminUsers";
import AdminLeads from "./AdminLeads";
import AdminTransport from "./AdminTransport";
import AdminReviews from "./AdminReviews";
import AdminSubscriptions from "./AdminSubscriptions";
import AdminRoles from "./AdminRoles";
import AdminAnalytics from "./AdminAnalytics";

type AdminTab = "overview" | "users" | "leads" | "transport" | "reviews" | "subscriptions" | "roles" | "analytics";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useIsAdmin();
  const [tab, setTab] = useState<AdminTab>("overview");

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
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "leads", label: "Leads", icon: FileText },
    { id: "transport", label: "Transport", icon: Truck },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "subscriptions", label: "Subs", icon: CreditCard },
    { id: "roles", label: "Roles", icon: UserCog },
    { id: "analytics", label: "Stats", icon: BarChart3 },
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

      {/* Scrollable tab bar */}
      <div className="overflow-x-auto border-b border-border bg-card">
        <div className="flex min-w-max">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-1.5 px-3 py-3 text-[11px] font-semibold transition-colors border-b-2 whitespace-nowrap ${
                tab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {tab === "overview" && <AdminOverview onNavigate={setTab} />}
        {tab === "users" && <AdminUsers />}
        {tab === "leads" && <AdminLeads />}
        {tab === "transport" && <AdminTransport />}
        {tab === "reviews" && <AdminReviews />}
        {tab === "subscriptions" && <AdminSubscriptions />}
        {tab === "roles" && <AdminRoles />}
        {tab === "analytics" && <AdminAnalytics />}
      </main>
    </div>
  );
}
