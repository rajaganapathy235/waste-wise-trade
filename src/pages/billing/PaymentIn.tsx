import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling, Payment } from "@/lib/billingContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";

export default function PaymentIn() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing");
  const { parties, setPayments } = useBilling();
  const [partyId, setPartyId] = useState("");
  const [amount, setAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<Payment["paymentMode"]>("upi");
  const [note, setNote] = useState("");

  const selectedParty = parties.find(p => p.id === partyId);

  const handleSave = () => {
    if (!partyId || !amount) { toast.error("Party and amount required"); return; }
    const payment: Payment = {
      id: Date.now().toString(), type: "in", partyId, partyName: selectedParty?.name || "",
      amount, paymentMode, date: new Date().toISOString().slice(0, 10), note: note || undefined,
    };
    setPayments(prev => [payment, ...prev]);
    toast.success("Payment recorded!");
    navigate(-1);
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={goBack}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Record Payment In</h1>
      </div>

      <div className="bg-gold/10 rounded-lg p-3 mb-4">
        <p className="text-xs text-primary font-semibold">Received Payment #{(Math.floor(Math.random() * 99) + 1)}</p>
        <p className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
      </div>

      <div className="space-y-5">
        <div>
          <Label className="text-xs font-semibold uppercase">Party Name *</Label>
          <div className="flex items-center gap-2 mt-1 border rounded-lg px-3 py-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select value={partyId} onValueChange={setPartyId}>
              <SelectTrigger className="border-0 p-0 h-auto focus:ring-0"><SelectValue placeholder="Search/Create Party" /></SelectTrigger>
              <SelectContent>{parties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <Label className="text-xs font-semibold uppercase">Amount *</Label>
          <Input type="number" value={amount || ""} onChange={e => setAmount(Number(e.target.value))} placeholder="₹" className="text-lg font-bold mt-1" />
        </div>

        <div className="border-t border-border pt-4">
          <Label className="text-xs font-semibold uppercase">Payment Mode</Label>
          <Select value={paymentMode} onValueChange={v => setPaymentMode(v as any)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button className="text-xs text-primary font-semibold">+ Note</button>
        {note !== "" || true ? (
          <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." className="h-16 text-xs" />
        ) : null}

        <Button onClick={handleSave} className="w-full">Save Payment</Button>
      </div>
    </div>
  );
}
