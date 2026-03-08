import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Search, FileDown, AlertTriangle } from "lucide-react";
import { exportToCSV } from "@/lib/csvExport";
import { toast } from "sonner";

export default function ItemReports() {
  const navigate = useNavigate();
  const { items } = useBilling();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "product" | "service" | "low-stock">("all");

  let filtered = items;
  if (filter === "product") filtered = filtered.filter(i => i.itemType === "product");
  else if (filter === "service") filtered = filtered.filter(i => i.itemType === "service");
  else if (filter === "low-stock") filtered = filtered.filter(i => i.itemType === "product" && i.stockQty <= i.lowStockAlert && i.lowStockAlert > 0);
  if (search) {
    const sq = search.toLowerCase();
    filtered = filtered.filter(i => i.name.toLowerCase().includes(sq) || i.hsnSac.toLowerCase().includes(sq) || i.category.toLowerCase().includes(sq));
  }

  const totalStockValue = items.filter(i => i.itemType === "product").reduce((s, i) => s + i.salesPrice * i.stockQty, 0);
  const totalItems = items.length;
  const lowStockCount = items.filter(i => i.itemType === "product" && i.stockQty <= i.lowStockAlert && i.lowStockAlert > 0).length;
  const totalPotentialRevenue = items.filter(i => i.itemType === "product").reduce((s, i) => s + (i.salesPrice - i.purchasePrice) * i.stockQty, 0);

  const handleExport = () => {
    const headers = ["Name", "Type", "HSN/SAC", "Category", "Unit", "Sales Price", "Purchase Price", "GST %", "Stock Qty", "Stock Value", "Low Stock Alert"];
    const rows = filtered.map(i => [i.name, i.itemType, i.hsnSac, i.category, i.unit, i.salesPrice, i.purchasePrice, i.gstRate, i.stockQty, i.salesPrice * i.stockQty, i.lowStockAlert]);
    exportToCSV("item_report.csv", headers, rows);
    toast.success("Item Report exported!");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Item Reports</h1>
        </div>
        <button onClick={handleExport} className="text-[10px] text-primary font-semibold flex items-center gap-1">
          <FileDown className="h-3 w-3" /> CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Stock Value</p>
            <p className="text-sm font-bold">₹{totalStockValue.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Potential Profit</p>
            <p className="text-sm font-bold text-emerald">₹{totalPotentialRevenue.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Total Items</p>
            <p className="text-sm font-bold">{totalItems}</p>
          </CardContent>
        </Card>
        <Card className={lowStockCount > 0 ? "border-gold/30 bg-gold/5" : ""}>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Low Stock Alerts</p>
            <p className={`text-sm font-bold ${lowStockCount > 0 ? "text-gold" : ""}`}>{lowStockCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="pl-9 h-8 text-xs" />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {([
          { val: "all" as const, label: "All" },
          { val: "product" as const, label: "Products" },
          { val: "service" as const, label: "Services" },
          { val: "low-stock" as const, label: `Low Stock (${lowStockCount})` },
        ]).map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${filter === f.val ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Item List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No items found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const isLowStock = item.itemType === "product" && item.stockQty <= item.lowStockAlert && item.lowStockAlert > 0;
            const margin = item.salesPrice > 0 ? ((item.salesPrice - item.purchasePrice) / item.salesPrice * 100).toFixed(1) : "0";
            return (
              <Card key={item.id} className={isLowStock ? "border-gold/30" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">{item.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">HSN: {item.hsnSac || "N/A"} • GST: {item.gstRate}% • {item.category}</p>
                      </div>
                    </div>
                    {isLowStock && (
                      <Badge variant="outline" className="text-[9px] text-gold border-gold/30">
                        <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2 text-center">
                    <div>
                      <p className="text-[9px] text-muted-foreground">Sales ₹</p>
                      <p className="text-xs font-bold">{item.salesPrice}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground">Purchase ₹</p>
                      <p className="text-xs font-bold">{item.purchasePrice}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground">Stock</p>
                      <p className={`text-xs font-bold ${isLowStock ? "text-gold" : ""}`}>{item.stockQty} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground">Margin</p>
                      <p className="text-xs font-bold text-emerald">{margin}%</p>
                    </div>
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
