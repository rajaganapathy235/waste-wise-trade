import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, FileDown } from "lucide-react";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";

export default function HSNSummary() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing/reports");
  const { invoices } = useBilling();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const filtered = invoices.filter(i => (i.type === "sale-invoice") && isInDateRange(i.date, dateRange));

  // Group by HSN
  const byHSN: Record<string, { hsn: string; taxableValue: number; cgst: number; sgst: number; igst: number; totalTax: number; qty: number }> = {};
  filtered.forEach(inv => {
    inv.items.forEach(item => {
      const hsn = item.hsnSac || "N/A";
      if (!byHSN[hsn]) byHSN[hsn] = { hsn, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0, qty: 0 };
      const taxable = item.amount;
      const gstRate = item.gstRate || 0;
      const cgst = inv.isIgst ? 0 : taxable * (gstRate / 2) / 100;
      const sgst = inv.isIgst ? 0 : taxable * (gstRate / 2) / 100;
      const igst = inv.isIgst ? taxable * gstRate / 100 : 0;
      byHSN[hsn].taxableValue += taxable;
      byHSN[hsn].cgst += cgst;
      byHSN[hsn].sgst += sgst;
      byHSN[hsn].igst += igst;
      byHSN[hsn].totalTax += cgst + sgst + igst;
      byHSN[hsn].qty += item.qty;
    });
  });

  const hsnList = Object.values(byHSN).sort((a, b) => b.taxableValue - a.taxableValue);
  const totalTaxable = hsnList.reduce((s, h) => s + h.taxableValue, 0);
  const totalTax = hsnList.reduce((s, h) => s + h.totalTax, 0);

  const handleExport = () => {
    const headers = ["HSN/SAC", "Taxable Value", "CGST", "SGST", "IGST", "Total Tax", "Quantity"];
    const rows = hsnList.map(h => [h.hsn, h.taxableValue.toFixed(2), h.cgst.toFixed(2), h.sgst.toFixed(2), h.igst.toFixed(2), h.totalTax.toFixed(2), h.qty]);
    exportToCSV("hsn_summary.csv", headers, rows);
    toast.success("HSN Summary exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> HSN Wise Summary</h1>
        </div>
        <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
          <FileDown className="h-3 w-3" /> CSV
        </button>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card><CardContent className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Total Taxable</p>
          <p className="text-sm font-bold">₹{totalTaxable.toLocaleString("en-IN")}</p>
        </CardContent></Card>
        <Card className="bg-primary/5"><CardContent className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Total Tax</p>
          <p className="text-sm font-bold text-primary">₹{totalTax.toLocaleString("en-IN")}</p>
        </CardContent></Card>
      </div>

      {hsnList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No HSN data found</div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-secondary/50 rounded-t-lg text-[9px] font-semibold text-muted-foreground uppercase">
            <span className="col-span-2">HSN</span>
            <span className="col-span-3 text-right">Taxable</span>
            <span className="col-span-2 text-right">CGST</span>
            <span className="col-span-2 text-right">SGST</span>
            <span className="col-span-3 text-right">Total Tax</span>
          </div>
          <div className="divide-y divide-border border border-t-0 rounded-b-lg">
            {hsnList.map(h => (
              <div key={h.hsn} className="grid grid-cols-12 gap-1 px-3 py-2.5 items-center">
                <span className="col-span-2 text-[10px] font-mono font-bold">{h.hsn}</span>
                <span className="col-span-3 text-[10px] text-right">₹{h.taxableValue.toLocaleString("en-IN")}</span>
                <span className="col-span-2 text-[10px] text-right">₹{h.cgst.toFixed(0)}</span>
                <span className="col-span-2 text-[10px] text-right">₹{h.sgst.toFixed(0)}</span>
                <span className="col-span-3 text-[10px] font-bold text-right text-primary">₹{h.totalTax.toFixed(0)}</span>
              </div>
            ))}
            <div className="grid grid-cols-12 gap-1 px-3 py-2.5 items-center bg-secondary/30 font-bold">
              <span className="col-span-2 text-[10px]">Total</span>
              <span className="col-span-3 text-[10px] text-right">₹{totalTaxable.toLocaleString("en-IN")}</span>
              <span className="col-span-2 text-[10px] text-right">₹{hsnList.reduce((s, h) => s + h.cgst, 0).toFixed(0)}</span>
              <span className="col-span-2 text-[10px] text-right">₹{hsnList.reduce((s, h) => s + h.sgst, 0).toFixed(0)}</span>
              <span className="col-span-3 text-[10px] text-right text-primary">₹{totalTax.toFixed(0)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
