import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send, Users, Home, FileText, Package,
  FileSpreadsheet, TrendingUp, Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BillingHeader from "@/components/BillingHeader";

type BillType = "Sales" | "Purchase" | "Quotation";
type BillingTab = "send" | "party" | "center" | "bills" | "products";

interface Product {
  id: string;
  name: string;
  sellPrice: number;
  purchasePrice: number;
  salesStock: number;
  purchaseStock: number;
}

const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "JOB WORK FOR RECYCLED BANIAN CLOTH WASTE COTTONS", sellPrice: 8.70, purchasePrice: 8.00, salesStock: 9682, purchaseStock: 0 },
  { id: "2", name: "JOB WORK FOR RECYCLED BANIAN CLOTH WASTE COTTON", sellPrice: 9.75, purchasePrice: 9.50, salesStock: 369684, purchaseStock: 369684 },
];

export default function Billing() {
  const navigate = useNavigate();
  const [billType, setBillType] = useState<BillType>("Sales");
  const [activeTab, setActiveTab] = useState<BillingTab>("send");
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("billing_products") || "[]");
      return saved.length > 0 ? saved.map((p: any) => ({
        id: p.id, name: p.name, sellPrice: p.sellPrice, purchasePrice: p.buyingPrice || p.purchasePrice,
        salesStock: p.salesStock || 0, purchaseStock: p.purchaseStock || 0,
      })) : MOCK_PRODUCTS;
    } catch { return MOCK_PRODUCTS; }
  });

  const billTypes: BillType[] = ["Sales", "Purchase", "Quotation"];

  const TABS: { id: BillingTab; label: string; icon: React.ElementType }[] = [
    { id: "send", label: "Send", icon: Send },
    { id: "party", label: "Party", icon: Users },
    { id: "center", label: "", icon: Home },
    { id: "bills", label: "Bills", icon: FileText },
    { id: "products", label: "Products", icon: Package },
  ];

  // ─── Send Tab (Home) ───
  const renderSendTab = () => (
    <div className="space-y-4">
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gold/20 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-gold" />
            </div>
            <h2 className="text-base font-bold text-foreground">New Bill</h2>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-sm text-muted-foreground mb-2">Bill Type</p>
            <div className="flex items-center gap-6">
              {billTypes.map((bt) => (
                <label key={bt} className="flex items-center gap-2 cursor-pointer" onClick={() => setBillType(bt)}>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${billType === bt ? "border-emerald" : "border-muted-foreground/40"}`}>
                    {billType === bt && <div className="h-2.5 w-2.5 rounded-full bg-emerald" />}
                  </div>
                  <span className="text-sm font-medium text-foreground">{bt}</span>
                </label>
              ))}
            </div>
          </div>
          <Button
            className="w-full h-12 text-base font-bold rounded-lg bg-gold hover:bg-gold/90 text-gold-foreground"
          >
            Generate Bill
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-emerald">Licence Activation Status</p>
          <p className="text-sm font-bold text-foreground">Activated</p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gold/20 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6 text-gold" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Logo | Signature | Stamp</p>
            <p className="text-sm text-muted-foreground">Colorful Bill</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-primary overflow-hidden">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-primary-foreground">Monthly Report</p>
            <p className="text-sm text-primary-foreground/80">Sales | Purchase</p>
          </div>
          <TrendingUp className="h-6 w-6 text-primary-foreground/60" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-navy overflow-hidden">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-navy-foreground/20 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6 text-navy-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-navy-foreground">Tax Report</p>
            <p className="text-sm text-navy-foreground/80">GST Summary</p>
          </div>
          <TrendingUp className="h-6 w-6 text-navy-foreground/60" />
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/")}>
        ← Back to Marketplace
      </Button>
    </div>
  );

  // ─── Products Tab ───
  const renderProductsTab = () => (
    <div className="relative min-h-[60vh]">
      <div className="divide-y divide-border">
        {products.map((product) => (
          <div key={product.id} onClick={() => navigate(`/billing/product/${product.id}`)} className="flex items-start gap-3 py-4 cursor-pointer active:bg-muted/50 transition-colors">
            <div className="h-14 w-14 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
              <Package className="h-7 w-7 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground leading-tight">{product.name}</p>
              <div className="mt-1.5 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-28">Sell Price:</span>
                  <span className="text-sm font-semibold text-emerald">₹ {product.sellPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-28">Purchase Price:</span>
                  <span className="text-sm font-semibold text-emerald">₹ {product.purchasePrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-28">Stock</span>
                  <span className="text-sm font-semibold text-emerald">{product.salesStock} / {product.purchaseStock}</span>
                  <span className="text-[10px] text-muted-foreground">( sales / purchase )</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Add Button */}
      <button onClick={() => navigate("/billing/add-product")} className="fixed bottom-24 right-6 max-w-md h-14 w-14 rounded-full bg-emerald hover:bg-emerald/90 text-emerald-foreground shadow-lg flex items-center justify-center z-20">
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );

  // ─── Placeholder tabs ───
  const renderPlaceholder = (label: string) => (
    <div className="flex-1 flex items-center justify-center p-8">
      <p className="text-muted-foreground text-center">{label} tab — share screenshot to build</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "send": return renderSendTab();
      case "products": return renderProductsTab();
      case "party": return renderPlaceholder("Party");
      case "bills": return renderPlaceholder("Bills");
      case "center": return renderPlaceholder("Center");
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative">
      <BillingHeader />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-30">
        <div className="flex items-center justify-around py-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const isCenter = id === "center";

            if (isCenter) {
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="relative -mt-5 flex flex-col items-center"
                >
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg ${
                    isActive ? "bg-destructive" : "bg-destructive/80"
                  }`}>
                    <Icon className="h-6 w-6 text-destructive-foreground" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
