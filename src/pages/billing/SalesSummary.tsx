import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { DateRangeFilter, isInDateRange, type DateRange } from "@/components/DateRangeFilter";

export default function SalesSummary() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing/reports");
  const { payments } = useBilling();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const salesPayments = payments.filter(p => p.type === "in" && isInDateRange(p.date, dateRange));
  const totalSales = salesPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Sales Summary</h1>
      </div>

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <Card className="mb-4">
        <CardContent className="p-4 text-center">
          <p className="text-[10px] text-muted-foreground">Total Sales</p>
          <p className="text-2xl font-bold">₹ {totalSales.toLocaleString("en-IN")}</p>
        </CardContent>
      </Card>

      {salesPayments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm font-semibold text-muted-foreground">No Data Found</p>
          <p className="text-[10px] text-muted-foreground mt-1">Try changing the time period to see data</p>
        </div>
      ) : (
        <div className="space-y-2">
          {salesPayments.map(p => (
            <Card key={p.id}>
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{p.partyName}</p>
                  <p className="text-[10px] text-muted-foreground">{p.date} • {p.paymentMode.toUpperCase()}</p>
                </div>
                <p className="text-sm font-bold text-emerald">₹{p.amount.toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
