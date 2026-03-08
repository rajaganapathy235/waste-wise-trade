import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bills..."
          className="pl-9 h-10 text-sm bg-secondary border-0"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? f === "Sales" ? "bg-accent text-accent-foreground" : f === "Purchase" ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bill Cards */}
      <div className="space-y-2">
        {filtered.map((bill) => (
          <Card key={bill.id} className="border-border shadow-sm">
            <CardContent className="p-3 flex items-start gap-3">
              {/* Date Circle */}
              <div className="flex flex-col items-center shrink-0">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">{bill.date}</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5">{bill.month}-{bill.year}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-bold text-foreground">#{bill.invoiceNo}</p>
                  <p className="text-sm font-bold text-primary">₹{bill.amount.toFixed(2)}</p>
                </div>

                <p className="text-xs text-muted-foreground mt-0.5">{bill.partyName}</p>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 mt-2">
                  <button onClick={() => toast.info(`Bill #${bill.invoiceNo} details`)} className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Info className="h-3.5 w-3.5 text-primary" />
                  </button>
                  <button onClick={() => toast.info("Share")} className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center">
                    <Share2 className="h-3.5 w-3.5 text-accent" />
                  </button>
                  <button onClick={() => toast.info("Edit")} className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => toast.info("Delete")} className="h-7 w-7 rounded-full bg-destructive/10 flex items-center justify-center">
                    <MinusCircle className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">Copies</span>
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">
                    Ledger {bill.ledgerEntry && "✓"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No bills found</div>
        )}
      </div>

      {/* FAB */}
      <button className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg flex items-center justify-center z-20">
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
}
