import { useNavigate } from "react-router-dom";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Calendar } from "lucide-react";

export default function Daybook() {
  const navigate = useNavigate();
  const { payments, expenses } = useBilling();

  // Combine all transactions into one chronological list
  const allTxns = [
    ...payments.map(p => ({ id: p.id, date: p.date, label: p.type === "in" ? "Payment Received" : "Payment Made", party: p.partyName, amount: p.amount, type: p.type as "in" | "out", mode: p.paymentMode, note: p.note })),
    ...expenses.map(e => ({ id: e.id, date: e.date, label: `Expense: ${e.category}`, party: "", amount: e.amount, type: "out" as const, mode: e.paymentMode, note: e.note })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const totalIn = allTxns.filter(t => t.type === "in").reduce((s, t) => s + t.amount, 0);
  const totalOut = allTxns.filter(t => t.type === "out").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Daybook</h1>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium">All Transactions</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="bg-emerald/5">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Total In</p>
            <p className="text-sm font-bold text-emerald">₹{totalIn.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Total Out</p>
            <p className="text-sm font-bold text-destructive">₹{totalOut.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
      </div>

      {allTxns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No transactions yet</div>
      ) : (
        <div className="space-y-2">
          {allTxns.map(txn => (
            <Card key={txn.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {txn.type === "in" ? <ArrowDownLeft className="h-4 w-4 text-emerald" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                  <div>
                    <p className="text-sm font-medium">{txn.label}</p>
                    {txn.party && <p className="text-[10px] text-muted-foreground">{txn.party}</p>}
                    <p className="text-[10px] text-muted-foreground">{txn.date} • {txn.mode.toUpperCase()}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${txn.type === "in" ? "text-emerald" : "text-destructive"}`}>
                  {txn.type === "in" ? "+" : "-"}₹{txn.amount.toLocaleString("en-IN")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
