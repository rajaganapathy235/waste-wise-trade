import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Users, Search, FileDown } from "lucide-react";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";

export default function PartyReports() {
  const navigate = useNavigate();
  const { parties, payments } = useBilling();
  const [filter, setFilter] = useState<"all" | "collect" | "pay">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const filteredPayments = payments.filter(p => isInDateRange(p.date, dateRange));

  const getOutstanding = (p: typeof parties[0]) => {
    if (p.balanceType === "collect") {
      const received = filteredPayments.filter(pay => pay.partyId === p.id && pay.type === "in").reduce((s, pay) => s + pay.amount, 0);
      return Math.max(0, p.openingBalance - received);
    } else {
      const paid = filteredPayments.filter(pay => pay.partyId === p.id && pay.type === "out").reduce((s, pay) => s + pay.amount, 0);
      return Math.max(0, p.openingBalance - paid);
    }
  };

  const getTxnCount = (partyId: string) => filteredPayments.filter(p => p.partyId === partyId).length;
  const getTotalVolume = (partyId: string) => filteredPayments.filter(p => p.partyId === partyId).reduce((s, p) => s + p.amount, 0);

  let filtered = filter === "all" ? parties : parties.filter(p => p.balanceType === filter);
  if (search) {
    const sq = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(sq) || p.gstin.toLowerCase().includes(sq));
  }

  const totalReceivable = parties.filter(p => p.balanceType === "collect").reduce((s, p) => s + getOutstanding(p), 0);
  const totalPayable = parties.filter(p => p.balanceType === "pay").reduce((s, p) => s + getOutstanding(p), 0);

  const handleExport = () => {
    const headers = ["Party Name", "GSTIN", "Type", "Outstanding (₹)", "Transactions", "Volume (₹)", "State"];
    const rows = filtered.map(p => [p.name, p.gstin, p.type, getOutstanding(p), getTxnCount(p.id), getTotalVolume(p.id), p.state]);
    exportToCSV("party_report.csv", headers, rows);
    toast.success("Party Report exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Party Reports</h1>
        </div>
        <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
          <FileDown className="h-3 w-3" /> CSV
        </button>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="bg-emerald/5">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">To Collect</p>
            <p className="text-sm font-bold text-emerald">₹{totalReceivable.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">To Pay</p>
            <p className="text-sm font-bold text-destructive">₹{totalPayable.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Total Parties</p>
            <p className="text-sm font-bold">{parties.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parties..." className="pl-9 h-8 text-xs" />
      </div>
      <div className="flex gap-2 mb-4">
        {([{ val: "all", label: "All" }, { val: "collect", label: "To Collect" }, { val: "pay", label: "To Pay" }] as const).map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${filter === f.val ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No parties found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const outstanding = getOutstanding(p);
            const txnCount = getTxnCount(p.id);
            const volume = getTotalVolume(p.id);
            return (
              <Card key={p.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate(`/billing/party/${p.id}`)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">{p.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.gstin || "No GSTIN"} • {p.state}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold flex items-center gap-0.5 ${p.balanceType === "collect" ? "text-emerald" : "text-destructive"}`}>
                        ₹{outstanding.toLocaleString("en-IN")}
                        {p.balanceType === "collect" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-[10px] text-muted-foreground mt-1">
                    <span>{txnCount} transactions</span>
                    <span>Volume: ₹{volume.toLocaleString("en-IN")}</span>
                    <span className="capitalize">{p.type}</span>
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
