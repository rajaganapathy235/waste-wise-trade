import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useParties } from "@/hooks/useParties";
import { useLedger } from "@/hooks/useLedger";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PartyBalance {
  id: string;
  name: string;
  initials: string;
  type: string;
  balance: number;
}

export default function AnalyticsTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { parties, loading: partiesLoading } = useParties();
  const [partyBalances, setPartyBalances] = useState<PartyBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || partiesLoading) return;

    const fetchAllLedgers = async () => {
      if (parties.length === 0) {
        setPartyBalances([]);
        setLoading(false);
        return;
      }

      const { data: allEntries } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("user_id", user.id);

      const balances = parties.map((party) => {
        const entries = (allEntries || []).filter(e => e.party_id === party.id);
        const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0);
        const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0);
        return {
          id: party.id,
          name: party.name,
          initials: party.initials || party.name.slice(0, 2).toUpperCase(),
          type: party.type,
          balance: totalDebit - totalCredit,
        };
      });

      setPartyBalances(balances);
      setLoading(false);
    };

    fetchAllLedgers();
  }, [user, parties, partiesLoading]);

  const totalCollect = partyBalances.filter((p) => p.balance > 0).reduce((s, p) => s + p.balance, 0);
  const totalPay = partyBalances.filter((p) => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0);
  const netBalance = totalCollect - totalPay;
  const collectParties = partyBalances.filter((p) => p.balance > 0);
  const payParties = partyBalances.filter((p) => p.balance < 0);

  if (loading || partiesLoading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm bg-accent/10 overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center"><ArrowDownRight className="h-4 w-4 text-accent" /></div>
              <p className="text-[10px] font-medium text-muted-foreground">To Collect</p>
            </div>
            <p className="text-lg font-bold text-accent">₹{totalCollect.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{collectParties.length} parties</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-destructive/10 overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center"><ArrowUpRight className="h-4 w-4 text-destructive" /></div>
              <p className="text-[10px] font-medium text-muted-foreground">To Pay</p>
            </div>
            <p className="text-lg font-bold text-destructive">₹{totalPay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{payParties.length} parties</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {netBalance >= 0 ? <TrendingUp className="h-5 w-5 text-accent" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
            <p className="text-sm font-bold text-foreground">Net Balance</p>
          </div>
          <p className={`text-base font-bold ${netBalance >= 0 ? "text-accent" : "text-destructive"}`}>
            ₹{Math.abs(netBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })} {netBalance >= 0 ? "CR" : "DR"}
          </p>
        </CardContent>
      </Card>

      {collectParties.length > 0 && (
        <div>
          <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" />Need to Collect ({collectParties.length})</p>
          <div className="space-y-2">
            {collectParties.sort((a, b) => b.balance - a.balance).map((party) => (
              <Card key={party.id} className="border-border shadow-sm cursor-pointer active:bg-muted/50 transition-colors" onClick={() => navigate(`/billing/ledger/${party.id}`, { state: { partyId: party.id, partyName: party.name } })}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0"><span className="text-xs font-bold text-accent">{party.initials}</span></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{party.name}</p>
                    <p className="text-[10px] text-muted-foreground">{party.type === "Customers" ? "Customer" : "Supplier"}</p>
                  </div>
                  <p className="text-sm font-bold text-accent">₹{party.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {payParties.length > 0 && (
        <div>
          <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" />Need to Pay ({payParties.length})</p>
          <div className="space-y-2">
            {payParties.sort((a, b) => a.balance - b.balance).map((party) => (
              <Card key={party.id} className="border-border shadow-sm cursor-pointer active:bg-muted/50 transition-colors" onClick={() => navigate(`/billing/ledger/${party.id}`, { state: { partyId: party.id, partyName: party.name } })}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0"><span className="text-xs font-bold text-destructive">{party.initials}</span></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{party.name}</p>
                    <p className="text-[10px] text-muted-foreground">{party.type === "Customers" ? "Customer" : "Supplier"}</p>
                  </div>
                  <p className="text-sm font-bold text-destructive">₹{Math.abs(party.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {collectParties.length === 0 && payParties.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No ledger data found</div>
      )}
    </div>
  );
}
