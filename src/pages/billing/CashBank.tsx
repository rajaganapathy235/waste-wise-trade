import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling, BankAccount } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Plus, Pencil, Trash2, Star, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csvExport";

export default function CashBank() {
  const navigate = useNavigate();
  const { payments, expenses, bankAccounts, setBankAccounts } = useBilling();
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountType, setAccountType] = useState<"current" | "savings">("current");
  const [upiId, setUpiId] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);

  const cashIn = payments.filter(p => p.type === "in" && p.paymentMode === "cash").reduce((s, p) => s + p.amount, 0);
  const cashOut = payments.filter(p => p.type === "out" && p.paymentMode === "cash").reduce((s, p) => s + p.amount, 0);
  const cashExpenses = expenses.filter(e => e.paymentMode === "cash").reduce((s, e) => s + e.amount, 0);
  const cashBalance = cashIn - cashOut - cashExpenses;

  const bankIn = payments.filter(p => p.type === "in" && (p.paymentMode === "bank" || p.paymentMode === "upi")).reduce((s, p) => s + p.amount, 0);
  const bankOut = payments.filter(p => p.type === "out" && (p.paymentMode === "bank" || p.paymentMode === "upi")).reduce((s, p) => s + p.amount, 0);
  const bankExpenses = expenses.filter(e => e.paymentMode === "bank" || e.paymentMode === "upi").reduce((s, e) => s + e.amount, 0);
  const totalBankOpening = bankAccounts.reduce((s, b) => s + b.openingBalance, 0);
  const bankBalance = totalBankOpening + bankIn - bankOut - bankExpenses;
  const totalBalance = cashBalance + bankBalance;

  const resetForm = () => {
    setBankName(""); setAccountNumber(""); setIfsc(""); setAccountType("current"); setUpiId(""); setOpeningBalance(0); setEditId(null);
  };

  const openAdd = () => { resetForm(); setAddOpen(true); };

  const openEdit = (acc: BankAccount) => {
    setEditId(acc.id);
    setBankName(acc.bankName);
    setAccountNumber(acc.accountNumber);
    setIfsc(acc.ifsc);
    setAccountType(acc.accountType);
    setUpiId(acc.upiId || "");
    setOpeningBalance(acc.openingBalance);
    setAddOpen(true);
  };

  const handleSave = () => {
    if (!bankName || !accountNumber) { toast.error("Bank name and account number required"); return; }
    if (editId) {
      setBankAccounts(prev => prev.map(b => b.id === editId ? { ...b, bankName, accountNumber, ifsc, accountType, upiId: upiId || undefined, openingBalance } : b));
      toast.success("Bank account updated!");
    } else {
      const acc: BankAccount = {
        id: Date.now().toString(), bankName, accountNumber, ifsc, accountType,
        upiId: upiId || undefined, openingBalance, isDefault: bankAccounts.length === 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setBankAccounts(prev => [...prev, acc]);
      toast.success("Bank account added!");
    }
    setAddOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setBankAccounts(prev => prev.filter(b => b.id !== id));
    toast.success("Bank account removed");
  };

  const setDefault = (id: string) => {
    setBankAccounts(prev => prev.map(b => ({ ...b, isDefault: b.id === id })));
    toast.success("Default bank account updated");
  };

  const handleExport = () => {
    const headers = ["Bank Name", "Account No", "IFSC", "Type", "UPI ID", "Opening Balance", "Default"];
    const rows = bankAccounts.map(b => [b.bankName, b.accountNumber, b.ifsc, b.accountType, b.upiId || "", b.openingBalance, b.isDefault ? "Yes" : "No"]);
    exportToCSV("bank_accounts.csv", headers, rows);
    toast.success("CSV exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Cash & Bank</h1>
        <button onClick={handleExport} className="ml-auto text-[10px] text-primary font-semibold">Export CSV</button>
      </div>

      <div className="text-center mb-6">
        <p className="text-[10px] text-muted-foreground">Total Cash & Bank Balance</p>
        <p className="text-2xl font-bold">₹ {totalBalance.toLocaleString("en-IN")}</p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Cash in Hand</p>
            <p className="text-lg font-bold">₹ {cashBalance.toLocaleString("en-IN")}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">Bank Accounts</p>
        <button onClick={openAdd} className="text-xs text-primary font-semibold flex items-center gap-1">
          <Plus className="h-3 w-3" /> Add Bank
        </button>
      </div>

      {bankAccounts.length === 0 ? (
        <Card className="mb-4">
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            No bank accounts added yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mb-4">
          {bankAccounts.map(acc => (
            <Card key={acc.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{acc.bankName}</p>
                      {acc.isDefault && <Badge variant="outline" className="text-[8px] py-0">Default</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground">A/C: {acc.accountNumber}</p>
                    <p className="text-[10px] text-muted-foreground">IFSC: {acc.ifsc} • {acc.accountType}</p>
                    {acc.upiId && <p className="text-[10px] text-primary">UPI: {acc.upiId}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹ {acc.openingBalance.toLocaleString("en-IN")}</p>
                    <div className="flex gap-1 mt-1">
                      {!acc.isDefault && (
                        <button onClick={() => setDefault(acc.id)} className="p-1 hover:bg-secondary rounded"><Star className="h-3 w-3 text-muted-foreground" /></button>
                      )}
                      <button onClick={() => openEdit(acc)} className="p-1 hover:bg-secondary rounded"><Pencil className="h-3 w-3 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(acc.id)} className="p-1 hover:bg-secondary rounded"><Trash2 className="h-3 w-3 text-destructive" /></button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mb-4">
        <CardContent className="p-4 flex items-center justify-between">
          <p className="text-sm font-medium">Total Bank Balance</p>
          <p className="text-sm font-bold">₹ {bankBalance.toLocaleString("en-IN")}</p>
        </CardContent>
      </Card>

      {/* Add/Edit Bank Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-base">{editId ? "Edit" : "Add"} Bank Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs">Bank Name *</Label>
              <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="HDFC Bank" />
            </div>
            <div>
              <Label className="text-xs">Account Number *</Label>
              <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="50100XXXX1234" />
            </div>
            <div>
              <Label className="text-xs">IFSC Code</Label>
              <Input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} placeholder="HDFC0001234" />
            </div>
            <div>
              <Label className="text-xs">Account Type</Label>
              <Select value={accountType} onValueChange={v => setAccountType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">UPI ID (optional)</Label>
              <Input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="business@hdfcbank" />
            </div>
            <div>
              <Label className="text-xs">Opening Balance</Label>
              <Input type="number" value={openingBalance || ""} onChange={e => setOpeningBalance(Number(e.target.value))} placeholder="₹" />
            </div>
            <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Add"} Bank Account</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
