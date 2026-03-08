import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, FileText, Pencil, Trash2 } from "lucide-react";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";
import { toast } from "sonner";

export default function PartyLedger() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing");
  const { partyId } = useParams();
  const { parties, setParties, payments, invoices } = useBilling();
  const party = parties.find(p => p.id === partyId);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  if (!party) return <div className="p-4 text-center text-muted-foreground">Party not found</div>;

  const partyPayments = payments.filter(p => p.partyId === partyId && isInDateRange(p.date, dateRange));
  const partyInvoices = invoices.filter(inv => {
    const match = inv.buyerName.toLowerCase() === party.name.toLowerCase() || 
      (party.gstin && inv.buyerGstin === party.gstin);
    return match;
  });

  const totalIn = partyPayments.filter(p => p.type === "in").reduce((s, p) => s + p.amount, 0);
  const totalOut = partyPayments.filter(p => p.type === "out").reduce((s, p) => s + p.amount, 0);
  const invoiceTotal = partyInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const unpaidTotal = partyInvoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.totalAmount, 0);

  const deleteParty = () => {
    setParties(prev => prev.filter(p => p.id !== partyId));
    toast.success("Party deleted");
    goBack();
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold">Party Statement</h1>
        </div>
        <button onClick={deleteParty} className="p-1 hover:bg-secondary rounded">
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary">
              {party.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold">{party.name}</p>
              <p className="text-[10px] text-muted-foreground">{party.gstin || "No GSTIN"} • {party.type}</p>
              {party.phone && <p className="text-[10px] text-muted-foreground">{party.phone}</p>}
              {party.address && <p className="text-[10px] text-muted-foreground">{party.address}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Total Invoices</p>
              <p className="text-sm font-bold">₹{invoiceTotal.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Unpaid</p>
              <p className="text-sm font-bold text-destructive">₹{unpaidTotal.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Received</p>
              <p className="text-sm font-bold text-emerald">₹{totalIn.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Paid Out</p>
              <p className="text-sm font-bold text-destructive">₹{totalOut.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices for this party */}
      {partyInvoices.length > 0 && (
        <>
          <p className="text-sm font-bold mb-3">Invoices</p>
          <div className="space-y-2 mb-4">
            {partyInvoices.map(inv => (
              <Card key={inv.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{inv.invoiceNo}</p>
                      <p className="text-[10px] text-muted-foreground">{inv.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{inv.totalAmount.toLocaleString("en-IN")}</p>
                    <Badge variant="outline" className={`text-[9px] ${inv.status === "paid" ? "text-emerald" : inv.status === "partial" ? "text-gold" : "text-destructive"}`}>
                      {inv.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <p className="text-sm font-bold mb-3">Payment History</p>
      {partyPayments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No payments yet</div>
      ) : (
        <div className="space-y-2">
          {partyPayments.map(pay => (
            <Card key={pay.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {pay.type === "in" ? <ArrowDownLeft className="h-4 w-4 text-emerald" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                  <div>
                    <p className="text-sm font-medium">{pay.type === "in" ? "Payment Received" : "Payment Made"}</p>
                    <p className="text-[10px] text-muted-foreground">{pay.date} • {pay.paymentMode.toUpperCase()}</p>
                    {pay.note && <p className="text-[10px] text-muted-foreground">{pay.note}</p>}
                  </div>
                </div>
                <p className={`text-sm font-bold ${pay.type === "in" ? "text-emerald" : "text-destructive"}`}>
                  {pay.type === "in" ? "+" : "-"}₹{pay.amount.toLocaleString("en-IN")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
