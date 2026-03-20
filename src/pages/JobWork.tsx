import { useState } from "react";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, MessageCircle, Wrench, Factory, Crown, Lock, ArrowLeft, Loader2, Sparkles, Navigation, Layers, Weight, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLeads, useCreateLead } from "@/hooks/useLeads";

export type JobWorkType = "Offer" | "Request";

const SERVICE_TYPES = [
  "Waste to Fiber Conversion",
  "Fiber to Yarn (OE Spinning)",
  "Fiber to Yarn (Ring Spinning)",
  "Yarn Doubling & TFO",
  "Waste Sorting & Grading",
  "Baling & Packing",
];

const DISTRICTS = [
  "Tiruppur", "Coimbatore", "Erode", "Salem", "Karur",
  "Dindigul", "Madurai", "Namakkal", "Krishnagiri", "Dharmapuri",
];

export default function JobWork() {
  const { user } = useApp();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"All" | "Offer" | "Request">("All");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formType, setFormType] = useState<JobWorkType>("Offer");
  const [serviceType, setServiceType] = useState("");
  const [rate, setRate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const { data: leads = [], isLoading } = useLeads({ 
    category: "JobWork", 
    type: activeTab === "All" ? "All" : activeTab 
  });
  
  const { mutate: createLead, isPending } = useCreateLead();

  const handlePost = () => {
    if (!serviceType || !rate || !capacity || !location) {
      toast.error(t("jobWork.fillRequired"));
      return;
    }
    
    createLead({
      userId: user.id,
      posterName: user.businessName || user.displayName || "Anonymous",
      materialType: serviceType,
      category: "JobWork",
      leadType: formType as any,
      quantity: Number(capacity),
      pricePerKg: Number(rate),
      locationDistrict: location,
      description: description,
      images: [],
      specs: { minOrder: Number(minOrder) || 500 }
    }, {
      onSuccess: () => {
        toast.success(t("jobWork.posted"));
        setDialogOpen(false);
        // Reset form
        setServiceType(""); setRate(""); setCapacity(""); setMinOrder(""); setLocation(""); setDescription("");
      },
      onError: (err: any) => toast.error(err.message)
    });
  };

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto animate-fade-in bg-slate-50 min-h-screen relative overflow-x-hidden">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-black tracking-tight text-slate-900">{t("jobWork.title")}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 w-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/20" size="icon">
               <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-slate-50">
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                        <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight">Create Listing</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Post your service or requirement</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Offer / Request toggle */}
                    <div className="flex p-1 bg-slate-100 rounded-2xl">
                        <button
                        onClick={() => setFormType("Offer")}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            formType === "Offer" ? "bg-white text-emerald shadow-sm scale-100" : "text-slate-400 scale-95"
                        }`}
                        >
                        {t("jobWork.offer")}
                        </button>
                        <button
                        onClick={() => setFormType("Request")}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            formType === "Request" ? "bg-white text-primary shadow-sm scale-100" : "text-slate-400 scale-95"
                        }`}
                        >
                        {t("jobWork.need")}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Category</Label>
                            <Select value={serviceType} onValueChange={setServiceType}>
                                <SelectTrigger className="h-12 border-none bg-white rounded-xl shadow-sm font-bold text-slate-800">
                                    <SelectValue placeholder={t("jobWork.selectService")} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {SERVICE_TYPES.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Rate (₹/kg)</Label>
                                <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.00" className="h-12 border-none bg-white rounded-xl shadow-sm font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Capacity (kg/day)</Label>
                                <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="0" className="h-12 border-none bg-white rounded-xl shadow-sm font-bold" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">MOQ (kg)</Label>
                                <Input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="500" className="h-12 border-none bg-white rounded-xl shadow-sm font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location</Label>
                                <Select value={location} onValueChange={setLocation}>
                                    <SelectTrigger className="h-12 border-none bg-white rounded-xl shadow-sm font-bold text-slate-800">
                                        <SelectValue placeholder="City" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                    {DISTRICTS.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brief Description</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Machinery details, counts handled, etc..."
                                className="border-none bg-white rounded-xl shadow-sm font-bold min-h-[100px]"
                            />
                        </div>
                    </div>

                    <Button onClick={handlePost} disabled={isPending} className={`w-full h-14 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl active:scale-95 transition-all ${formType === "Offer" ? "bg-emerald hover:bg-emerald-600" : "bg-primary hover:bg-primary-600"}`}>
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" /> PUBLISH POST</>}
                    </Button>
                </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm mb-8">
        {(["All", "Offer", "Request"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "bg-slate-900 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab === "All" ? t("home.all") : tab === "Offer" ? t("jobWork.offers") : t("jobWork.requests")}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="space-y-6">
        {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-slate-100" /></div>
        ) : leads.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-100 shadow-sm px-8">
              <div className="p-4 rounded-full bg-slate-50 w-fit mx-auto mb-4 text-slate-200">
                <Factory className="h-10 w-10" />
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">No active job work listings<br/>in this category</p>
          </div>
        ) : (
          leads.map((post) => (
            <Card key={post.id} className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
              <CardContent className="p-0">
                <div className={`px-6 py-2.5 flex items-center gap-2 ${post.leadType === "Offer" ? "bg-emerald/5" : "bg-primary/5"}`}>
                  <div className={`h-2 w-2 rounded-full ${post.leadType === "Offer" ? "bg-emerald" : "bg-primary"}`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${post.leadType === "Offer" ? "text-emerald" : "text-primary"}`}>
                    {post.leadType === "Offer" ? "CAPACITY AVAILABLE" : "CAPACITY REQUIRED"}
                  </span>
                  <span className="text-[9px] text-slate-300 font-bold ml-auto uppercase tracking-tighter">
                      {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black tracking-tight text-slate-800 leading-tight">{post.materialType}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{post.posterName}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Rate</p>
                          <p className="text-base font-black text-emerald">₹{post.pricePerKg}<span className="text-[10px] text-slate-300 font-normal">/kg</span></p>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-100 shadow-inner group-hover:bg-slate-50 transition-colors">
                        <Layers className="h-4 w-4 text-slate-300" />
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Capacity</p>
                            <p className="text-xs font-black text-slate-700">{post.quantity.toLocaleString()} <span className="text-[10px] opacity-40">kg/day</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-100 shadow-inner group-hover:bg-slate-50 transition-colors">
                        <Weight className="h-4 w-4 text-slate-300" />
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Min Order</p>
                            <p className="text-xs font-black text-slate-700">{post.specs?.minOrder || 500} <span className="text-[10px] opacity-40">kg</span></p>
                        </div>
                    </div>
                  </div>

                  {post.description && (
                    <div className="bg-slate-50/50 rounded-2xl p-4 mb-6 border border-slate-100/50">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{post.description}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <MapPin className="h-3 w-3" /> {post.locationDistrict}
                    </div>
                    
                    {user.isSubscribed ? (
                      <Button size="sm" className="h-10 rounded-xl px-5 gap-2 bg-slate-900 group-hover:bg-primary shadow-lg transition-all" onClick={() => navigate(`/chat/${post.id}`)}>
                        <MessageCircle className="h-3.5 w-3.5" /> <span className="text-[10px] font-black uppercase tracking-widest">CONNECT</span>
                      </Button>
                    ) : (
                      <Button size="sm" className="h-10 rounded-xl px-4 gap-2 border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-none border transition-all" onClick={() => { toast(t("jobWork.premiumOnly"), { icon: "👑" }); navigate("/profile"); }}>
                        <Lock className="h-3 w-3" /> <span className="text-[10px] font-black uppercase tracking-widest">UNLOCK</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <p className="text-[9px] text-center text-slate-200 mt-16 font-black uppercase tracking-[0.5em]">
          HiTex Industrial Backbone • Tier-1
      </p>
    </div>
  );
}
