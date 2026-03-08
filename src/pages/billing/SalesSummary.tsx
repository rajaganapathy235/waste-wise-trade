import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileDown } from "lucide-react";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";

export default function SalesSummary() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing/reports");
  const { invoices, payments } = useBilling();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  // Use invoices as primary sales data
  const salesInvoices = invoices
    .filter(i => ["sale-invoice", "sale-order", "proforma", "quotation"].includes(i.type))
    .filter(i => isInDateRange(i.date, dateRange));
  
  const salesPayments = payments.filter(p => p.type === "in" && isInDateRange(p.date, dateRange));

  const totalInvoiced = salesInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalReceived = salesPayments.reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = totalInvoiced - totalReceived;

  const handleExport = () => {
    const headers = ["Invoice No", "Date", "Party", "Amount (₹)", "Status"];
    const rows = salesInvoices.map(i => [i.invoiceNo, i.date, i.buyerName, i.totalAmount, i.status]);
    exportToCSV("sales_summary.csv", headers, rows);
    toast.success("Sales Summary exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold">Sales Summary</h1>
        </div>
        <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
          <FileDown className="h-3 w-3" /> CSV
        </button>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Total Invoiced</p>
            <p className="text-sm font-bold">₹ {totalInvoiced.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Received</p>
            <p className="text-sm font-bold text-emerald">₹ {totalReceived.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Outstanding</p>
            <p className="text-sm font-bold text-destructive">₹ {Math.max(0, totalOutstanding).toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
      </div>

      {salesInvoices.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm font-semibold text-muted-foreground">No Sales Data</p>
          <p className="text-[10px] text-muted-foreground mt-1">Create sale invoices to see data here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {salesInvoices.map(inv => (
            <Card key={inv.id}>
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{inv.buyerName}</p>
                  <p className="text-[10px] text-muted-foreground">{inv.invoiceNo} • {inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{inv.totalAmount.toLocaleString("en-IN")}</p>
                  <p className={`text-[10px] font-semibold capitalize ${inv.status === "paid" ? "text-emerald" : inv.status === "partial" ? "text-gold" : "text-destructive"}`}>{inv.status}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
