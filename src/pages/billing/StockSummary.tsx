import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function StockSummary() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing/reports");
  const { items } = useBilling();

  const productItems = items.filter(i => i.itemType === "product" && i.stockQty > 0);
  const totalStockValue = productItems.reduce((s, i) => s + i.salesPrice * i.stockQty, 0);

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Stock Summary</h1>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">Total Stock Value</p>
            <p className="text-xl font-bold">₹ {totalStockValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          </div>
          <button className="text-[10px] text-primary font-semibold">VIEW FULL REPORT</button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 text-[10px] font-semibold text-muted-foreground px-3 py-2 border-b border-border">
        <span>Item Name</span>
        <span className="text-center">Quantity</span>
        <span className="text-right">Value</span>
      </div>

      {productItems.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No items in stock</div>
      ) : (
        <div className="divide-y divide-border">
          {productItems.map(item => (
            <div key={item.id} className="grid grid-cols-3 px-3 py-3 items-center">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">{item.hsnSac || "No HSN"}</p>
              </div>
              <p className="text-sm font-bold text-center">{item.stockQty} {item.unit}</p>
              <p className="text-sm text-right">₹ {(item.salesPrice * item.stockQty).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
