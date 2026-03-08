import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, FileDown, TrendingUp } from "lucide-react";
import BillingHeader from "@/components/BillingHeader";
import { useSafeBack } from "@/hooks/use-safe-back";

type DateFilter = "All" | "This Month" | "This Year" | "Date Range";

interface LedgerEntry {
  id: string;
  date: string;
  type: "SALES" | "PURCHASE";
  invoiceNo: number;
  credit: number;
  debit: number;
}

const MOCK_ENTRIES: Record<string, LedgerEntry[]> = {
  p1: [
    { id: "l1", date: "19-Nov-2025", type: "SALES", invoiceNo: 52, credit: 0, debit: 74332.00 },
    { id: "l2", date: "29-Dec-2026", type: "SALES", invoiceNo: 62, credit: 0, debit: 14114.00 },
  ],
  p3: [
    { id: "l3", date: "30-Jan-2026", type: "SALES", invoiceNo: 72, credit: 0, debit: 65889.00 },
    { id: "l4", date: "27-Jan-2026", type: "SALES", invoiceNo: 71, credit: 0, debit: 67219.00 },
  ],
};

export default function PartyLedger() {
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing");
  const { partyId, partyName } = (location.state as { partyId: string; partyName: string }) || { partyId: "", partyName: "Party" };

  const [dateFilter, setDateFilter] = useState<DateFilter>("All");
  const dateFilters: DateFilter[] = ["All", "This Month", "This Year", "Date Range"];

  const storedEntries = JSON.parse(localStorage.getItem(`ledger_entries_${partyId}`) || "[]");
  const entries = [...(MOCK_ENTRIES[partyId] || []), ...storedEntries];
  const openingBalance = 0;
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0);
  const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
  const closingBalance = totalCredit - totalDebit;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative">
      <BillingHeader title={`Ledger : ${partyName}`} showBack onBack={goBack} />

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-40">
        {/* Date filter chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {dateFilters.map((f) => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                dateFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Summary row */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">All Records ({entries.length})</p>
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Opening Balance</span>{" "}
            <span className="font-bold text-foreground">{openingBalance.toFixed(2)}</span>
          </p>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3">
            <div className="bg-secondary px-3 py-2.5">
              <p className="text-xs font-bold text-foreground">Particular</p>
            </div>
            <div className="bg-accent px-3 py-2.5">
              <p className="text-xs font-bold text-accent-foreground text-center">Credit</p>
            </div>
            <div className="bg-destructive px-3 py-2.5">
              <p className="text-xs font-bold text-destructive-foreground text-center">Debit</p>
            </div>
          </div>

          {/* Rows */}
          {entries.map((entry, i) => (
            <div key={entry.id} className="grid grid-cols-3 border-t border-border">
              <div className="px-3 py-2.5">
                <div className="flex items-start gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground bg-secondary rounded px-1">{i + 1}</span>
                  <div>
                    <p className="text-xs font-bold text-primary">{entry.date}</p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive/10 text-destructive">
                      {entry.type}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{entry.invoiceNo}</p>
                  </div>
                </div>
              </div>
              <div className="px-3 py-2.5 flex items-start justify-center border-l border-border">
                {entry.credit > 0 && (
                  <p className="text-xs font-bold text-accent">{entry.credit.toFixed(2)}</p>
                )}
              </div>
              <div className="px-3 py-2.5 flex items-start justify-end border-l border-border">
                {entry.debit > 0 && (
                  <p className="text-xs font-bold text-destructive">{entry.debit.toFixed(2)}</p>
                )}
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No records found</div>
          )}
        </div>
      </main>

      {/* FAB */}
      <button onClick={() => navigate(`/billing/ledger/${partyId}/add`, { state: { partyId, partyName } })} className="fixed bottom-36 right-6 h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg flex items-center justify-center z-20">
        <Plus className="h-7 w-7" />
      </button>

      {/* Bottom totals bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-30">
        {/* Totals row */}
        <div className="grid grid-cols-3 px-4 py-2 border-b border-border">
          <p className="text-xs font-bold text-foreground">Total</p>
          <p className="text-xs font-bold text-accent text-center">{totalCredit.toFixed(2)}</p>
          <p className="text-xs font-bold text-destructive text-right">{totalDebit.toFixed(2)}</p>
        </div>
        {/* Closing balance + PDF */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <button className="flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg px-4 py-2">
            <span className="text-sm font-bold">PDF</span>
            <TrendingUp className="h-4 w-4" />
          </button>
          <div className="text-right">
            <p className="text-xs text-primary font-medium">Closing Balance</p>
            <p className="text-sm font-bold text-destructive">
              {closingBalance.toFixed(2)} {closingBalance < 0 ? "DR" : "CR"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
