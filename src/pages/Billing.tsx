import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import {
  BarChart3, Users, Home, FileText, Package,
  FileSpreadsheet, TrendingUp, Plus, Search
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BillingHeader from "@/components/BillingHeader";
import BillsTab from "@/components/billing/BillsTab";
import PartyTab from "@/components/billing/PartyTab";
import AnalyticsTab from "@/components/billing/AnalyticsTab";

type BillType = "Sales" | "Purchase" | "Quotation";
type BillingTab = "home" | "analytics" | "party" | "center" | "bills" | "products";

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
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<BillingTab>("home");
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("billing_products") || "[]");
      return saved.length > 0 ? saved.map((p: any) => ({
        id: p.id, name: p.name, sellPrice: p.sellPrice, purchasePrice: p.buyingPrice || p.purchasePrice,
        salesStock: p.salesStock || 0, purchaseStock: p.purchaseStock || 0,
      })) : MOCK_PRODUCTS;
    } catch { return MOCK_PRODUCTS; }
  });

  const [billType, setBillType] = useState<BillType>("Sales");
  const billTypes: BillType[] = ["Sales", "Purchase", "Quotation"];

  const TABS: { id: BillingTab; label: string; icon: React.ElementType }[] = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "party", label: "Party", icon: Users },
    { id: "center", label: "", icon: Home },
    { id: "bills", label: "Bills", icon: FileText },
    { id: "products", label: "Products", icon: Package },
  ];

  // ─── Home Tab (Default - Generate Bill) ───
  const renderHomeTab = () => (
    <div className="space-y-3">
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-base font-bold text-foreground">New Bill</h2>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-sm text-muted-foreground mb-2">Bill Type</p>
            <div className="flex items-center gap-2">
              {billTypes.map((bt) => (
                <button
                  key={bt}
                  onClick={() => setBillType(bt)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    billType === bt
                      ? bt === "Sales" ? "bg-accent text-accent-foreground" : bt === "Purchase" ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full h-12 text-base font-bold rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground">
            Generate Bill
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Licence Status</p>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${user.isSubscribed ? "bg-accent" : "bg-destructive"}`} />
                <p className="text-xs font-bold text-foreground">{user.isSubscribed ? "Active" : "Inactive"}</p>
              </div>
            </div>
            {user.isSubscribed && user.subscriptionExpiry && (
              <p className="text-[10px] text-muted-foreground">Expires: {user.subscriptionExpiry}</p>
            )}
            {!user.isSubscribed && (
              <button onClick={() => navigate("/profile")} className="text-xs text-primary font-semibold">Subscribe Now →</button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Logo | Signature | Stamp</p>
            <p className="text-[10px] text-muted-foreground">Colorful Bill</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm bg-primary overflow-hidden">
          <CardContent className="p-3 flex flex-col items-center gap-2 text-center">
            <div className="h-10 w-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="text-xs font-bold text-primary-foreground">Monthly Report</p>
            <p className="text-[10px] text-primary-foreground/70">Sales | Purchase</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-foreground overflow-hidden">
          <CardContent className="p-3 flex flex-col items-center gap-2 text-center">
            <div className="h-10 w-10 rounded-lg bg-background/20 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-background" />
            </div>
            <p className="text-xs font-bold text-background">Tax Report</p>
            <p className="text-[10px] text-background/70">GST Summary</p>
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
        ← Back to Marketplace
      </Button>
    </div>
  );

  // ─── Analytics Tab ───
  const renderAnalyticsTab = () => <AnalyticsTab />;

  // ─── Products Tab ───
  const [productSearch, setProductSearch] = useState("");
  const filteredProducts = products.filter(p =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const renderProductsTab = () => (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={productSearch}
          onChange={e => setProductSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-9 h-10 text-sm bg-secondary border-0"
        />
      </div>

      {/* Product cards */}
      <div className="space-y-2">
        {filteredProducts.map((product) => (
          <Card key={product.id} onClick={() => navigate(`/billing/product/${product.id}`)} className="border-border shadow-sm cursor-pointer active:bg-muted/50 transition-colors">
            <CardContent className="p-3 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                <Package className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight line-clamp-2">{product.name}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">
                    Sell ₹{product.sellPrice.toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    Buy ₹{product.purchasePrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Stock: {product.salesStock} / {product.purchaseStock} (sales / purchase)
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No products found</div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => navigate("/billing/add-product")} className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg flex items-center justify-center z-20">
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home": return renderHomeTab();
      case "analytics": return renderAnalyticsTab();
      case "products": return renderProductsTab();
      case "party": return <PartyTab />;
      case "bills": return <BillsTab />;
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
                  onClick={() => navigate("/")}
                  className="relative -mt-6 flex flex-col items-center group"
                >
                  <div className="h-[60px] w-[60px] rounded-full bg-foreground flex items-center justify-center shadow-lg ring-4 ring-card transition-transform group-active:scale-95">
                    <span className="text-base font-bold text-background tracking-tight leading-none">
                      Hi<span className="text-accent">Tex</span>
                    </span>
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
