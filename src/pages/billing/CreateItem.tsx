import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling, BillingItem } from "@/lib/billingContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutGrid, Ticket } from "lucide-react";
import { toast } from "sonner";

export default function CreateItem() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing");
  const { setItems } = useBilling();
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [salesPrice, setSalesPrice] = useState(0);
  const [mrp, setMrp] = useState(0);
  const [unit, setUnit] = useState("nos");
  const [hsnSac, setHsnSac] = useState("");
  const [gstRate, setGstRate] = useState(0);

  const handleSave = () => {
    if (!name) { toast.error("Product name is required"); return; }
    const item: BillingItem = {
      id: Date.now().toString(), name, itemType: "product", unit: unit.toUpperCase(),
      salesPrice, purchasePrice, mrp, gstRate, hsnSac,
      stockQty: 0, lowStockAlert: 0, category: "", createdAt: new Date().toISOString().slice(0, 10),
    };
    setItems(prev => [item, ...prev]);
    toast.success("Product added!");
    goBack();
  };

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
        <button onClick={goBack}><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-base font-bold">Add Product</h1>
      </header>

      <div className="flex-1 px-4 pt-6 pb-8 space-y-5">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-5 w-5 text-muted-foreground/50 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Product Name *</p>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="" className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Ticket className="h-5 w-5 text-muted-foreground/50 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Buying Price ( for Purchase Bill)*</p>
            <Input type="number" value={purchasePrice || ""} onChange={e => setPurchasePrice(Number(e.target.value))} placeholder="" className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Ticket className="h-5 w-5 text-muted-foreground/50 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Sell Price ( for Sales Bill ) *</p>
            <Input type="number" value={salesPrice || ""} onChange={e => setSalesPrice(Number(e.target.value))} placeholder="" className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Ticket className="h-5 w-5 text-muted-foreground/50 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Mrp</p>
            <Input type="number" value={mrp || ""} onChange={e => setMrp(Number(e.target.value))} placeholder="" className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Ticket className="h-5 w-5 text-muted-foreground/50 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Unit ( max 3 words ) ( nos = number of stock ) *</p>
            <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="nos" className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none font-bold" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Ticket className="h-5 w-5 text-muted-foreground/50 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Product Code | HSN | HSC | HST ( optional )</p>
            <Input value={hsnSac} onChange={e => setHsnSac(e.target.value)} placeholder="" className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Ticket className="h-5 w-5 text-muted-foreground/50 shrink-0" />
          <div className="flex-1">
            <div className="border border-primary/30 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-sm">Tax</span>
              <div className="flex items-center gap-1">
                <Input type="number" value={gstRate || ""} onChange={e => setGstRate(Number(e.target.value))} placeholder="0" className="border-0 w-16 text-right p-0 h-auto focus-visible:ring-0 shadow-none" />
                <span className="text-sm">₹</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="sticky bottom-0 bg-primary">
        <Button onClick={handleSave} className="w-full h-14 text-lg font-bold rounded-none bg-primary hover:bg-primary/90 text-primary-foreground">
          Add Product
        </Button>
      </div>
    </div>
  );
}
