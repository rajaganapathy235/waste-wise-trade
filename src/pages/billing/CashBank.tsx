import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling, BankAccount } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Plus, Pencil, Trash2, Star, Building2, ArrowRightLeft, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csvExport";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";

export default function CashBank() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing");
  const { payments, expenses, bankAccounts, setBankAccounts, setPayments } = useBilling();
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountType, setAccountType] = useState<"current" | "savings">("current");
  const [upiId, setUpiId] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [activeTab, setActiveTab] = useState("accounts");

  // Add/Reduce Money dialog
  const [moneyOpen, setMoneyOpen] = useState(false);
  const [moneyType, setMoneyType] = useState<"add" | "reduce">("add");
  const [moneyAmount, setMoneyAmount] = useState(0);
  const [moneyMode, setMoneyMode] = useState<"cash" | "bank">("cash");
  const [moneyNote, setMoneyNote] = useState("");

  // Transfer Money dialog
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState<"cash" | string>("cash");
  const [transferTo, setTransferTo] = useState<"cash" | string>("cash");
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferNote, setTransferNote] = useState("");

  const filteredPayments = payments.filter(p => isInDateRange(p.date, dateRange));
  const filteredExpenses = expenses.filter(e => isInDateRange(e.date, dateRange));

  const cashIn = filteredPayments.filter(p => p.type === "in" && p.paymentMode === "cash").reduce((s, p) => s + p.amount, 0);
  const cashOut = filteredPayments.filter(p => p.type === "out" && p.paymentMode === "cash").reduce((s, p) => s + p.amount, 0);
  const cashExpenses = filteredExpenses.filter(e => e.paymentMode === "cash").reduce((s, e) => s + e.amount, 0);
  const cashBalance = cashIn - cashOut - cashExpenses;

  const bankIn = filteredPayments.filter(p => p.type === "in" && (p.paymentMode === "bank" || p.paymentMode === "upi")).reduce((s, p) => s + p.amount, 0);
  const bankOut = filteredPayments.filter(p => p.type === "out" && (p.paymentMode === "bank" || p.paymentMode === "upi")).reduce((s, p) => s + p.amount, 0);
  const bankExpenses = filteredExpenses.filter(e => e.paymentMode === "bank" || e.paymentMode === "upi").reduce((s, e) => s + e.amount, 0);
  const totalBankOpening = bankAccounts.reduce((s, b) => s + b.openingBalance, 0);
  const bankBalance = totalBankOpening + bankIn - bankOut - bankExpenses;
  const totalBalance = cashBalance + bankBalance;

  // All transactions for history
  const allTxns = [
    ...filteredPayments.map(p => ({ id: p.id, date: p.date, label: p.type === "in" ? "Payment Received" : "Payment Made", party: p.partyName, amount: p.amount, type: p.type, mode: p.paymentMode })),
    ...filteredExpenses.map(e => ({ id: e.id, date: e.date, label: `Expense: ${e.category}`, party: e.category, amount: e.amount, type: "out" as const, mode: e.paymentMode })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const resetForm = () => {
    setBankName(""); setAccountNumber(""); setIfsc(""); setAccountType("current"); setUpiId(""); setOpeningBalance(0); setEditId(null);
  };

  const openAdd = () => { resetForm(); setAddOpen(true); };
  const openEdit = (acc: BankAccount) => {
    setEditId(acc.id); setBankName(acc.bankName); setAccountNumber(acc.accountNumber);
    setIfsc(acc.ifsc); setAccountType(acc.accountType); setUpiId(acc.upiId || ""); setOpeningBalance(acc.openingBalance); setAddOpen(true);
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
    setAddOpen(false); resetForm();
  };

  const handleDelete = (id: string) => { setBankAccounts(prev => prev.filter(b => b.id !== id)); toast.success("Bank account removed"); };
  const setDefault = (id: string) => { setBankAccounts(prev => prev.map(b => ({ ...b, isDefault: b.id === id }))); toast.success("Default bank updated"); };

  const handleAddMoney = () => {
    if (moneyAmount <= 0) { toast.error("Enter a valid amount"); return; }
    const payment = {
      id: Date.now().toString(),
      type: moneyType === "add" ? "in" as const : "out" as const,
      partyId: "", partyName: moneyType === "add" ? "Cash Added" : "Cash Reduced",
      amount: moneyAmount, paymentMode: moneyMode as "cash" | "upi" | "bank" | "cheque",
      date: new Date().toISOString().slice(0, 10),
      note: moneyNote || (moneyType === "add" ? "Money added" : "Money reduced"),
    };
    setPayments(prev => [...prev, payment]);
    toast.success(moneyType === "add" ? "Money added!" : "Money reduced!");
    setMoneyOpen(false); setMoneyAmount(0); setMoneyNote("");
  };

  const handleTransfer = () => {
    if (transferAmount <= 0 || transferFrom === transferTo) { toast.error("Invalid transfer"); return; }
    const date = new Date().toISOString().slice(0, 10);
    const outPayment = {
      id: Date.now().toString() + "out",
      type: "out" as const, partyId: "", partyName: `Transfer to ${transferTo === "cash" ? "Cash" : bankAccounts.find(b => b.id === transferTo)?.bankName || "Bank"}`,
      amount: transferAmount, paymentMode: (transferFrom === "cash" ? "cash" : "bank") as "cash" | "bank",
      date, note: transferNote || "Fund transfer",
    };
    const inPayment = {
      id: Date.now().toString() + "in",
      type: "in" as const, partyId: "", partyName: `Transfer from ${transferFrom === "cash" ? "Cash" : bankAccounts.find(b => b.id === transferFrom)?.bankName || "Bank"}`,
      amount: transferAmount, paymentMode: (transferTo === "cash" ? "cash" : "bank") as "cash" | "bank",
      date, note: transferNote || "Fund transfer",
    };
    setPayments(prev => [...prev, outPayment, inPayment]);
    toast.success("Transfer completed!"); setTransferOpen(false); setTransferAmount(0); setTransferNote("");
  };

  const handleExport = () => {
    const headers = ["Bank Name", "Account No", "IFSC", "Type", "UPI ID", "Opening Balance", "Default"];
    const rows = bankAccounts.map(b => [b.bankName, b.accountNumber, b.ifsc, b.accountType, b.upiId || "", b.openingBalance, b.isDefault ? "Yes" : "No"]);
    exportToCSV("bank_accounts.csv", headers, rows);
    toast.success("CSV exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={goBack}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Cash & Bank</h1>
        <button onClick={handleExport} className="ml-auto text-[10px] text-primary font-semibold"><FileDown className="h-3 w-3 inline mr-0.5" />CSV</button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setMoneyType("add"); setMoneyOpen(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald/10 text-emerald text-xs font-semibold rounded-lg hover:bg-emerald/20 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Money
        </button>
        <button onClick={() => { setMoneyType("reduce"); setMoneyOpen(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg hover:bg-destructive/20 transition-colors">
          <Trash2 className="h-3.5 w-3.5" /> Reduce Money
        </button>
        <button onClick={() => setTransferOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors">
          <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer
        </button>
      </div>

      {/* Total Balance */}
      <Card className="mb-4">
        <CardContent className="p-4 text-center">
          <p className="text-[10px] text-muted-foreground">Total Balance</p>
          <p className="text-2xl font-bold">₹ {totalBalance.toLocaleString("en-IN")}</p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="accounts" className="flex-1 text-xs">Accounts</TabsTrigger>
          <TabsTrigger value="transactions" className="flex-1 text-xs">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-3">
          {/* Cash */}
          <Card className="mb-3">
            <CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-sm font-medium">Cash in Hand</p></div>
              <p className="text-lg font-bold">₹ {cashBalance.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>

          {/* Bank Accounts */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Bank Accounts</p>
            <button onClick={openAdd} className="text-xs text-primary font-semibold flex items-center gap-1"><Plus className="h-3 w-3" /> Add Bank</button>
          </div>

          {bankAccounts.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No bank accounts added</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {bankAccounts.map(acc => (
                <Card key={acc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"><Building2 className="h-5 w-5 text-primary" /></div>
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
                          {!acc.isDefault && <button onClick={() => setDefault(acc.id)} className="p-1 hover:bg-secondary rounded"><Star className="h-3 w-3 text-muted-foreground" /></button>}
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

          <Card className="mt-3">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm font-medium">Total Bank Balance</p>
              <p className="text-sm font-bold">₹ {bankBalance.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-3">
          <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
          {allTxns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No transactions in selected period</div>
          ) : (
            <div className="space-y-2">
              {allTxns.map(txn => (
                <Card key={txn.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {txn.type === "in" ? <ArrowDownLeft className="h-4 w-4 text-emerald" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                      <div>
                        <p className="text-sm font-medium">{txn.label}</p>
                        {txn.party && <p className="text-[10px] text-muted-foreground">{txn.party}</p>}
                        <p className="text-[10px] text-muted-foreground">{txn.date} • {txn.mode.toUpperCase()}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${txn.type === "in" ? "text-emerald" : "text-destructive"}`}>
                      {txn.type === "in" ? "+" : "-"}₹{txn.amount.toLocaleString("en-IN")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Bank Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader><DialogTitle className="text-base">{editId ? "Edit" : "Add"} Bank Account</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="text-xs">Bank Name *</Label><Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="HDFC Bank" /></div>
            <div><Label className="text-xs">Account Number *</Label><Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="50100XXXX1234" /></div>
            <div><Label className="text-xs">IFSC Code</Label><Input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} placeholder="HDFC0001234" /></div>
            <div><Label className="text-xs">Account Type</Label>
              <Select value={accountType} onValueChange={v => setAccountType(v as any)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="current">Current</SelectItem><SelectItem value="savings">Savings</SelectItem></SelectContent>
              </Select></div>
            <div><Label className="text-xs">UPI ID (optional)</Label><Input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="business@hdfcbank" /></div>
            <div><Label className="text-xs">Opening Balance</Label><Input type="number" value={openingBalance || ""} onChange={e => setOpeningBalance(Number(e.target.value))} placeholder="₹" /></div>
            <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Add"} Bank Account</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Reduce Money Dialog */}
      <Dialog open={moneyOpen} onOpenChange={setMoneyOpen}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader><DialogTitle className="text-base">{moneyType === "add" ? "Add" : "Reduce"} Money</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="text-xs">Amount *</Label><Input type="number" value={moneyAmount || ""} onChange={e => setMoneyAmount(Number(e.target.value))} placeholder="₹" /></div>
            <div><Label className="text-xs">Mode</Label>
              <Select value={moneyMode} onValueChange={v => setMoneyMode(v as any)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="bank">Bank</SelectItem></SelectContent>
              </Select></div>
            <div><Label className="text-xs">Note</Label><Input value={moneyNote} onChange={e => setMoneyNote(e.target.value)} placeholder="Reason..." /></div>
            <Button onClick={handleAddMoney} className={`w-full ${moneyType === "reduce" ? "bg-destructive hover:bg-destructive/90" : ""}`}>
              {moneyType === "add" ? "Add" : "Reduce"} Money
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Money Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader><DialogTitle className="text-base">Transfer Money</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="text-xs">From</Label>
              <Select value={transferFrom} onValueChange={setTransferFrom}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  {bankAccounts.map(b => <SelectItem key={b.id} value={b.id}>{b.bankName}</SelectItem>)}
                </SelectContent>
              </Select></div>
            <div><Label className="text-xs">To</Label>
              <Select value={transferTo} onValueChange={setTransferTo}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  {bankAccounts.map(b => <SelectItem key={b.id} value={b.id}>{b.bankName}</SelectItem>)}
                </SelectContent>
              </Select></div>
            <div><Label className="text-xs">Amount *</Label><Input type="number" value={transferAmount || ""} onChange={e => setTransferAmount(Number(e.target.value))} placeholder="₹" /></div>
            <div><Label className="text-xs">Note</Label><Input value={transferNote} onChange={e => setTransferNote(e.target.value)} placeholder="Transfer note..." /></div>
            <Button onClick={handleTransfer} className="w-full">Transfer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
