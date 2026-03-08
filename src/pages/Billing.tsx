import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/appContext";
import {
  Globe, User, Send, Users, Smartphone, FileText, Package,
  FileSpreadsheet, TrendingUp, Menu, ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BillType = "Sales" | "Purchase" | "Quotation";
type BillingTab = "send" | "party" | "center" | "bills" | "products";

export default function Billing() {
  const navigate = useNavigate();
  const { t, lang, setLang, languages } = useI18n();
  const [billType, setBillType] = useState<BillType>("Sales");
  const [activeTab, setActiveTab] = useState<BillingTab>("send");

  const billTypes: BillType[] = ["Sales", "Purchase", "Quotation"];

  const TABS: { id: BillingTab; label: string; icon: React.ElementType }[] = [
    { id: "send", label: "Send", icon: Send },
    { id: "party", label: "Party", icon: Users },
    { id: "center", label: "", icon: Smartphone },
    { id: "bills", label: "Bills", icon: FileText },
    { id: "products", label: "Products", icon: Package },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative">
      {/* Header - same as marketplace */}
      <header className="sticky top-0 z-30 bg-navy text-navy-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">Hi<span className="text-emerald">Tex</span></span>
          <span className="text-xs font-medium opacity-80">Billing</span>
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

      {/* Sub-header with tab info */}
      <div className="bg-emerald text-emerald-foreground px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-foreground text-emerald text-xs font-bold px-3 py-1 rounded">Send</span>
          <span className="text-sm font-semibold">Sales Bill (0)</span>
        </div>
        <button className="p-1">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">
        {/* New Bill Card */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gold/20 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-gold" />
              </div>
              <h2 className="text-base font-bold text-foreground">New Bill</h2>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-sm text-muted-foreground mb-2">Bill Type</p>
              <div className="flex items-center gap-6">
                {billTypes.map((bt) => (
                  <label key={bt} className="flex items-center gap-2 cursor-pointer" onClick={() => setBillType(bt)}>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${billType === bt ? "border-emerald" : "border-muted-foreground/40"}`}>
                      {billType === bt && <div className="h-2.5 w-2.5 rounded-full bg-emerald" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{bt}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              className="w-full h-12 text-base font-bold rounded-lg bg-gold hover:bg-gold/90 text-gold-foreground"
              onClick={() => {/* Will navigate to bill creation */}}
            >
              Generate Bill
            </Button>
          </CardContent>
        </Card>


        {/* Licence Status */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-emerald">Licence Activation Status</p>
            <p className="text-sm font-bold text-foreground">Activated</p>
          </CardContent>
        </Card>

        {/* Logo / Signature / Stamp */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gold/20 flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">Logo | Signature | Stamp</p>
              <p className="text-sm text-muted-foreground">Colorful Bill</p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Report */}
        <Card className="border-0 shadow-sm bg-primary overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-primary-foreground">Monthly Report</p>
              <p className="text-sm text-primary-foreground/80">Sales | Purchase</p>
            </div>
            <TrendingUp className="h-6 w-6 text-primary-foreground/60" />
          </CardContent>
        </Card>

        {/* Tax Report */}
        <Card className="border-0 shadow-sm bg-navy overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-navy-foreground/20 flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-navy-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-navy-foreground">Tax Report</p>
              <p className="text-sm text-navy-foreground/80">GST Summary</p>
            </div>
            <TrendingUp className="h-6 w-6 text-navy-foreground/60" />
          </CardContent>
        </Card>

        {/* Back to Marketplace */}
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => navigate("/")}
        >
          ← Back to Marketplace
        </Button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-30">
        <div className="flex items-center justify-around py-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const isCenter = id === "center";

            if (isCenter) {
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="relative -mt-5 flex flex-col items-center"
                >
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg ${
                    isActive ? "bg-destructive" : "bg-destructive/80"
                  }`}>
                    <Icon className="h-6 w-6 text-destructive-foreground" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
