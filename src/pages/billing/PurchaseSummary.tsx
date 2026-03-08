import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, FileDown } from "lucide-react";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";

export default function PurchaseSummary() {
  const navigate = useNavigate();
  const { invoices, payments } = useBilling();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const purchaseInvoices = invoices.filter(i => i.type === "purchase-invoice" && isInDateRange(i.date, dateRange));
  const purchasePayments = payments.filter(p => p.type === "out" && isInDateRange(p.date, dateRange));

  const totalPurchaseInvoices = purchaseInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalPurchasePayments = purchasePayments.reduce((s, p) => s + p.amount, 0);
  const paidInvoices = purchaseInvoices.filter(i => i.status === "paid").length;
  const unpaidInvoices = purchaseInvoices.filter(i => i.status === "unpaid").length;

  // By party
  const byParty: Record<string, { amount: number; count: number }> = {};
  purchasePayments.forEach(p => {
    if (!byParty[p.partyName]) byParty[p.partyName] = { amount: 0, count: 0 };
    byParty[p.partyName].amount += p.amount;
    byParty[p.partyName].count++;
  });
  const partyList = Object.entries(byParty).sort((a, b) => b[1].amount - a[1].amount);

  const handleExport = () => {
    const headers = ["Party Name", "Amount (₹)", "Transactions"];
    const rows = partyList.map(([name, data]) => [name, data.amount, data.count]);
    exportToCSV("purchase_summary.csv", headers, rows);
    toast.success("Purchase Summary exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Purchase Summary</h1>
        </div>
        <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
          <FileDown className="h-3 w-3" /> CSV
        </button>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card><CardContent className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Purchase Invoices</p>
          <p className="text-sm font-bold">₹{totalPurchaseInvoices.toLocaleString("en-IN")}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Payments Made</p>
          <p className="text-sm font-bold text-destructive">₹{totalPurchasePayments.toLocaleString("en-IN")}</p>
        </CardContent></Card>
        <Card className="bg-emerald/5"><CardContent className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Paid</p>
          <p className="text-sm font-bold text-emerald">{paidInvoices}</p>
        </CardContent></Card>
        <Card className="bg-destructive/5"><CardContent className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Unpaid</p>
          <p className="text-sm font-bold text-destructive">{unpaidInvoices}</p>
        </CardContent></Card>
      </div>

      <p className="text-sm font-bold mb-3">By Supplier</p>
      {partyList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No purchase data found</div>
      ) : (
        <div className="space-y-2">
          {partyList.map(([name, data]) => (
            <Card key={name}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-[10px] text-muted-foreground">{data.count} transaction{data.count > 1 ? "s" : ""}</p>
                </div>
                <p className="text-sm font-bold text-destructive">₹{data.amount.toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
