import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { MATERIAL_TYPES, LeadCategory, LeadType } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { useCreateLead } from "@/hooks/useLeads";

export default function PostLead() {
  const navigate = useNavigate();
  const { user } = useApp();
  const { t } = useI18n();
  const [leadType, setLeadType] = useState<LeadType>("Sell");
  const [category, setCategory] = useState<LeadCategory>("Waste");
  const [materialType, setMaterialType] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [color, setColor] = useState("");
  const [trash, setTrash] = useState("");
  const [count, setCount] = useState("");
  const [description, setDescription] = useState("");

  const { mutate: createLead, isPending } = useCreateLead();

  const handleSubmit = () => {
    if (!materialType || !price || !quantity) {
      toast.error(t("postLead.fillRequired"));
      return;
    }

    createLead({
      userId: user.id,
      posterName: user.businessName,
      leadType,
      category,
      materialType,
      pricePerKg: Number(price),
      quantity: Number(quantity),
      specs: { 
        color: color || undefined, 
        trashPercent: trash ? Number(trash) : undefined, 
        count: count || undefined 
      },
      locationDistrict: user.locationDistrict,
      description: description || undefined,
      images: [], // To be implemented with storage
      posterRole: (user.roles[0] as any) || "Trader"
    }, {
      onSuccess: () => {
        toast.success(`${leadType} ${t("postLead.posted")}`);
        navigate("/my-leads");
      },
      onError: (err: any) => {
        toast.error(`Failed to post: ${err.message}`);
      }
    });
  };

  return (
    <div className="px-6 pt-8 pb-12 max-w-md mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 mb-8 group">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t("postLead.back")}
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{t("postLead.title")}</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">Fill in the details to reach more traders</p>
      </div>

      <div className="space-y-6">
        <div className="p-1 bg-slate-100 rounded-2xl flex gap-1">
          <button 
            onClick={() => setLeadType("Sell")} 
            className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${leadType === "Sell" ? "bg-white text-emerald shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            {t("postLead.iSell")}
          </button>
          <button 
            onClick={() => setLeadType("Buy")} 
            className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${leadType === "Buy" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            {t("postLead.iBuy")}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("postLead.category")}</Label>
            <Select value={category} onValueChange={(v) => { setCategory(v as LeadCategory); setMaterialType(""); }}>
              <SelectTrigger className="h-12 rounded-xl bg-white border-slate-100 shadow-sm focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Waste">Waste</SelectItem>
                <SelectItem value="Fiber">Fiber</SelectItem>
                <SelectItem value="Yarn">Yarn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("postLead.materialType")}</Label>
            <Select value={materialType} onValueChange={setMaterialType}>
              <SelectTrigger className="h-12 rounded-xl bg-white border-slate-100 shadow-sm focus:ring-primary/20">
                <SelectValue placeholder={t("postLead.selectMaterial")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {MATERIAL_TYPES[category].map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("postLead.price")} (₹/kg)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
              <Input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                className="pl-8 h-12 rounded-xl bg-white border-slate-100 shadow-sm focus:ring-primary/20" 
                placeholder="0.00" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("postLead.quantity")} (kg)</Label>
            <Input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              className="h-12 rounded-xl bg-white border-slate-100 shadow-sm focus:ring-primary/20" 
              placeholder="0" 
            />
          </div>
        </div>

        <div className="space-y-2">
           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Additional Specs</Label>
           <div className="grid grid-cols-3 gap-3">
              <Input 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                placeholder="Color" 
                className="h-11 rounded-xl bg-white border-slate-100 text-xs text-center"
              />
              <Input 
                type="number" 
                value={trash} 
                onChange={(e) => setTrash(e.target.value)} 
                placeholder="Trash %" 
                className="h-11 rounded-xl bg-white border-slate-100 text-xs text-center"
              />
              <Input 
                value={count} 
                onChange={(e) => setCount(e.target.value)} 
                placeholder="Count" 
                className="h-11 rounded-xl bg-white border-slate-100 text-xs text-center"
              />
           </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description (Optional)</Label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us more about the material's quality, availability, etc."
            className="w-full min-h-[100px] p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm focus:ring-2 ring-primary/20 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="p-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 flex flex-col items-center justify-center gap-3 group cursor-not-allowed hover:bg-slate-50 transition-colors">
           <div className="p-3 rounded-2xl bg-white shadow-sm text-slate-300 group-hover:text-primary transition-colors">
              <ImagePlus className="h-6 w-6" />
           </div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Add Material Photos</p>
           <Badge variant="outline" className="text-[8px] border-slate-200 text-slate-300">COMING SOON</Badge>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isPending}
          className={`w-full h-14 rounded-2xl font-black tracking-widest shadow-xl transition-all active:scale-[0.98] ${
            leadType === "Sell" 
            ? "bg-emerald hover:bg-emerald/90 text-white shadow-emerald/20" 
            : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
          }`}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              POST {leadType.toUpperCase()} LEAD
            </>
          )
          }
        </Button>
      </div>

      <p className="text-[9px] text-center text-slate-300 mt-8 font-bold uppercase tracking-[0.2em]">
        Secure Posting • HiTex Verification Engine
      </p>
    </div>
  );
}
