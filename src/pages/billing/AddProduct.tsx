import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { LayoutGrid, Film } from "lucide-react";
import BillingHeader from "@/components/BillingHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AddProduct() {
  const goBack = useSafeBack("/billing");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const incomingState = (location.state as any) || {};
  const [name, setName] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [unit, setUnit] = useState("nos");
  const [hsn, setHsn] = useState("");
  const [tax, setTax] = useState("0");

  // Load existing product for editing
  const MOCK_PRODUCTS = [
    { id: "1", name: "JOB WORK FOR RECYCLED BANIAN CLOTH WASTE COTTONS", sellPrice: 8.70, buyingPrice: 8.00, unit: "Kgs", salesStock: 9682, purchaseStock: 0, hsn: "", tax: 0, mrp: undefined },
    { id: "2", name: "JOB WORK FOR RECYCLED BANIAN CLOTH WASTE COTTON", sellPrice: 9.75, buyingPrice: 9.50, unit: "Kgs", salesStock: 369684, purchaseStock: 369684, hsn: "", tax: 0, mrp: undefined },
  ];

  useEffect(() => {
    if (editId) {
      try {
        const saved = JSON.parse(localStorage.getItem("billing_products") || "[]");
        let found = saved.find((p: any) => p.id === editId);
        if (!found) found = MOCK_PRODUCTS.find(p => p.id === editId);
        if (found) {
          setName(found.name || "");
          setBuyingPrice(String(found.buyingPrice ?? found.purchasePrice ?? ""));
          setSellPrice(String(found.sellPrice ?? ""));
          setMrp(found.mrp ? String(found.mrp) : "");
          setUnit(found.unit || "nos");
          setHsn(found.hsn || "");
          setTax(String(found.tax ?? 0));
        }
      } catch {}
    }
  }, [editId]);

  // Restore form data when returning from TaxDetails
  useEffect(() => {
    if (incomingState?.formData) {
      const f = incomingState.formData;
      setName(f.name || "");
      setBuyingPrice(f.buyingPrice || "");
      setSellPrice(f.sellPrice || "");
      setMrp(f.mrp || "");
      setUnit(f.unit || "nos");
      setHsn(f.hsn || "");
    }
    if (incomingState?.taxData) {
      setTax(String(incomingState.taxData.taxAmount || 0));
    }
  }, []);

  const handleSave = () => {
    if (!name.trim()) { toast.error("Product Name is required"); return; }
    if (!buyingPrice.trim()) { toast.error("Buying Price is required"); return; }
    if (!sellPrice.trim()) { toast.error("Sell Price is required"); return; }
    if (!unit.trim()) { toast.error("Unit is required"); return; }

    const product = {
      id: editId || Date.now().toString(),
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
      if (editId) {
        const idx = existing.findIndex((p: any) => p.id === editId);
        if (idx !== -1) {
          product.salesStock = existing[idx].salesStock || 0;
          product.purchaseStock = existing[idx].purchaseStock || 0;
          product.createdAt = existing[idx].createdAt || product.createdAt;
          existing[idx] = product;
        } else {
          existing.unshift(product);
        }
      } else {
        existing.unshift(product);
      }
      localStorage.setItem("billing_products", JSON.stringify(existing));
    } catch {}

    toast.success(editId ? "Product updated!" : "Product added!");
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
      <BillingHeader title={editId ? "Edit Product" : "Add Product"} showBack onBack={goBack} />

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
          {editId ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </div>
  );
}
