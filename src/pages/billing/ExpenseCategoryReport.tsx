import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wallet, FileDown } from "lucide-react";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";

export default function ExpenseCategoryReport() {
  const navigate = useNavigate();
  const { expenses } = useBilling();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const filtered = expenses.filter(e => isInDateRange(e.date, dateRange));
  const totalExpenses = filtered.reduce((s, e) => s + e.amount, 0);

  // Group by category
  const byCategory: Record<string, { total: number; count: number; items: typeof filtered }> = {};
  filtered.forEach(e => {
    if (!byCategory[e.category]) byCategory[e.category] = { total: 0, count: 0, items: [] };
    byCategory[e.category].total += e.amount;
    byCategory[e.category].count++;
    byCategory[e.category].items.push(e);
  });

  const categories = Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total);

  const handleExport = () => {
    const headers = ["Category", "Amount (₹)", "Count", "% of Total"];
    const rows = categories.map(([cat, data]) => [cat, data.total, data.count, totalExpenses > 0 ? ((data.total / totalExpenses) * 100).toFixed(1) + "%" : "0%"]);
    exportToCSV("expense_category_report.csv", headers, rows);
    toast.success("Expense Category Report exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Expense Categories</h1>
        </div>
        <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
          <FileDown className="h-3 w-3" /> CSV
        </button>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <Card className="mb-4">
        <CardContent className="p-4 text-center">
          <p className="text-[10px] text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-destructive">₹ {totalExpenses.toLocaleString("en-IN")}</p>
        </CardContent>
      </Card>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No expenses found</div>
      ) : (
        <div className="space-y-3">
          {categories.map(([cat, data]) => {
            const pct = totalExpenses > 0 ? (data.total / totalExpenses * 100) : 0;
            return (
              <Card key={cat}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold">{cat}</p>
                    <p className="text-sm font-bold text-destructive">₹{data.total.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mb-1">
                    <div className="bg-destructive/70 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{data.count} expense{data.count > 1 ? "s" : ""}</span>
                    <span>{pct.toFixed(1)}% of total</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {data.items.map(e => (
                      <div key={e.id} className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">{e.date} • {e.paymentMode.toUpperCase()} {e.note ? `- ${e.note}` : ""}</span>
                        <span className="font-medium">₹{e.amount.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
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
