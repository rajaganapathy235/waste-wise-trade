import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, IndianRupee, BookOpen, TrendingUp, Users, Package, Scale, Landmark, ClipboardList, BarChart3, Receipt, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const POPULAR_REPORTS = [
  { label: "Bill wise profit", icon: FileText, path: "/billing/profit-loss" },
  { label: "Sales Summary", icon: IndianRupee, path: "/billing/sales-summary" },
  { label: "Daybook", icon: BookOpen, path: "/billing/daybook" },
  { label: "Profit and Loss", icon: TrendingUp, path: "/billing/profit-loss" },
  { label: "Party Statement (Ledger)", icon: Users, path: "/billing/party-reports" },
  { label: "Stock Summary", icon: Package, path: "/billing/stock-summary" },
  { label: "Balance Sheet", icon: Scale, path: "/billing/balance-sheet" },
  { label: "Cash and Bank", icon: Landmark, path: "/billing/cash-bank" },
];

const MORE_REPORTS = [
  { label: "Party Reports", icon: Users, path: "/billing/party-reports" },
  { label: "Item Reports", icon: Package, path: "/billing/item-reports" },
  { label: "GST Reports", icon: Receipt, path: "/billing/gst-reports" },
  { label: "Transaction Reports", icon: ShoppingCart, path: "/billing/transaction-reports" },
  { label: "All Invoices", icon: FileText, path: "/billing/all-invoices" },
];

export default function Reports() {
  const navigate = useNavigate();

  const renderRow = (item: { label: string; icon: any; path: string | null }, idx: number) => {
    const Icon = item.icon;
    return (
      <button
        key={idx}
        onClick={() => item.path && navigate(item.path)}
        className={`w-full flex items-center justify-between p-3 border-b border-border last:border-0 text-left ${!item.path ? "opacity-50" : "hover:bg-secondary/50"} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <span className="text-sm">{item.label}</span>
        </div>
        <span className="text-muted-foreground">›</span>
      </button>
    );
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Reports</h1>
      </div>

      <div className="bg-secondary/50 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Popular</div>
      <Card className="mb-4">
        <CardContent className="p-0">
          {POPULAR_REPORTS.map(renderRow)}
        </CardContent>
      </Card>

      <div className="bg-secondary/50 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">More</div>
      <Card>
        <CardContent className="p-0">
          {MORE_REPORTS.map(renderRow)}
        </CardContent>
      </Card>
    </div>
  );
}
