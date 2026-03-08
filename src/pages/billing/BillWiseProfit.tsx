import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, FileDown } from "lucide-react";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";

export default function BillWiseProfit() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing/reports");
  const { invoices, payments } = useBilling();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const salesInvoices = invoices.filter(i => i.type === "sale-invoice" && isInDateRange(i.date, dateRange));

  const billData = salesInvoices.map(inv => {
    const received = payments.filter(p => p.invoiceRef === inv.invoiceNo && p.type === "in").reduce((s, p) => s + p.amount, 0);
    const costEstimate = inv.items.reduce((s, it) => s + (it.rate * 0.7 * it.qty), 0); // rough estimate
    const profit = inv.totalAmount - costEstimate;
    const margin = inv.totalAmount > 0 ? (profit / inv.totalAmount * 100) : 0;
    return { ...inv, received, costEstimate, profit, margin };
  });

  const totalSales = billData.reduce((s, b) => s + b.totalAmount, 0);
  const totalProfit = billData.reduce((s, b) => s + b.profit, 0);
  const avgMargin = totalSales > 0 ? (totalProfit / totalSales * 100) : 0;

  const handleExport = () => {
    const headers = ["Invoice No", "Date", "Party", "Sales Amount", "Estimated Cost", "Profit", "Margin %"];
    const rows = billData.map(b => [b.invoiceNo, b.date, b.buyerName, b.totalAmount, b.costEstimate.toFixed(0), b.profit.toFixed(0), b.margin.toFixed(1)]);
    exportToCSV("bill_wise_profit.csv", headers, rows);
    toast.success("Bill Wise Profit exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Bill Wise Profit</h1>
        </div>
        <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
          <FileDown className="h-3 w-3" /> CSV
        </button>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card><CardContent className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Total Sales</p>
          <p className="text-sm font-bold">₹{totalSales.toLocaleString("en-IN")}</p>
        </CardContent></Card>
        <Card className="bg-emerald/5"><CardContent className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Total Profit</p>
          <p className="text-sm font-bold text-emerald">₹{totalProfit.toLocaleString("en-IN")}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Avg Margin</p>
          <p className="text-sm font-bold">{avgMargin.toFixed(1)}%</p>
        </CardContent></Card>
      </div>

      {billData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No sales invoices found</div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-secondary/50 rounded-t-lg text-[9px] font-semibold text-muted-foreground uppercase">
            <span className="col-span-3">Invoice</span>
            <span className="col-span-3">Party</span>
            <span className="col-span-2 text-right">Sales</span>
            <span className="col-span-2 text-right">Profit</span>
            <span className="col-span-2 text-right">Margin</span>
          </div>
          <div className="divide-y divide-border border border-t-0 rounded-b-lg">
            {billData.map(b => (
              <div key={b.id} className="grid grid-cols-12 gap-1 px-3 py-2.5 items-center">
                <div className="col-span-3">
                  <p className="text-[10px] font-mono font-medium truncate">{b.invoiceNo}</p>
                  <p className="text-[9px] text-muted-foreground">{b.date}</p>
                </div>
                <span className="col-span-3 text-[10px] truncate">{b.buyerName}</span>
                <span className="col-span-2 text-[10px] font-bold text-right">₹{b.totalAmount.toLocaleString("en-IN")}</span>
                <span className={`col-span-2 text-[10px] font-bold text-right ${b.profit >= 0 ? "text-emerald" : "text-destructive"}`}>
                  ₹{Math.abs(b.profit).toLocaleString("en-IN")}
                </span>
                <span className={`col-span-2 text-[10px] font-bold text-right ${b.margin >= 0 ? "text-emerald" : "text-destructive"}`}>
                  {b.margin.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
