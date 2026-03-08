import { useState } from "react";
import { Search, Info, Share2, Pencil, MinusCircle, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type BillFilter = "Sales" | "Purchase" | "Quotation";

interface Bill {
  id: string;
  invoiceNo: number;
  date: number;
  month: string;
  year: number;
  partyName: string;
  amount: number;
  type: BillFilter;
  ledgerEntry: boolean;
}

const MOCK_BILLS: Bill[] = [
  { id: "b1", invoiceNo: 72, date: 30, month: "Jan", year: 2026, partyName: "SR COTTON", amount: 65889.00, type: "Sales", ledgerEntry: true },
  { id: "b2", invoiceNo: 71, date: 27, month: "Jan", year: 2026, partyName: "SR COTTON", amount: 67219.00, type: "Sales", ledgerEntry: true },
  { id: "b3", invoiceNo: 70, date: 23, month: "Jan", year: 2026, partyName: "SR COTTON", amount: 65571.00, type: "Sales", ledgerEntry: true },
  { id: "b4", invoiceNo: 69, date: 19, month: "Jan", year: 2026, partyName: "SR COTTON", amount: 66073.00, type: "Sales", ledgerEntry: true },
  { id: "b5", invoiceNo: 68, date: 17, month: "Jan", year: 2026, partyName: "SR COTTON", amount: 65700.00, type: "Sales", ledgerEntry: true },
  { id: "b6", invoiceNo: 15, date: 10, month: "Jan", year: 2026, partyName: "SR COTTON", amount: 32500.00, type: "Purchase", ledgerEntry: false },
  { id: "b7", invoiceNo: 5, date: 5, month: "Jan", year: 2026, partyName: "SR COTTON", amount: 15000.00, type: "Quotation", ledgerEntry: false },
];

export default function BillsTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BillFilter>("Sales");
  const filters: BillFilter[] = ["Sales", "Purchase", "Quotation"];

  const filtered = MOCK_BILLS.filter(
    (b) => b.type === filter && (!search || b.partyName.toLowerCase().includes(search.toLowerCase()) || String(b.invoiceNo).includes(search))
  );

  const totalCount = MOCK_BILLS.filter(b => b.type === filter).length;

  return (
    <div className="relative min-h-[60vh]">
      {/* Search */}
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Here"
          className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto py-0 text-sm"
        />
      </div>

      {/* Bill Cards */}
      <div className="space-y-3">
        {filtered.map((bill) => (
          <Card key={bill.id} className="border-border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="flex gap-3 p-3">
                {/* Date Circle */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-10 w-10 rounded-full bg-emerald flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-foreground">{bill.date}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{bill.month}-{bill.year}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-base font-bold text-foreground">#{bill.invoiceNo}</p>
                    <p className="text-base font-bold text-gold">{bill.amount.toFixed(2)} ₹</p>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-semibold text-foreground">{bill.partyName}</p>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button onClick={() => toast.info(`Bill #${bill.invoiceNo} details`)} className="h-7 w-7 rounded-full border border-primary flex items-center justify-center">
                        <Info className="h-3.5 w-3.5 text-primary" />
                      </button>
                      <button onClick={() => toast.info("Share")} className="h-7 w-7 rounded-full border border-emerald flex items-center justify-center">
                        <Share2 className="h-3.5 w-3.5 text-emerald" />
                      </button>
                      <button onClick={() => toast.info("Edit")} className="h-7 w-7 rounded-full border border-gold flex items-center justify-center">
                        <Pencil className="h-3.5 w-3.5 text-gold" />
                      </button>
                      <button onClick={() => toast.info("Delete")} className="h-7 w-7 rounded-full border border-emerald flex items-center justify-center">
                        <MinusCircle className="h-3.5 w-3.5 text-emerald" />
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded text-xs font-bold bg-gold text-gold-foreground">Copies</span>
                    <span className="px-3 py-1 rounded text-xs font-bold bg-primary text-primary-foreground flex items-center gap-1">
                      Ledger Entry {bill.ledgerEntry && "✓"}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center ml-auto">
                      <span className="text-xs font-bold text-navy-foreground">L</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No bills found</p>
        )}
      </div>

      {/* Filter toggle */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20">
        <div className="flex border border-emerald rounded-full overflow-hidden">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 text-sm font-semibold transition-colors ${filter === f ? "bg-emerald text-emerald-foreground" : "bg-card text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-28 right-6 h-14 w-14 rounded-full bg-emerald hover:bg-emerald/90 text-emerald-foreground shadow-lg flex items-center justify-center z-20">
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
}
