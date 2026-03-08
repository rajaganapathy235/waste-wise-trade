import { useNavigate } from "react-router-dom";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Scale, TrendingUp, TrendingDown, FileDown } from "lucide-react";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";

export default function BalanceSheet() {
  const navigate = useNavigate();
  const { parties, items, payments, expenses, bankAccounts } = useBilling();

  // ASSETS
  const stockValue = items.filter(i => i.itemType === "product").reduce((s, i) => s + i.salesPrice * i.stockQty, 0);

  const cashInHand = payments.reduce((s, p) => {
    if (p.paymentMode === "cash") return s + (p.type === "in" ? p.amount : -p.amount);
    return s;
  }, 0) - expenses.filter(e => e.paymentMode === "cash").reduce((s, e) => s + e.amount, 0);

  const bankBalance = bankAccounts.reduce((s, b) => s + b.openingBalance, 0)
    + payments.filter(p => p.paymentMode === "bank" || p.paymentMode === "upi").reduce((s, p) => s + (p.type === "in" ? p.amount : -p.amount), 0)
    - expenses.filter(e => e.paymentMode === "bank" || e.paymentMode === "upi").reduce((s, e) => s + e.amount, 0);

  const receivables = parties
    .filter(p => p.balanceType === "collect")
    .reduce((s, p) => {
      const received = payments.filter(pay => pay.partyId === p.id && pay.type === "in").reduce((a, pay) => a + pay.amount, 0);
      return s + Math.max(0, p.openingBalance - received);
    }, 0);

  const totalAssets = stockValue + Math.max(0, cashInHand) + Math.max(0, bankBalance) + receivables;

  // LIABILITIES
  const payables = parties
    .filter(p => p.balanceType === "pay")
    .reduce((s, p) => {
      const paid = payments.filter(pay => pay.partyId === p.id && pay.type === "out").reduce((a, pay) => a + pay.amount, 0);
      return s + Math.max(0, p.openingBalance - paid);
    }, 0);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalLiabilities = payables + totalExpenses;

  const netWorth = totalAssets - totalLiabilities;

  const assetRows = [
    { label: "Stock / Inventory", value: stockValue },
    { label: "Cash in Hand", value: Math.max(0, cashInHand) },
    { label: "Bank Balance", value: Math.max(0, bankBalance) },
    { label: "Trade Receivables (To Collect)", value: receivables },
  ];

  const liabilityRows = [
    { label: "Trade Payables (To Pay)", value: payables },
    { label: "Expenses Payable", value: totalExpenses },
  ];

  const handleExport = () => {
    const headers = ["Category", "Particulars", "Amount (₹)"];
    const rows = [
      ...assetRows.map(r => ["Assets", r.label, r.value]),
      ["Assets", "TOTAL ASSETS", totalAssets],
      ...liabilityRows.map(r => ["Liabilities", r.label, r.value]),
      ["Liabilities", "TOTAL LIABILITIES", totalLiabilities],
      ["", "NET WORTH", netWorth],
    ];
    exportToCSV("balance_sheet.csv", headers, rows);
    toast.success("Balance Sheet exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold flex items-center gap-2"><Scale className="h-5 w-5 text-primary" /> Balance Sheet</h1>
        </div>
        <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
          <FileDown className="h-3 w-3" /> CSV
        </button>
      </div>

      {/* Net Worth */}
      <Card className={`mb-5 ${netWorth >= 0 ? "bg-emerald/5 border-emerald/20" : "bg-destructive/5 border-destructive/20"}`}>
        <CardContent className="p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net Worth</p>
          <p className={`text-2xl font-bold ${netWorth >= 0 ? "text-emerald" : "text-destructive"}`}>
            ₹ {Math.abs(netWorth).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-muted-foreground">As of {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
        </CardContent>
      </Card>

      {/* Assets */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-emerald" />
          <p className="text-sm font-bold">Assets</p>
        </div>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {assetRows.map((row, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm">{row.label}</span>
                <span className="text-sm font-bold">₹ {row.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-emerald/5">
              <span className="text-sm font-bold">Total Assets</span>
              <span className="text-sm font-bold text-emerald">₹ {totalAssets.toLocaleString("en-IN")}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liabilities */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="h-4 w-4 text-destructive" />
          <p className="text-sm font-bold">Liabilities</p>
        </div>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {liabilityRows.map((row, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm">{row.label}</span>
                <span className="text-sm font-bold">₹ {row.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-destructive/5">
              <span className="text-sm font-bold">Total Liabilities</span>
              <span className="text-sm font-bold text-destructive">₹ {totalLiabilities.toLocaleString("en-IN")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
