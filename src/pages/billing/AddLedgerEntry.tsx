import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BillingHeader from "@/components/BillingHeader";
import { useSafeBack } from "@/hooks/use-safe-back";
import { toast } from "sonner";

type EntryType = "Sales" | "Purchase" | "Purchase Return" | "Sales Return" | "Payment Out" | "Payment In";

const DEBIT_TYPES: EntryType[] = ["Sales", "Purchase Return", "Payment Out"];
const CREDIT_TYPES: EntryType[] = ["Purchase", "Sales Return", "Payment In"];

export default function AddLedgerEntry() {
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing");
  const { partyId, partyName } = (location.state as { partyId: string; partyName: string }) || { partyId: "", partyName: "Party" };

  const [entryType, setEntryType] = useState<EntryType>("Sales");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [particular, setParticular] = useState("Sales");
  const [vchNo, setVchNo] = useState("");

  const isDebit = DEBIT_TYPES.includes(entryType);

  const handleTypeChange = (type: EntryType) => {
    setEntryType(type);
    setParticular(type);
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    toast.success(`Ledger entry added: ${entryType} ₹${amount}`);
    goBack();
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative">
      <BillingHeader title="Add Ledger Entry" showBack onBack={goBack} />

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        {/* Party name */}
        <p className="text-center text-base font-bold text-destructive">{partyName}</p>
        <p className="text-center text-sm text-muted-foreground mt-0.5 mb-4">Ledger Entry Type</p>

        {/* Debit / Credit grid */}
        <div className="border border-border rounded-lg overflow-hidden mb-6">
          <div className="grid grid-cols-2">
            <div className="bg-destructive/10 px-3 py-2">
              <p className="text-sm font-bold text-destructive text-center">Debit</p>
            </div>
            <div className="bg-accent/10 px-3 py-2">
              <p className="text-sm font-bold text-accent text-center">Credit</p>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="px-3 py-3 space-y-3">
              {DEBIT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleTypeChange(type)}>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    entryType === type ? "border-primary" : "border-muted-foreground/40"
                  }`}>
                    {entryType === type && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-sm text-foreground">{type}</span>
                </label>
              ))}
            </div>
            <div className="px-3 py-3 space-y-3">
              {CREDIT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleTypeChange(type)}>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    entryType === type ? "border-primary" : "border-muted-foreground/40"
                  }`}>
                    {entryType === type && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-sm text-foreground">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-5">
          {/* Date */}
          <div className="flex items-start gap-3">
            <CalendarDays className="h-6 w-6 text-muted-foreground mt-5 shrink-0" />
            <div className="flex-1">
              <label className="text-xs font-medium text-primary">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-0 border-b border-primary rounded-none px-0 shadow-none focus-visible:ring-0 text-base font-semibold"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-start gap-3">
            <CalendarDays className="h-6 w-6 text-muted-foreground mt-5 shrink-0" />
            <div className="flex-1">
              <label className="text-xs font-medium text-primary">Amount</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="border-0 border-b border-primary rounded-none px-0 shadow-none focus-visible:ring-0 text-base font-semibold"
              />
            </div>
          </div>

          {/* Particular */}
          <div className="flex items-start gap-3">
            <CalendarDays className="h-6 w-6 text-muted-foreground mt-5 shrink-0" />
            <div className="flex-1">
              <label className="text-xs font-medium text-primary">Particular</label>
              <Input
                value={particular}
                onChange={(e) => setParticular(e.target.value)}
                className="border-0 border-b border-primary rounded-none px-0 shadow-none focus-visible:ring-0 text-base font-bold text-primary"
              />
            </div>
          </div>

          {/* Vch No */}
          <div className="flex items-start gap-3">
            <CalendarDays className="h-6 w-6 text-muted-foreground mt-5 shrink-0" />
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Vch No. ( optional )</label>
              <Input
                value={vchNo}
                onChange={(e) => setVchNo(e.target.value)}
                className="border-0 border-b border-primary rounded-none px-0 shadow-none focus-visible:ring-0 text-base"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Submit button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30">
        <Button
          onClick={handleSubmit}
          className="w-full h-14 rounded-none text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Add Entry
        </Button>
      </div>
    </div>
  );
}
