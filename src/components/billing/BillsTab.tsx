import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Info, Share2, Pencil, MinusCircle, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useBills } from "@/hooks/useBills";
import { useParties } from "@/hooks/useParties";

type BillFilter = "Sales" | "Purchase" | "Quotation";

export default function BillsTab() {
  const navigate = useNavigate();
  const { bills, loading } = useBills();
  const { parties } = useParties();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BillFilter>("Sales");
  const filters: BillFilter[] = ["Sales", "Purchase", "Quotation"];

  const filtered = bills.filter(
    (b) => b.bill_type === filter && (!search || 
      String(b.bill_no).includes(search) ||
      parties.find(p => p.id === b.party_id)?.name.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bills..." className="pl-9 h-10 text-sm bg-secondary border-0" />
      </div>
      <div className="flex gap-2">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === f ? f === "Sales" ? "bg-accent text-accent-foreground" : f === "Purchase" ? "bg-primary text-primary-foreground" : "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>{f}</button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((bill) => {
          const party = parties.find(p => p.id === bill.party_id);
          const date = new Date(bill.date || bill.created_at);
          return (
            <Card key={bill.id} className="border-border shadow-sm">
              <CardContent className="p-3 flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-accent">{date.getDate()}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{date.toLocaleString("en", { month: "short" })}-{date.getFullYear()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-bold text-foreground">#{bill.bill_no}</p>
                    <p className="text-sm font-bold text-primary">₹{(bill.total || 0).toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{party?.name || "Unknown"}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <button onClick={() => toast.info(`Bill #${bill.bill_no} details`)} className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center"><Info className="h-3.5 w-3.5 text-primary" /></button>
                    <button onClick={() => toast.info("Share")} className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center"><Share2 className="h-3.5 w-3.5 text-accent" /></button>
                    <button onClick={() => toast.info("Edit")} className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => toast.info("Delete")} className="h-7 w-7 rounded-full bg-destructive/10 flex items-center justify-center"><MinusCircle className="h-3.5 w-3.5 text-destructive" /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No bills found</div>}
      </div>
      <button onClick={() => navigate("/billing/generate-bill", { state: { billType: filter } })} className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg flex items-center justify-center z-20"><Plus className="h-7 w-7" /></button>
    </div>
  );
}
