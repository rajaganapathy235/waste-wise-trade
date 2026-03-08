import { useParams, useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { ArrowLeft, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  sellPrice: number;
  buyingPrice?: number;
  purchasePrice?: number;
  mrp?: number;
  unit?: string;
  salesStock?: number;
  purchaseStock?: number;
}

interface Invoice {
  invoiceNo: string;
  date: string;
  rate: number;
  quantity: number;
}

// Mock sell history
const MOCK_HISTORY: Record<string, Invoice[]> = {
  "1": [
    { invoiceNo: "52", date: "29/11/2025", rate: 74332, quantity: 8137 },
    { invoiceNo: "62", date: "22/12/2025", rate: 14114, quantity: 1545 },
  ],
  "2": [
    { invoiceNo: "48", date: "15/10/2025", rate: 360000, quantity: 369684 },
  ],
};

export default function ProductDetail() {
  const { productId } = useParams();
  const goBack = useSafeBack("/billing");
  const navigate = useNavigate();

  // Load product from localStorage or mock
  let product: Product | null = null;
  try {
    const saved = JSON.parse(localStorage.getItem("billing_products") || "[]");
    const found = saved.find((p: any) => p.id === productId);
    if (found) product = found;
  } catch {}

  if (!product) {
    // Fallback mock
    const mocks: Product[] = [
      { id: "1", name: "JOB WORK FOR RECYCLED BANIAN CLOTH WASTE COTTONS", sellPrice: 8.70, buyingPrice: 8.00, unit: "Kgs", salesStock: 9682 },
      { id: "2", name: "JOB WORK FOR RECYCLED BANIAN CLOTH WASTE COTTON", sellPrice: 9.75, buyingPrice: 9.50, unit: "Kgs", salesStock: 369684 },
    ];
    product = mocks.find(p => p.id === productId) || null;
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background">
        <header className="bg-emerald text-emerald-foreground px-4 py-3 flex items-center gap-3">
          <button onClick={goBack}><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-base font-bold">Product Not Found</h1>
        </header>
      </div>
    );
  }

  const buyPrice = product.buyingPrice ?? product.purchasePrice ?? 0;
  const history = MOCK_HISTORY[product.id] || [];
  const totalQty = history.reduce((s, h) => s + h.quantity, 0);
  const truncatedName = product.name.length > 20 ? product.name.slice(0, 20) + "..." : product.name;

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background">
      {/* Header */}
      <header className="bg-emerald text-emerald-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goBack}><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-base font-bold truncate max-w-[200px]">{truncatedName}</h1>
        </div>
        <button className="text-sm font-semibold">Edit</button>
      </header>

      <div className="flex-1 px-4 pt-4 pb-8 space-y-4">
        {/* Product Info Card */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-3">
              <span className="text-sm text-muted-foreground shrink-0 w-16">Name</span>
              <span className="text-sm font-bold text-foreground">{product.name}</span>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mrp</span>
                <span className="text-sm font-semibold text-foreground">₹ {product.mrp ?? ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Unit</span>
                <span className="text-sm font-semibold text-foreground">{product.unit || "Kgs"}</span>
              </div>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Buying Price</span>
              <span className="text-sm font-semibold text-foreground">₹ {buyPrice}</span>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Selling Price</span>
              <span className="text-sm font-semibold text-foreground">₹ {product.sellPrice}</span>
            </div>
          </CardContent>
        </Card>

        {/* Sell History */}
        {history.length > 0 && (
          <Card className="border-0 shadow-sm bg-emerald overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="px-4 py-3 text-center">
                <p className="text-base font-bold text-emerald-foreground">Sell History</p>
              </div>
              <div className="flex items-center justify-between px-4 pb-3">
                <p className="text-sm font-medium text-emerald-foreground/90">Total Invoice : {history.length}</p>
                <p className="text-sm font-medium text-emerald-foreground/90">Total Quantity : {totalQty}</p>
              </div>

              {/* Invoice rows */}
              <div className="bg-card divide-y divide-border">
                {history.map((inv, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-destructive/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground">Invoice No. {inv.invoiceNo}</p>
                        <p className="text-xs text-muted-foreground">{inv.date}</p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-sm">Rate <span className="font-semibold text-emerald">₹{inv.rate.toLocaleString("en-IN")}.00</span></p>
                        <p className="text-sm">Quantity <span className="font-semibold text-emerald">{inv.quantity}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
