import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";

export default function ProfitLoss() {
  const navigate = useNavigate();
  const { payments, expenses } = useBilling();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const filteredPayments = payments.filter(p => isInDateRange(p.date, dateRange));
  const filteredExpenses = expenses.filter(e => isInDateRange(e.date, dateRange));

  const totalRevenue = filteredPayments.filter(p => p.type === "in").reduce((s, p) => s + p.amount, 0);
  const totalPurchases = filteredPayments.filter(p => p.type === "out").reduce((s, p) => s + p.amount, 0);
  const totalExp = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalPurchases - totalExp;

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Profit & Loss</h1>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <Card className={`mb-4 ${netProfit >= 0 ? "bg-emerald/5" : "bg-destructive/5"}`}>
        <CardContent className="p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net Profit / Loss</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-emerald" : "text-destructive"}`}>
            ₹ {Math.abs(netProfit).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-muted-foreground">{netProfit >= 0 ? "Profit" : "Loss"}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald" />
              <div>
                <p className="text-sm font-medium">Revenue (Sales)</p>
                <p className="text-[10px] text-muted-foreground">Total payments received</p>
              </div>
            </div>
            <p className="text-sm font-bold text-emerald">₹{totalRevenue.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">Purchases</p>
                <p className="text-[10px] text-muted-foreground">Total payments made</p>
              </div>
            </div>
            <p className="text-sm font-bold text-destructive">₹{totalPurchases.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-gold" />
              <div>
                <p className="text-sm font-medium">Expenses</p>
                <p className="text-[10px] text-muted-foreground">Business expenses</p>
              </div>
            </div>
            <p className="text-sm font-bold text-gold">₹{totalExp.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
