import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Search, FileDown, ShoppingCart, Wallet } from "lucide-react";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";

export default function TransactionReports() {
  const navigate = useNavigate();
  const { payments, expenses } = useBilling();
  const [filter, setFilter] = useState<"all" | "in" | "out" | "expense">("all");
  const [search, setSearch] = useState("");

  // Combine all
  const allTxns = [
    ...payments.map(p => ({
      id: p.id, date: p.date, label: p.type === "in" ? "Payment Received" : "Payment Made",
      party: p.partyName, amount: p.amount, type: p.type as "in" | "out" | "expense",
      mode: p.paymentMode, note: p.note || "", ref: p.invoiceRef || "",
    })),
    ...expenses.map(e => ({
      id: e.id, date: e.date, label: `Expense: ${e.category}`,
      party: e.category, amount: e.amount, type: "expense" as const,
      mode: e.paymentMode, note: e.note, ref: "",
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  let filtered = filter === "all" ? allTxns : allTxns.filter(t => t.type === filter);
  if (search) {
    const sq = search.toLowerCase();
    filtered = filtered.filter(t => t.party.toLowerCase().includes(sq) || t.label.toLowerCase().includes(sq) || t.note.toLowerCase().includes(sq));
  }

  const totalIn = allTxns.filter(t => t.type === "in").reduce((s, t) => s + t.amount, 0);
  const totalOut = allTxns.filter(t => t.type === "out").reduce((s, t) => s + t.amount, 0);
  const totalExp = allTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // Group by mode
  const byMode: Record<string, number> = {};
  allTxns.forEach(t => { byMode[t.mode] = (byMode[t.mode] || 0) + t.amount; });

  const handleExport = () => {
    const headers = ["Date", "Type", "Party/Category", "Amount (₹)", "Mode", "Note", "Invoice Ref"];
    const rows = filtered.map(t => [t.date, t.label, t.party, t.amount, t.mode, t.note, t.ref]);
    exportToCSV("transaction_report.csv", headers, rows);
    toast.success("Transaction Report exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Transaction Reports</h1>
        </div>
        <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
          <FileDown className="h-3 w-3" /> CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
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
        <Card className="bg-gold/5">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Expenses</p>
            <p className="text-sm font-bold text-gold">₹{totalExp.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Mode Breakdown */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">By Payment Mode</p>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(byMode).map(([mode, amt]) => (
              <div key={mode} className="text-center">
                <p className="text-xs font-bold">₹{amt.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{mode}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search + Filter */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="pl-9 h-8 text-xs" />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {([
          { val: "all" as const, label: "All" },
          { val: "in" as const, label: "Received" },
          { val: "out" as const, label: "Paid" },
          { val: "expense" as const, label: "Expenses" },
        ]).map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${filter === f.val ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No transactions found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(txn => (
            <Card key={txn.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {txn.type === "in" ? <ArrowDownLeft className="h-4 w-4 text-emerald" /> :
                   txn.type === "expense" ? <Wallet className="h-4 w-4 text-gold" /> :
                   <ArrowUpRight className="h-4 w-4 text-destructive" />}
                  <div>
                    <p className="text-sm font-medium">{txn.label}</p>
                    {txn.party && <p className="text-[10px] text-muted-foreground">{txn.party}</p>}
                    <p className="text-[10px] text-muted-foreground">{txn.date} • {txn.mode.toUpperCase()}</p>
                    {txn.note && <p className="text-[10px] text-muted-foreground italic">{txn.note}</p>}
                  </div>
                </div>
                <p className={`text-sm font-bold ${txn.type === "in" ? "text-emerald" : txn.type === "expense" ? "text-gold" : "text-destructive"}`}>
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
