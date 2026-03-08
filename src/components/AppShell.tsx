import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, Zap, User, ChevronDown, MessageCircle } from "lucide-react";
import { useApp } from "@/lib/appContext";
import { UserRole } from "@/lib/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/my-leads", label: "My Leads", icon: FileText },
  { path: "/chats", label: "Chats", icon: MessageCircle },
  { path: "/tneb", label: "TNEB", icon: Zap },
  { path: "/profile", label: "Profile", icon: User },
];

const ALL_ROLES: UserRole[] = ["Waste Trader", "Recycling Mill", "OE Mill", "Job Worker"];

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeRole, setActiveRole, chatThreads, user } = useApp();

  const totalUnread = chatThreads.reduce((s, t) => s + t.unreadCount, 0);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-navy text-navy-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">Hi<span className="text-emerald">Tex</span></span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 text-xs font-medium bg-navy-foreground/10 rounded-full px-3 py-1.5 hover:bg-navy-foreground/20 transition-colors">
            <span className="max-w-[120px] truncate">{activeRole}</span>
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            {ALL_ROLES.map((role) => (
              <DropdownMenuItem key={role} onClick={() => setActiveRole(role)} className={activeRole === role ? "bg-accent/10 font-semibold" : ""}>
                {role}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-30">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
                {label === "Chats" && totalUnread > 0 && (
                  <span className="absolute -top-1 right-0 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                    {totalUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
