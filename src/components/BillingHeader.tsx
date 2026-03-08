import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Globe, User, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BillingHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export default function BillingHeader({ title, showBack = false, onBack, rightAction }: BillingHeaderProps) {
  const navigate = useNavigate();
  const { lang, setLang, languages } = useI18n();

  return (
    <header className="sticky top-0 z-30 bg-navy text-navy-foreground px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={onBack} className="mr-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <span className="text-lg font-bold tracking-tight">Hi<span className="text-emerald">Tex</span></span>
        <span className="text-xs font-medium opacity-80">{title || "Billing"}</span>
      </div>
      <div className="flex items-center gap-2">
        {rightAction}
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
  );
}
