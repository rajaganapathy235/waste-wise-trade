import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling, type GSTInvoice } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Search, FileDown, Plus, XCircle, Clock, CheckCircle2 } from "lucide-react";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";

const statusConfig = {
  unpaid: { label: "Unpaid", color: "bg-destructive/10 text-destructive", icon: XCircle },
  partial: { label: "Partial", color: "bg-gold/10 text-gold", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald/10 text-emerald", icon: CheckCircle2 },
};

export default function SalesInvoices() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing");
  const { invoices } = useBilling();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid" | "partial">("all");

  const salesInvoices = invoices.filter(i => i.type === "sale-invoice");
  let filtered = salesInvoices.filter(i => isInDateRange(i.date, dateRange));
  if (statusFilter !== "all") filtered = filtered.filter(i => i.status === statusFilter);
  if (search) {
    const sq = search.toLowerCase();
    filtered = filtered.filter(inv => inv.buyerName.toLowerCase().includes(sq) || inv.invoiceNo.toLowerCase().includes(sq));
  }

  const totalSales = filtered.reduce((s, i) => s + i.totalAmount, 0);
  const paidAmount = filtered.filter(i => i.status === "paid").reduce((s, i) => s + i.totalAmount, 0);
  const unpaidAmount = filtered.filter(i => i.status === "unpaid").reduce((s, i) => s + i.totalAmount, 0);

  const handleExport = () => {
    const headers = ["Date", "Invoice Number", "Party Name", "Amount (₹)", "Status"];
    const rows = filtered.map(inv => [inv.date, inv.invoiceNo, inv.buyerName, inv.totalAmount, inv.status]);
    exportToCSV("sales_invoices.csv", headers, rows);
    toast.success("Sales Invoices exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Sales Invoices</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
            <FileDown className="h-3 w-3" /> CSV
          </button>
          <button onClick={() => navigate("/billing", { state: { tab: "quicklinks" } })} className="text-[10px] bg-primary text-primary-foreground font-semibold flex items-center gap-1 px-2 py-1 rounded-md">
            <Plus className="h-3 w-3" /> Create
          </button>
        </div>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Total Sales</p>
            <p className="text-sm font-bold">₹{totalSales.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Paid</p>
            <p className="text-sm font-bold text-emerald">₹{paidAmount.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Unpaid</p>
            <p className="text-sm font-bold text-destructive">₹{unpaidAmount.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by party or invoice no..." className="pl-9 h-8 text-xs" />
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(["all", "paid", "unpaid", "partial"] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap capitalize transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {s === "all" ? `All (${salesInvoices.length})` : s}
          </button>
        ))}
      </div>

      {/* Table-style List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No Sales Invoices</p>
          <p className="text-[10px] text-muted-foreground mt-1">Create your first sales invoice</p>
          <button onClick={() => navigate("/billing", { state: { tab: "quicklinks" } })} className="mt-3 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg">
            Create Sales Invoice
          </button>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-secondary/50 rounded-t-lg text-[9px] font-semibold text-muted-foreground uppercase">
            <span className="col-span-2">Date</span>
            <span className="col-span-3">Invoice No</span>
            <span className="col-span-3">Party Name</span>
            <span className="col-span-2 text-right">Amount</span>
            <span className="col-span-2 text-center">Status</span>
          </div>
          <div className="divide-y divide-border border border-t-0 rounded-b-lg overflow-hidden">
            {filtered.map(inv => {
              const sc = statusConfig[inv.status];
              const StatusIcon = sc.icon;
              return (
                <div key={inv.id} className="grid grid-cols-12 gap-1 px-3 py-2.5 items-center hover:bg-secondary/30 cursor-pointer transition-colors"
                  onClick={() => navigate("/billing", { state: { tab: "all" } })}>
                  <span className="col-span-2 text-[10px] text-muted-foreground">{inv.date}</span>
                  <span className="col-span-3 text-[10px] font-mono font-medium truncate">{inv.invoiceNo}</span>
                  <span className="col-span-3 text-[10px] font-medium truncate">{inv.buyerName}</span>
                  <span className="col-span-2 text-[10px] font-bold text-right">₹{inv.totalAmount.toLocaleString("en-IN")}</span>
                  <span className="col-span-2 flex justify-center">
                    <Badge variant="outline" className={`text-[8px] py-0 ${sc.color}`}>
                      <StatusIcon className="h-2 w-2 mr-0.5" />{sc.label}
                    </Badge>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
