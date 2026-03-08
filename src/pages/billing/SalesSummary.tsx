import { useNavigate } from "react-router-dom";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react";

export default function SalesSummary() {
  const navigate = useNavigate();
  const { payments } = useBilling();

  const salesPayments = payments.filter(p => p.type === "in");
  const totalSales = salesPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Sales Summary</h1>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs">This week</span>
        <span className="text-[10px] text-muted-foreground">
          {new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} - {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
        <button className="text-[10px] text-primary font-semibold ml-auto">CHANGE</button>
      </div>

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
