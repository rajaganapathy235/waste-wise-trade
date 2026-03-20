import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { LayoutGrid, Package, IndianRupee, Hash, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import BillingHeader from "@/components/BillingHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useProduct, useCreateProduct, useUpdateProduct } from "@/hooks/useBilling";
import { useApp } from "@/lib/appContext";

export default function AddProduct() {
  const goBack = useSafeBack("/billing");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useApp();
  
  const editId = searchParams.get("edit");
  const incomingState = (location.state as any) || {};

  const { data: existingProduct, isLoading: isFetching } = useProduct(editId || undefined);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const [name, setName] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [unit, setUnit] = useState("kg");
  const [hsn, setHsn] = useState("");
  const [tax, setTax] = useState("0");

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name || "");
      setBuyingPrice(String(existingProduct.purchase_price || ""));
      setSellPrice(String(existingProduct.sale_price || ""));
      setMrp(existingProduct.mrp ? String(existingProduct.mrp) : "");
      setUnit(existingProduct.unit || "kg");
      setHsn(existingProduct.hsn_code || "");
      setTax(String(existingProduct.tax_rate || 0));
    }
  }, [existingProduct]);

  useEffect(() => {
    if (incomingState?.formData) {
      const f = incomingState.formData;
      setName(f.name || "");
      setBuyingPrice(f.purchase_price || "");
      setSellPrice(f.sale_price || "");
      setMrp(f.mrp || "");
      setUnit(f.unit || "kg");
      setHsn(f.hsn_code || "");
    }
    if (incomingState?.taxData) {
      setTax(String(incomingState.taxData.gstTotal || 0));
    }
  }, [incomingState]);

  const handleSave = () => {
    if (!name.trim()) { toast.error("Product Name is required"); return; }
    if (!sellPrice.trim()) { toast.error("Sell Price is required"); return; }

    const productData = {
      user_id: user.id,
      name: name.trim(),
      purchase_price: parseFloat(buyingPrice) || 0,
      sale_price: parseFloat(sellPrice) || 0,
      mrp: mrp ? parseFloat(mrp) : undefined,
      unit: unit.trim(),
      hsn_code: hsn.trim(),
      tax_rate: parseFloat(tax) || 0,
    };

    if (editId) {
      updateProduct({ id: editId, ...productData }, {
        onSuccess: () => {
          toast.success("Product updated!");
          goBack();
        },
        onError: (err: any) => toast.error(err.message)
      });
    } else {
      createProduct(productData, {
        onSuccess: () => {
          toast.success("Product added!");
          goBack();
        },
        onError: (err: any) => toast.error(err.message)
      });
    }
  };

  if (isFetching) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 animate-fade-in relative overflow-x-hidden">
      <BillingHeader title={editId ? "Update Item" : "New Item"} showBack onBack={goBack} />

      <div className="flex-1 px-6 pt-8 pb-32 space-y-8">
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Identity</Label>
            <div className="relative group">
                <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter product name..."
                    className="pl-12 h-14 bg-white border-none rounded-2xl shadow-sm focus:ring-2 ring-primary/20 text-sm font-bold"
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Purchase Cost</Label>
                <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                        value={buyingPrice}
                        onChange={e => setBuyingPrice(e.target.value)}
                        type="number"
                        placeholder="0.00"
                        className="pl-10 h-14 bg-white border-none rounded-2xl shadow-sm text-sm font-bold"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Selling Price</Label>
                <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                        value={sellPrice}
                        onChange={e => setSellPrice(e.target.value)}
                        type="number"
                        placeholder="0.00"
                        className="pl-10 h-14 bg-white border-none rounded-2xl shadow-sm text-sm font-bold border-l-4 border-l-primary"
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">MRP (Optional)</Label>
                <Input
                    value={mrp}
                    onChange={e => setMrp(e.target.value)}
                    type="number"
                    placeholder="0.00"
                    className="h-14 bg-white border-none rounded-2xl shadow-sm text-sm font-bold"
                />
            </div>
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit (kg/mt)</Label>
                <Input
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="kg"
                    className="h-14 bg-white border-none rounded-2xl shadow-sm text-sm font-bold text-center"
                />
            </div>
        </div>

        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">HSN / GST Details</Label>
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                        value={hsn}
                        onChange={e => setHsn(e.target.value)}
                        placeholder="HSN Code"
                        className="pl-10 h-14 bg-white border-none rounded-2xl shadow-sm text-sm font-bold"
                    />
                </div>
                <button
                    onClick={() => navigate("/billing/tax-details", { state: { totalPrice: parseFloat(sellPrice) || 0, returnTo: `/billing/add-product${editId ? `?edit=${editId}` : ''}`, formData: { name, purchase_price: buyingPrice, sale_price: sellPrice, mrp, unit, hsn_code: hsn } } })}
                    className="h-14 bg-white rounded-2xl shadow-sm flex items-center justify-between px-5 hover:bg-slate-50 transition-all border border-transparent hover:border-primary/20"
                >
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">TAX</span>
                    <span className="text-sm font-black text-emerald">{tax}%</span>
                </button>
            </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-40">
        <Button 
            onClick={handleSave} 
            disabled={isCreating || isUpdating}
            className="w-full h-16 text-sm font-black rounded-[2rem] bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-300 transition-all active:scale-[0.98]"
        >
          {isCreating || isUpdating ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <><Sparkles className="h-5 w-5 mr-2" /> {editId ? "SYNC CHANGES" : "SAVE TO INVENTORY"}</>
          )}
        </Button>
      </div>
    </div>
  );
}
