import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, FileDown, Receipt } from "lucide-react";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";

export default function GSTReports() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing/reports");
  const { invoices } = useBilling();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [activeReport, setActiveReport] = useState<"gstr1" | "gstr3b" | "hsn" | "gstr2" | null>(null);

  const filtered = invoices.filter(i => isInDateRange(i.date, dateRange));
  const salesInvoices = filtered.filter(i => i.type === "sale-invoice");
  const purchaseInvoices = filtered.filter(i => i.type === "purchase-invoice");
  const creditNotes = filtered.filter(i => i.type === "credit-note");
  const debitNotes = filtered.filter(i => i.type === "debit-note");

  // GSTR-1 Data
  const gstr1TotalTaxable = salesInvoices.reduce((s, i) => s + i.taxableAmount, 0);
  const gstr1TotalCGST = salesInvoices.reduce((s, i) => s + i.cgstAmount, 0);
  const gstr1TotalSGST = salesInvoices.reduce((s, i) => s + i.sgstAmount, 0);
  const gstr1TotalIGST = salesInvoices.reduce((s, i) => s + i.igstAmount, 0);
  const gstr1Total = salesInvoices.reduce((s, i) => s + i.totalAmount, 0);

  // GSTR-3B Data
  const totalOutputTax = gstr1TotalCGST + gstr1TotalSGST + gstr1TotalIGST;
  const totalInputTax = purchaseInvoices.reduce((s, i) => s + i.cgstAmount + i.sgstAmount + i.igstAmount, 0);
  const netTaxPayable = totalOutputTax - totalInputTax;

  // GSTR-2 Data
  const gstr2TotalTaxable = purchaseInvoices.reduce((s, i) => s + i.taxableAmount, 0);
  const gstr2TotalTax = purchaseInvoices.reduce((s, i) => s + i.cgstAmount + i.sgstAmount + i.igstAmount, 0);

  const exportGSTR1 = () => {
    const headers = ["Invoice No", "Date", "Party", "GSTIN", "Taxable", "CGST", "SGST", "IGST", "Total"];
    const rows = salesInvoices.map(i => [i.invoiceNo, i.date, i.buyerName, i.buyerGstin, i.taxableAmount, i.cgstAmount, i.sgstAmount, i.igstAmount, i.totalAmount]);
    exportToCSV("gstr1_report.csv", headers, rows);
    toast.success("GSTR-1 exported!");
  };

  const exportGSTR3B = () => {
    const headers = ["Description", "Amount (₹)"];
    const rows = [
      ["Output Tax (CGST)", gstr1TotalCGST], ["Output Tax (SGST)", gstr1TotalSGST], ["Output Tax (IGST)", gstr1TotalIGST],
      ["Total Output Tax", totalOutputTax], ["Input Tax Credit", totalInputTax], ["Net Tax Payable", netTaxPayable],
    ];
    exportToCSV("gstr3b_summary.csv", headers, rows);
    toast.success("GSTR-3B exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => activeReport ? setActiveReport(null) : goBack()}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> GST Reports</h1>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      {!activeReport ? (
        <div className="space-y-3">
          {[
            { key: "gstr1" as const, label: "GSTR-1 (Sales)", desc: `${salesInvoices.length} invoices • ₹${gstr1Total.toLocaleString("en-IN")}`, color: "text-emerald" },
            { key: "gstr3b" as const, label: "GSTR-3B (Summary)", desc: `Net payable: ₹${netTaxPayable.toLocaleString("en-IN")}`, color: "text-primary" },
            { key: "hsn" as const, label: "HSN Wise Summary", desc: "HSN-wise tax breakup for sales", color: "text-gold" },
            { key: "gstr2" as const, label: "GSTR-2 (Purchases)", desc: `${purchaseInvoices.length} invoices • ₹${gstr2TotalTaxable.toLocaleString("en-IN")}`, color: "text-destructive" },
          ].map(r => (
            <Card key={r.key} className="cursor-pointer hover:shadow-md transition-all" onClick={() => r.key === "hsn" ? navigate("/billing/hsn-summary") : setActiveReport(r.key)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className={`h-5 w-5 ${r.color}`} />
                  <div>
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
                <span className="text-muted-foreground">›</span>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activeReport === "gstr1" ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-bold">GSTR-1 - Outward Supplies</p>
            <button onClick={exportGSTR1} className="text-[10px] text-primary font-semibold flex items-center gap-1"><FileDown className="h-3 w-3" /> CSV</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Taxable Value</p><p className="text-sm font-bold">₹{gstr1TotalTaxable.toLocaleString("en-IN")}</p></CardContent></Card>
            <Card className="bg-primary/5"><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Total Tax</p><p className="text-sm font-bold text-primary">₹{(gstr1TotalCGST + gstr1TotalSGST + gstr1TotalIGST).toLocaleString("en-IN")}</p></CardContent></Card>
          </div>
          {salesInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No sales invoices</div>
          ) : (
            <>
              <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-secondary/50 rounded-t-lg text-[9px] font-semibold text-muted-foreground uppercase">
                <span className="col-span-3">Invoice</span><span className="col-span-3">Party</span><span className="col-span-2 text-right">Taxable</span><span className="col-span-2 text-right">Tax</span><span className="col-span-2 text-right">Total</span>
              </div>
              <div className="divide-y divide-border border border-t-0 rounded-b-lg">
                {salesInvoices.map(inv => (
                  <div key={inv.id} className="grid grid-cols-12 gap-1 px-3 py-2 items-center">
                    <div className="col-span-3"><p className="text-[10px] font-mono truncate">{inv.invoiceNo}</p><p className="text-[9px] text-muted-foreground">{inv.date}</p></div>
                    <span className="col-span-3 text-[10px] truncate">{inv.buyerName}</span>
                    <span className="col-span-2 text-[10px] text-right">₹{inv.taxableAmount.toLocaleString("en-IN")}</span>
                    <span className="col-span-2 text-[10px] text-right text-primary">₹{(inv.cgstAmount + inv.sgstAmount + inv.igstAmount).toLocaleString("en-IN")}</span>
                    <span className="col-span-2 text-[10px] font-bold text-right">₹{inv.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : activeReport === "gstr3b" ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-bold">GSTR-3B Summary</p>
            <button onClick={exportGSTR3B} className="text-[10px] text-primary font-semibold flex items-center gap-1"><FileDown className="h-3 w-3" /> CSV</button>
          </div>
          <div className="space-y-3">
            <Card><CardContent className="p-0 divide-y divide-border">
              <div className="px-4 py-3 bg-secondary/30"><p className="text-xs font-bold">Output Tax (On Sales)</p></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-xs">CGST</span><span className="text-xs font-bold">₹{gstr1TotalCGST.toLocaleString("en-IN")}</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-xs">SGST</span><span className="text-xs font-bold">₹{gstr1TotalSGST.toLocaleString("en-IN")}</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-xs">IGST</span><span className="text-xs font-bold">₹{gstr1TotalIGST.toLocaleString("en-IN")}</span></div>
              <div className="px-4 py-2 flex justify-between bg-primary/5"><span className="text-xs font-bold">Total Output Tax</span><span className="text-xs font-bold text-primary">₹{totalOutputTax.toLocaleString("en-IN")}</span></div>
            </CardContent></Card>

            <Card><CardContent className="p-0 divide-y divide-border">
              <div className="px-4 py-3 bg-secondary/30"><p className="text-xs font-bold">Input Tax Credit (On Purchases)</p></div>
              <div className="px-4 py-2 flex justify-between bg-emerald/5"><span className="text-xs font-bold">Total ITC Available</span><span className="text-xs font-bold text-emerald">₹{totalInputTax.toLocaleString("en-IN")}</span></div>
            </CardContent></Card>

            <Card className={netTaxPayable >= 0 ? "border-destructive/30" : "border-emerald/30"}>
              <CardContent className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Net Tax Payable</p>
                <p className={`text-2xl font-bold ${netTaxPayable >= 0 ? "text-destructive" : "text-emerald"}`}>
                  ₹ {Math.abs(netTaxPayable).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-muted-foreground">{netTaxPayable >= 0 ? "To Pay" : "Refundable"}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : activeReport === "gstr2" ? (
        <div>
          <p className="text-sm font-bold mb-3">GSTR-2 - Inward Supplies</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Taxable Value</p><p className="text-sm font-bold">₹{gstr2TotalTaxable.toLocaleString("en-IN")}</p></CardContent></Card>
            <Card className="bg-emerald/5"><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">ITC Available</p><p className="text-sm font-bold text-emerald">₹{gstr2TotalTax.toLocaleString("en-IN")}</p></CardContent></Card>
          </div>
          {purchaseInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No purchase invoices</div>
          ) : (
            <>
              <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-secondary/50 rounded-t-lg text-[9px] font-semibold text-muted-foreground uppercase">
                <span className="col-span-3">Invoice</span><span className="col-span-3">Supplier</span><span className="col-span-3">GSTIN</span><span className="col-span-3 text-right">Total</span>
              </div>
              <div className="divide-y divide-border border border-t-0 rounded-b-lg">
                {purchaseInvoices.map(inv => (
                  <div key={inv.id} className="grid grid-cols-12 gap-1 px-3 py-2 items-center">
                    <div className="col-span-3"><p className="text-[10px] font-mono truncate">{inv.invoiceNo}</p><p className="text-[9px] text-muted-foreground">{inv.date}</p></div>
                    <span className="col-span-3 text-[10px] truncate">{inv.buyerName}</span>
                    <span className="col-span-3 text-[10px] text-muted-foreground truncate">{inv.buyerGstin}</span>
                    <span className="col-span-3 text-[10px] font-bold text-right">₹{inv.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
