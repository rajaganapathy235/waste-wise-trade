import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Repeat, Calendar, Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";

export interface RecurringInvoice {
  id: string;
  partyId: string;
  partyName: string;
  itemDescription: string;
  amount: number;
  gstRate: number;
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
  nextDate: string;
  isActive: boolean;
  createdAt: string;
  totalGenerated: number;
}

export default function RecurringInvoices() {
  const navigate = useNavigate();
  const { parties } = useBilling();
  const [recurring, setRecurring] = useState<RecurringInvoice[]>([
    {
      id: "rec1", partyId: "p1", partyName: "Kiran Enterprises",
      itemDescription: "Comber Noil (40s White) — 500 KG", amount: 42500, gstRate: 5,
      frequency: "monthly", nextDate: "2026-04-01", isActive: true, createdAt: "2026-03-01", totalGenerated: 2,
    },
  ]);
  const [createOpen, setCreateOpen] = useState(false);
  const [partyId, setPartyId] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const [gstRate, setGstRate] = useState(5);
  const [frequency, setFrequency] = useState<RecurringInvoice["frequency"]>("monthly");

  const selectedParty = parties.find(p => p.id === partyId);

  const handleCreate = () => {
    if (!partyId || !itemDesc || !amount) {
      toast.error("Fill all required fields");
      return;
    }
    const nextMap: Record<string, number> = { weekly: 7, monthly: 30, quarterly: 90, yearly: 365 };
    const next = new Date();
    next.setDate(next.getDate() + nextMap[frequency]);

    const rec: RecurringInvoice = {
      id: Date.now().toString(), partyId, partyName: selectedParty?.name || "",
      itemDescription: itemDesc, amount, gstRate, frequency,
      nextDate: next.toISOString().slice(0, 10), isActive: true,
      createdAt: new Date().toISOString().slice(0, 10), totalGenerated: 0,
    };
    setRecurring(prev => [rec, ...prev]);
    toast.success("Recurring invoice created!");
    setCreateOpen(false);
    setPartyId(""); setItemDesc(""); setAmount(0);
  };

  const toggleActive = (id: string) => {
    setRecurring(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const deleteRecurring = (id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
    toast.success("Recurring invoice deleted");
  };

  const freqLabel: Record<string, string> = { weekly: "Weekly", monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Recurring Invoices</h1>
      </div>

      <div className="bg-primary/5 rounded-lg p-3 mb-4 flex items-start gap-3">
        <Repeat className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <p className="text-xs font-semibold">Auto-generate invoices</p>
          <p className="text-[10px] text-muted-foreground">Set up recurring billing for repeat parties. Invoices will be auto-generated based on frequency.</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {recurring.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No recurring invoices yet</div>
        ) : recurring.map(rec => (
          <Card key={rec.id} className={`${!rec.isActive ? "opacity-60" : ""}`}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold">{rec.partyName}</p>
                  <p className="text-[10px] text-muted-foreground">{rec.itemDescription}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleActive(rec.id)} className="p-1.5 rounded-md hover:bg-secondary">
                    {rec.isActive ? <Pause className="h-3.5 w-3.5 text-gold" /> : <Play className="h-3.5 w-3.5 text-emerald" />}
                  </button>
                  <button onClick={() => deleteRecurring(rec.id)} className="p-1.5 rounded-md hover:bg-secondary">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[9px]">{freqLabel[rec.frequency]}</Badge>
                <Badge variant={rec.isActive ? "default" : "secondary"} className="text-[9px]">
                  {rec.isActive ? "Active" : "Paused"}
                </Badge>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Next: {rec.nextDate}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <p className="text-sm font-bold">₹{rec.amount.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground">{rec.totalGenerated} invoices generated</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={() => setCreateOpen(true)} className="w-full gap-1.5">
        <Plus className="h-4 w-4" /> New Recurring Invoice
      </Button>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader><DialogTitle className="text-base">New Recurring Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs">Party *</Label>
              <Select value={partyId} onValueChange={setPartyId}>
                <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
                <SelectContent>{parties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Item / Description *</Label>
              <Input value={itemDesc} onChange={e => setItemDesc(e.target.value)} placeholder="Comber Noil — 500 KG" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Amount (₹) *</Label>
                <Input type="number" value={amount || ""} onChange={e => setAmount(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">GST Rate</Label>
                <Select value={String(gstRate)} onValueChange={v => setGstRate(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 5, 12, 18, 28].map(r => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Frequency *</Label>
              <Select value={frequency} onValueChange={v => setFrequency(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} className="w-full">Create Recurring Invoice</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
