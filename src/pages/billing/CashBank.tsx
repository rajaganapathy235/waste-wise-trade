import { useNavigate } from "react-router-dom";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

export default function CashBank() {
  const navigate = useNavigate();
  const { payments, expenses } = useBilling();

  const cashIn = payments.filter(p => p.type === "in" && p.paymentMode === "cash").reduce((s, p) => s + p.amount, 0);
  const cashOut = payments.filter(p => p.type === "out" && p.paymentMode === "cash").reduce((s, p) => s + p.amount, 0);
  const cashExpenses = expenses.filter(e => e.paymentMode === "cash").reduce((s, e) => s + e.amount, 0);
  const cashBalance = cashIn - cashOut - cashExpenses;

  const bankIn = payments.filter(p => p.type === "in" && (p.paymentMode === "bank" || p.paymentMode === "upi")).reduce((s, p) => s + p.amount, 0);
  const bankOut = payments.filter(p => p.type === "out" && (p.paymentMode === "bank" || p.paymentMode === "upi")).reduce((s, p) => s + p.amount, 0);
  const bankExpenses = expenses.filter(e => e.paymentMode === "bank" || e.paymentMode === "upi").reduce((s, e) => s + e.amount, 0);
  const bankBalance = bankIn - bankOut - bankExpenses;

  const totalBalance = cashBalance + bankBalance;

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Cash & Bank</h1>
      </div>

      <div className="text-center mb-6">
        <p className="text-[10px] text-muted-foreground">Total Cash & Bank Balance</p>
        <p className="text-2xl font-bold">₹ {totalBalance.toLocaleString("en-IN")}</p>
        <button className="text-xs text-primary font-semibold mt-1 flex items-center gap-1 mx-auto">
          View Details <ArrowRight className="h-3 w-3" />
        </button>
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
        <p className="text-sm font-medium text-muted-foreground">Bank/Online</p>
        <button className="text-xs text-primary font-semibold flex items-center gap-1">
          <Plus className="h-3 w-3" /> Add New Bank
        </button>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 flex items-center justify-between">
          <p className="text-sm">Bank/UPI Balance</p>
          <p className="text-sm font-bold">₹ {bankBalance.toLocaleString("en-IN")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Unlinked Payments</p>
          <p className="text-sm font-bold">₹ 0</p>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8">
        <Button variant="outline" className="rounded-full px-8">Adjust Balance</Button>
      </div>
    </div>
  );
}
