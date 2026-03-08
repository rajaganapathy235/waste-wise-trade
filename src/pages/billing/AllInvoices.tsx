import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling, type GSTInvoice } from "@/lib/billingContext";
import { useSafeBack } from "@/hooks/use-safe-back";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Search, FileDown, Truck, XCircle, Clock, CheckCircle2 } from "lucide-react";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";

const statusConfig = {
  unpaid: { label: "Unpaid", color: "bg-destructive/10 text-destructive", icon: XCircle },
  partial: { label: "Partial", color: "bg-gold/10 text-gold", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald/10 text-emerald", icon: CheckCircle2 },
};

const typeLabel = (type: GSTInvoice["type"]) => {
  const map: Record<string, string> = {
    "sale-invoice": "Tax Invoice", "purchase-invoice": "Purchase Invoice", "quotation": "Quotation",
    "delivery-challan": "Delivery Challan", "proforma": "Proforma Invoice", "purchase-order": "Purchase Order",
    "sale-order": "Sale Order", "job-work": "Job Work Invoice", "credit-note": "Credit Note", "debit-note": "Debit Note"
  };
  return map[type] || type;
};

const typeColor = (type: GSTInvoice["type"]) => {
  if (type.includes("credit")) return "bg-destructive/10 text-destructive";
  if (type.includes("debit") || type.includes("quotation")) return "bg-gold/10 text-gold";
  if (type.includes("challan") || type.includes("purchase")) return "bg-primary/10 text-primary";
  return "bg-emerald/10 text-emerald";
};

export default function AllInvoices() {
  const navigate = useNavigate();
  const { invoices } = useBilling();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "sale" | "purchase" | "challan" | "cn-dn" | "other">("all");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  let filtered = invoices.filter(i => isInDateRange(i.date, dateRange));
  if (filter === "sale") filtered = filtered.filter(i => i.type === "sale-invoice");
  else if (filter === "purchase") filtered = filtered.filter(i => i.type === "purchase-invoice");
  else if (filter === "challan") filtered = filtered.filter(i => i.type === "delivery-challan");
  else if (filter === "cn-dn") filtered = filtered.filter(i => i.type === "credit-note" || i.type === "debit-note");
  else if (filter === "other") filtered = filtered.filter(i => !["sale-invoice", "purchase-invoice", "delivery-challan", "credit-note", "debit-note"].includes(i.type));

  if (search) {
    const sq = search.toLowerCase();
    filtered = filtered.filter(inv => inv.buyerName.toLowerCase().includes(sq) || inv.invoiceNo.toLowerCase().includes(sq) || inv.items.some(it => it.description.toLowerCase().includes(sq)));
  }

  const totalValue = filtered.reduce((s, i) => s + i.totalAmount, 0);
  const paidCount = filtered.filter(i => i.status === "paid").length;
  const unpaidCount = filtered.filter(i => i.status === "unpaid").length;

  const handleExport = () => {
    const headers = ["Invoice No", "Date", "Type", "Status", "Buyer", "GSTIN", "Taxable", "CGST", "SGST", "IGST", "Total"];
    const rows = filtered.map(inv => [inv.invoiceNo, inv.date, typeLabel(inv.type), inv.status, inv.buyerName, inv.buyerGstin, inv.taxableAmount, inv.cgstAmount, inv.sgstAmount, inv.igstAmount, inv.totalAmount]);
    exportToCSV("all_invoices.csv", headers, rows);
    toast.success("Invoices exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> All Invoices</h1>
        </div>
        <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
          <FileDown className="h-3 w-3" /> CSV
        </button>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Total Value</p>
            <p className="text-sm font-bold">₹{totalValue.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald/5">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Paid</p>
            <p className="text-sm font-bold text-emerald">{paidCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Unpaid</p>
            <p className="text-sm font-bold text-destructive">{unpaidCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." className="pl-9 h-8 text-xs" />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {([
          { val: "all" as const, label: `All (${invoices.length})` },
          { val: "sale" as const, label: "Sales" },
          { val: "purchase" as const, label: "Purchase" },
          { val: "challan" as const, label: "Challans" },
          { val: "cn-dn" as const, label: "CN/DN" },
          { val: "other" as const, label: "Other" },
        ]).map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${filter === f.val ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No invoices found</p>
          <p className="text-[10px] text-muted-foreground mt-1">Create invoices from the Billing dashboard</p>
          <button onClick={() => navigate("/billing")} className="mt-3 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg">
            Go to Billing
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(inv => {
            const sc = statusConfig[inv.status];
            const StatusIcon = sc.icon;
            return (
              <Card key={inv.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/billing", { state: { tab: "all" } })}>
                <CardContent className="p-0">
                  <div className={`px-3 py-1 flex items-center justify-between ${typeColor(inv.type)}`}>
                    <div className="flex items-center gap-1.5">
                      {inv.type.includes("challan") ? <Truck className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                      <span className="text-[10px] font-bold">{typeLabel(inv.type)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[8px] py-0 ${sc.color}`}>
                        <StatusIcon className="h-2 w-2 mr-0.5" />{sc.label}
                      </Badge>
                      <span className="text-[10px] font-mono">{inv.invoiceNo}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold">{inv.buyerName}</p>
                        <p className="text-[10px] text-muted-foreground">{inv.buyerGstin}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">₹{inv.totalAmount.toLocaleString("en-IN")}</p>
                        <p className="text-[10px] text-muted-foreground">{inv.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {inv.items.slice(0, 2).map((item, i) => (
                        <Badge key={i} variant="outline" className="text-[9px]">{item.description.slice(0, 20)}</Badge>
                      ))}
                      {inv.items.length > 2 && <Badge variant="outline" className="text-[9px]">+{inv.items.length - 2}</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
