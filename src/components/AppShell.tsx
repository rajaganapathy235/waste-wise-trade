import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, Wrench, User, MoreHorizontal, MessageCircle, Globe } from "lucide-react";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chatThreads } = useApp();
  const { t, lang, setLang, languages } = useI18n();

  const totalUnread = chatThreads.reduce((s, t) => s + t.unreadCount, 0);

  const NAV_ITEMS = [
    { path: "/", label: t("nav.home"), icon: Home },
    { path: "/my-leads", label: t("nav.myLeads"), icon: FileText },
    { path: "/chats", label: t("nav.chats"), icon: MessageCircle },
    { path: "/job-work", label: t("nav.jobWork"), icon: Wrench },
    { path: "/services", label: t("nav.services"), icon: Grid3X3 },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative">
      <header className="sticky top-0 z-30 bg-navy text-navy-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">Hi<span className="text-emerald">Tex</span></span>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-medium bg-navy-foreground/10 rounded-full px-2.5 py-1.5 hover:bg-navy-foreground/20 transition-colors">
              <Globe className="h-3.5 w-3.5" />
              <span>{languages.find((l) => l.code === lang)?.label?.slice(0, 2).toUpperCase()}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              {languages.map(({ code, label }) => (
                <DropdownMenuItem key={code} onClick={() => setLang(code)} className={lang === code ? "bg-accent/10 font-semibold" : ""}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={() => navigate("/profile")} className="flex items-center gap-1 text-xs font-medium bg-navy-foreground/10 rounded-full px-2.5 py-1.5 hover:bg-navy-foreground/20 transition-colors">
            <User className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

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
                {label === t("nav.chats") && totalUnread > 0 && (
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
