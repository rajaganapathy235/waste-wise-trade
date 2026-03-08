import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { ArrowLeft, LayoutGrid, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AddProduct() {
  const goBack = useSafeBack("/billing");
  const navigate = useNavigate();
  const location = useLocation();
  const incomingState = (location.state as any) || {};
  const [name, setName] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [unit, setUnit] = useState("nos");
  const [hsn, setHsn] = useState("");
  const [tax, setTax] = useState("0");

  // Receive tax data back from TaxDetails page
  useEffect(() => {
    if (incomingState?.taxData) {
      setTax(String(incomingState.taxData.taxAmount || 0));
    }
  }, []);

  const handleSave = () => {
    if (!name.trim()) { toast.error("Product Name is required"); return; }
    if (!buyingPrice.trim()) { toast.error("Buying Price is required"); return; }
    if (!sellPrice.trim()) { toast.error("Sell Price is required"); return; }
    if (!unit.trim()) { toast.error("Unit is required"); return; }

    // Save to localStorage
    const product = {
      id: Date.now().toString(),
      name: name.trim(),
      buyingPrice: parseFloat(buyingPrice) || 0,
      sellPrice: parseFloat(sellPrice) || 0,
      mrp: mrp ? parseFloat(mrp) : undefined,
      unit: unit.trim(),
      hsn: hsn.trim(),
      tax: parseFloat(tax) || 0,
      salesStock: 0,
      purchaseStock: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("billing_products") || "[]");
      existing.unshift(product);
      localStorage.setItem("billing_products", JSON.stringify(existing));
    } catch {}

    toast.success("Product added!");
    goBack();
  };

  const fields = [
    { label: "Product Name *", value: name, onChange: setName, type: "text" },
    { label: "Buying Price ( for Purchase Bill)*", value: buyingPrice, onChange: setBuyingPrice, type: "number" },
    { label: "Sell Price ( for Sales Bill) *", value: sellPrice, onChange: setSellPrice, type: "number" },
    { label: "Mrp", value: mrp, onChange: setMrp, type: "number" },
    { label: "Unit ( max 3 words ) ( nos = number of stock ) *", value: unit, onChange: setUnit, type: "text" },
    { label: "Product Code | HSN | HSC | HST ( optional )", value: hsn, onChange: setHsn, type: "text" },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background">
      {/* Header */}
      <header className="bg-emerald text-emerald-foreground px-4 py-3 flex items-center gap-3">
        <button onClick={goBack}><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-base font-bold">Add Product</h1>
      </header>

      <div className="flex-1 px-4 pt-6 pb-8 space-y-6">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="shrink-0 w-10 flex justify-center">
              {i === 0 ? (
                <LayoutGrid className="h-5 w-5 text-muted-foreground/40" />
              ) : (
                <Film className="h-5 w-5 text-muted-foreground/40" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
              <Input
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                type={f.type}
                className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none"
              />
            </div>
          </div>
        ))}

        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/billing/tax-details", { state: { totalPrice: 0 } })}
        >
          <div className="shrink-0 w-10 flex justify-center">
            <Film className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <div className="flex-1 flex items-center border border-emerald rounded-md px-3 py-2">
            <span className="text-sm text-foreground flex-1">Tax</span>
            <span className="text-sm font-semibold text-foreground">{tax} ₹</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="sticky bottom-0 bg-emerald">
        <Button onClick={handleSave} className="w-full h-14 text-lg font-bold rounded-none bg-emerald hover:bg-emerald/90 text-emerald-foreground">
          Add Product
        </Button>
      </div>
    </div>
  );
}
