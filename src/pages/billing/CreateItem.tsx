import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling, BillingItem } from "@/lib/billingContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings } from "lucide-react";
import { toast } from "sonner";

const UNITS = ["KG", "MTR", "PCS", "BAG", "BALE", "BOX", "TON", "LTR", "NOS", "SET"];
const GST_RATES = [0, 5, 12, 18, 28];
const CATEGORIES = ["Waste", "Fiber", "Yarn", "Service", "Other"];

export default function CreateItem() {
  const navigate = useNavigate();
  const { setItems } = useBilling();
  const [name, setName] = useState("");
  const [itemType, setItemType] = useState<"product" | "service">("product");
  const [unit, setUnit] = useState("PCS");
  const [salesPrice, setSalesPrice] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [gstRate, setGstRate] = useState(0);
  const [hsnSac, setHsnSac] = useState("");
  const [stockQty, setStockQty] = useState(0);
  const [lowStockAlert, setLowStockAlert] = useState(0);
  const [category, setCategory] = useState("");
  const [pricingTab, setPricingTab] = useState("pricing");

  const handleSave = (andNew = false) => {
    if (!name) { toast.error("Item name is required"); return; }
    const item: BillingItem = {
      id: Date.now().toString(), name, itemType, unit, salesPrice, purchasePrice,
      gstRate, hsnSac, stockQty, lowStockAlert, category, createdAt: new Date().toISOString().slice(0, 10),
    };
    setItems(prev => [item, ...prev]);
    toast.success("Item created!");
    if (andNew) {
      setName(""); setSalesPrice(0); setPurchasePrice(0); setHsnSac(""); setStockQty(0);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-lg font-bold">Create New Item</h1>
        </div>
        <Settings className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs">Item Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Cotton Comber Noil 40s" />
        </div>

        <div>
          <Label className="text-xs">Item Type</Label>
          <div className="flex gap-3 mt-1">
            {(["product", "service"] as const).map(t => (
              <button key={t} onClick={() => setItemType(t)} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${itemType === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Tabs value={pricingTab} onValueChange={setPricingTab}>
          <TabsList className="w-full grid grid-cols-3 h-9">
            <TabsTrigger value="pricing" className="text-xs">Pricing</TabsTrigger>
            <TabsTrigger value="stock" className="text-xs">Stock</TabsTrigger>
            <TabsTrigger value="other" className="text-xs">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div>
              <Label className="text-xs">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Sales Price</Label>
              <div className="flex gap-2">
                <Input type="number" value={salesPrice || ""} onChange={e => setSalesPrice(Number(e.target.value))} placeholder="₹ 0" className="flex-1" />
                <span className="text-xs text-muted-foreground self-center">Without Tax</span>
              </div>
            </div>
            <div>
              <Label className="text-xs">Purchase Price</Label>
              <div className="flex gap-2">
                <Input type="number" value={purchasePrice || ""} onChange={e => setPurchasePrice(Number(e.target.value))} placeholder="₹ 0" className="flex-1" />
                <span className="text-xs text-muted-foreground self-center">Without Tax</span>
              </div>
            </div>
            <div>
              <Label className="text-xs">GST</Label>
              <Select value={String(gstRate)} onValueChange={v => setGstRate(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{GST_RATES.map(r => <SelectItem key={r} value={String(r)}>{r === 0 ? "None" : `${r}%`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">HSN</Label>
              <Input value={hsnSac} onChange={e => setHsnSac(e.target.value)} placeholder="Ex: 5202" />
            </div>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4 mt-4">
            <div>
              <Label className="text-xs">Opening Stock Quantity</Label>
              <Input type="number" value={stockQty || ""} onChange={e => setStockQty(Number(e.target.value))} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">Low Stock Alert at</Label>
              <Input type="number" value={lowStockAlert || ""} onChange={e => setLowStockAlert(Number(e.target.value))} placeholder="0" />
            </div>
          </TabsContent>

          <TabsContent value="other" className="space-y-4 mt-4">
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4">
          <button onClick={() => handleSave(true)} className="text-sm font-semibold text-primary">
            Save & New<br/><span className="text-[10px] text-muted-foreground font-normal">Create New Item</span>
          </button>
          <Button onClick={() => handleSave(false)} className="flex-1">Save</Button>
        </div>
      </div>
    </div>
  );
}
