import { useParams, useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { FileText, Trash2, IndianRupee, Package, ArrowLeft, MoreHorizontal, Loader2, Sparkles, TrendingUp, History } from "lucide-react";
import BillingHeader from "@/components/BillingHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProduct, useDeleteProduct, useBillHistory } from "@/hooks/useBilling";

export default function ProductDetail() {
  const { productId } = useParams();
  const goBack = useSafeBack("/billing");
  const navigate = useNavigate();

  const { data: product, isLoading: isFetching } = useProduct(productId);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { data: history = [], isLoading: isHistoryLoading } = useBillHistory(productId);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(productId!, {
        onSuccess: () => {
          toast.success("Product deleted");
          goBack();
        },
        onError: (err: any) => toast.error(err.message)
      });
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-slate-50">
        <BillingHeader title="Not Found" showBack onBack={goBack} />
        <div className="p-8 text-center bg-white rounded-3xl m-4 shadow-sm">
            <h2 className="text-lg font-black text-slate-800">Product not found.</h2>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={goBack}>Return to Inventory</Button>
        </div>
      </div>
    );
  }

  const buyPrice = product.purchase_price || 0;
  const sellPrice = product.sale_price || 0;
  const truncatedName = product.name.length > 20 ? product.name.slice(0, 20) + "..." : product.name;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 animate-fade-in pb-20 relative overflow-x-hidden">
      <BillingHeader
        title={truncatedName}
        showBack
        onBack={goBack}
        rightAction={
            <button onClick={() => navigate(`/billing/add-product?edit=${product.id}`)} className="text-xs font-black text-slate-900 group flex items-center gap-1.5 p-2 bg-white/50 backdrop-blur-sm rounded-xl">
                 EDIT <MoreHorizontal className="h-4 w-4" />
            </button>
        }
      />

      <div className="px-6 pt-8 space-y-6">
        {/* Product Identity Card */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-8 relative z-10">
                <div className="flex items-start gap-4 mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary backdrop-blur-md border border-white/10">
                        <Package className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Stock Item</p>
                        <h2 className="text-lg font-black leading-tight tracking-tight">{product.name}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-6">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">SELLING PRICE</p>
                        <div className="flex items-center gap-1 text-xl font-black text-primary">
                            <IndianRupee className="h-4 w-4" />
                            <span>{sellPrice.toLocaleString()}</span>
                            <span className="text-[10px] opacity-40 font-normal">/{product.unit}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">AVAILABILITY</p>
                        <div className="flex items-center gap-1 text-xl font-black text-emerald">
                            <span>{product.stock || 0}</span>
                            <span className="text-[10px] opacity-40 font-normal uppercase">{product.unit}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Detailed Info */}
        <div className="grid grid-cols-1 gap-4">
             <Card className="border-none shadow-sm rounded-[2rem] bg-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                      <TrendingUp className="h-4 w-4" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Buying Price</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-black text-slate-800">
                    <IndianRupee className="h-3 w-3" />
                    <span>{buyPrice}</span>
                </div>
             </Card>
             
             <Card className="border-none shadow-sm rounded-[2rem] bg-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tax Slab (GST)</p>
                </div>
                <Badge className="bg-emerald/10 text-emerald border-none text-[10px] font-black px-4">{product.tax_rate || 0}%</Badge>
             </Card>

             {product.hsn_code && (
                <Card className="border-none shadow-sm rounded-[2rem] bg-white p-5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-400">
                         <Sparkles className="h-4 w-4" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">HSN Code</p>
                   </div>
                   <p className="text-sm font-black text-slate-800">#{product.hsn_code}</p>
                </Card>
             )}
        </div>

        {/* Transaction History Section */}
        <div className="pt-4">
             <div className="flex items-center gap-2 mb-6 ml-1">
                <History className="h-4 w-4 text-slate-300" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">TRANSACTION HISTORY</h3>
             </div>
             
             {isHistoryLoading ? (
                 <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-100" /></div>
             ) : history.length === 0 ? (
                 <div className="text-center py-12 rounded-[2.5rem] bg-white border border-dashed border-slate-100">
                     <History className="h-8 w-8 mx-auto mb-3 opacity-10" />
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No transaction logs available</p>
                 </div>
             ) : (
                <div className="space-y-3">
                   {history.map((h: any, i: number) => (
                      <Card key={i} className="border-none shadow-sm bg-white p-4 flex items-center justify-between rounded-2xl">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Invoice #{h.invoiceNo}</p>
                            <p className="text-sm font-bold text-slate-800">{h.partyName || 'Cash Party'}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-sm font-black text-primary">₹{h.total}</p>
                             <p className="text-[10px] font-bold text-slate-300">{h.date}</p>
                         </div>
                      </Card>
                   ))}
                </div>
             )}
        </div>

        {/* Destructive Actions */}
        <div className="pt-8">
            <Button
                variant="outline"
                disabled={isDeleting}
                className="w-full h-14 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition-all text-xs tracking-widest group"
                onClick={handleDelete}
            >
                {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Trash2 className="h-4 w-4 mr-2 group-hover:shake" /> DELETE FROM INVENTORY</>}
            </Button>
        </div>
      </div>
      
      <p className="text-[9px] text-center text-slate-200 mt-12 font-black uppercase tracking-[0.3em]">
          HiTex Ledger Engine • Verified
      </p>
    </div>
  );
}
