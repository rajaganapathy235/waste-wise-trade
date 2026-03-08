import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, FileDown } from "lucide-react";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";

export default function ProfitLoss() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing/reports");
  const { invoices, payments, expenses } = useBilling();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const filteredExpenses = expenses.filter(e => isInDateRange(e.date, dateRange));

  // Revenue from sale invoices
  const salesInvoices = invoices.filter(i => 
    ["sale-invoice", "sale-order"].includes(i.type) && isInDateRange(i.date, dateRange)
  );
  const totalRevenue = salesInvoices.reduce((s, i) => s + i.totalAmount, 0);
  
  // Purchases from purchase invoices
  const purchaseInvoices = invoices.filter(i => 
    ["purchase-invoice", "purchase-order"].includes(i.type) && isInDateRange(i.date, dateRange)
  );
  const totalPurchases = purchaseInvoices.reduce((s, i) => s + i.totalAmount, 0);
  
  const totalExp = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit = totalRevenue - totalPurchases;
  const netProfit = grossProfit - totalExp;

  const handleExport = () => {
    const headers = ["Description", "Amount (₹)"];
    const rows = [
      ["Revenue (Sales Invoices)", totalRevenue],
      ["Purchases", totalPurchases],
      ["Gross Profit", grossProfit],
      ["Expenses", totalExp],
      ["Net Profit", netProfit],
    ];
    exportToCSV("profit_loss.csv", headers, rows);
    toast.success("P&L exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold">Profit & Loss</h1>
        </div>
        <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
          <FileDown className="h-3 w-3" /> CSV
        </button>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <Card className={`mb-4 ${netProfit >= 0 ? "bg-emerald/5" : "bg-destructive/5"}`}>
        <CardContent className="p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net Profit / Loss</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-emerald" : "text-destructive"}`}>
            ₹ {Math.abs(netProfit).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-muted-foreground">{netProfit >= 0 ? "Profit" : "Loss"}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald" />
              <div>
                <p className="text-sm font-medium">Revenue (Sales)</p>
                <p className="text-[10px] text-muted-foreground">{salesInvoices.length} sale invoices</p>
              </div>
            </div>
            <p className="text-sm font-bold text-emerald">₹{totalRevenue.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">Purchases</p>
                <p className="text-[10px] text-muted-foreground">{purchaseInvoices.length} purchase invoices</p>
              </div>
            </div>
            <p className="text-sm font-bold text-destructive">₹{totalPurchases.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm font-bold">Gross Profit</p>
            <p className={`text-sm font-bold ${grossProfit >= 0 ? "text-emerald" : "text-destructive"}`}>₹{Math.abs(grossProfit).toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-gold" />
              <div>
                <p className="text-sm font-medium">Expenses</p>
                <p className="text-[10px] text-muted-foreground">{filteredExpenses.length} expenses</p>
              </div>
            </div>
            <p className="text-sm font-bold text-gold">₹{totalExp.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
