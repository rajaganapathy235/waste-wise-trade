import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling, Expense } from "@/lib/billingContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";

const EXPENSE_CATEGORIES = ["Transport", "Office", "Labour", "Electricity", "Rent", "Maintenance", "Packaging", "Commission", "Other"];

export default function ExpensePage() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing");
  const { expenses, setExpenses } = useBilling();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "bank">("cash");

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const handleSave = () => {
    if (!category || !amount) { toast.error("Category and amount required"); return; }
    const expense: Expense = {
      id: Date.now().toString(), category, amount, paymentMode,
      date: new Date().toISOString().slice(0, 10), note,
    };
    setExpenses(prev => [expense, ...prev]);
    toast.success("Expense recorded!");
    setShowForm(false);
    setCategory(""); setAmount(0); setNote("");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={goBack}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Expenses</h1>
      </div>

      <Card className="mb-4 bg-destructive/5">
        <CardContent className="p-4 text-center">
          <Wallet className="h-6 w-6 mx-auto mb-2 text-destructive" />
          <p className="text-[10px] text-muted-foreground">Total Expenses</p>
          <p className="text-xl font-bold">₹ {totalExpenses.toLocaleString("en-IN")}</p>
        </CardContent>
      </Card>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full mb-4 gap-1.5">
          <Plus className="h-4 w-4" /> Record Expense
        </Button>
      ) : (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <div>
              <Label className="text-xs">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Amount *</Label>
              <Input type="number" value={amount || ""} onChange={e => setAmount(Number(e.target.value))} placeholder="₹ 0" />
            </div>
            <div>
              <Label className="text-xs">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={v => setPaymentMode(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Note..." className="h-16 text-xs" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} className="flex-1">Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {expenses.map(exp => (
          <Card key={exp.id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{exp.category}</p>
                <p className="text-[10px] text-muted-foreground">{exp.date} • {exp.paymentMode.toUpperCase()}</p>
                {exp.note && <p className="text-[10px] text-muted-foreground">{exp.note}</p>}
              </div>
              <p className="text-sm font-bold text-destructive">₹{exp.amount.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
