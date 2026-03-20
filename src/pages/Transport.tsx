import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { DISTRICTS, VEHICLE_TYPES } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Truck, MapPin, Package, Calendar, Phone, Plus, ArrowRight, Loader2, Sparkles, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useTransportRequests, useCreateTransportRequest } from "@/hooks/useTransport";

const statusColors: Record<string, string> = {
  Pending: "bg-gold/10 text-gold border-gold/20",
  Accepted: "bg-primary/10 text-primary border-primary/20",
  "In Transit": "bg-emerald/10 text-emerald border-emerald/20",
  Delivered: "bg-emerald/10 text-emerald border-emerald/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Transport() {
  const navigate = useNavigate();
  const { user } = useApp();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [fromDistrict, setFromDistrict] = useState(user.locationDistrict);
  const [toDistrict, setToDistrict] = useState("");
  const [vehicleType, setVehicleType] = useState<string>("Tempo");
  const [quantity, setQuantity] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [materialType, setMaterialType] = useState("");

  const { data: transportRequests = [], isLoading } = useTransportRequests(user.id);
  const { mutate: createRequest, isPending } = useCreateTransportRequest();

  const selectedVehicle = VEHICLE_TYPES.find((v) => v.type === vehicleType);

  const handleSubmit = () => {
    if (!toDistrict || !quantity || !requestedDate) {
      toast.error(t("transport.fillAll")); return;
    }
    
    createRequest({
      user_id: user.id,
      material_type: materialType || "General",
      quantity: Number(quantity),
      from_district: fromDistrict,
      to_district: toDistrict,
      requested_date: requestedDate,
      vehicle_type: vehicleType,
      status: "Pending",
      estimated_cost: selectedVehicle ? selectedVehicle.baseRate + Math.floor(Math.random() * 2000) : 3000,
    }, {
      onSuccess: () => {
        toast.success(t("transport.submitted"));
        setShowForm(false); setToDistrict(""); setQuantity(""); setRequestedDate(""); setMaterialType("");
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
        <h1 className="text-xl font-black tracking-tight text-slate-900">{t("transport.title")}</h1>
        <Button onClick={() => setShowForm(!showForm)} className={`h-10 w-10 rounded-xl shadow-lg transition-all ${showForm ? 'bg-slate-900 text-white' : 'bg-white text-primary border border-slate-100 hover:bg-slate-50'}`} size="icon">
           {showForm ? <ArrowLeft className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {!showForm && (
        <div className="mb-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative p-8">
                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-md mb-6 shadow-sm">
                        <Truck className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-xl font-black mb-2 tracking-tight">Reliable Logistics</h2>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest px-4 leading-relaxed">Door-to-door transport for your textile waste inventory</p>
                    <Button onClick={() => setShowForm(true)} className="mt-8 bg-white text-slate-900 hover:bg-slate-100 font-black h-12 rounded-2xl px-8 shadow-2xl transition-all active:scale-95 text-xs tracking-widest uppercase">
                        BOOK NOW
                    </Button>
                </div>
            </Card>
        </div>
       )}

      {showForm && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden p-8">
                <div className="flex items-center gap-2 mb-8">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Navigation className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase">Route Details</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pickup Location</Label>
                        <Select value={fromDistrict} onValueChange={setFromDistrict}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 shadow-none font-bold text-slate-700 focus:ring-primary/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">{DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    
                    <div className="flex justify-center -my-2 opacity-30">
                        <ArrowRight className="h-4 w-4 rotate-90" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Drop Location</Label>
                        <Select value={toDistrict} onValueChange={setToDistrict}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white shadow-sm font-bold text-slate-800 focus:ring-primary/20">
                                <SelectValue placeholder="Select Destination" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">{DISTRICTS.filter((d) => d !== fromDistrict).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Choose Vehicle</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {VEHICLE_TYPES.map((v) => (
                                <button 
                                    key={v.type} 
                                    onClick={() => setVehicleType(v.type)}
                                    className={`relative p-4 rounded-3xl border transition-all text-center group ${vehicleType === v.type ? "border-primary bg-primary/5 shadow-inner" : "border-slate-100 bg-white hover:border-primary/20"}`}
                                >
                                    <Truck className={`h-6 w-6 mx-auto mb-2 transition-all ${vehicleType === v.type ? "text-primary scale-110" : "text-slate-300"}`} />
                                    <p className={`text-[9px] font-black uppercase tracking-tighter ${vehicleType === v.type ? "text-primary" : "text-slate-400"}`}>{v.type}</p>
                                    <p className="text-[8px] font-bold text-slate-300 mt-0.5">{v.capacity}</p>
                                    {vehicleType === v.type && (
                                        <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Weight (kg)</Label>
                            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-800" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Schedule Date</Label>
                            <Input type="date" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-800" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Material Details</Label>
                        <Input value={materialType} onChange={(e) => setMaterialType(e.target.value)} placeholder="e.g. Cotton Waste" className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-800" />
                    </div>

                    <Button onClick={handleSubmit} disabled={isPending} className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black tracking-widest shadow-xl shadow-slate-200 mt-4 active:scale-95 transition-all">
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" /> REQUEST QUOTE</>}
                    </Button>
                </div>
            </Card>
          </div>
      )}

      {!showForm && (
        <div className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">ACTIVE REQUESTS</h2>
            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-100" /></div>
            ) : transportRequests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-100 shadow-sm">
                    <div className="p-4 rounded-full bg-slate-50 w-fit mx-auto mb-4">
                        <Truck className="h-8 w-8 text-slate-200" />
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">You haven't booked any<br/>transport yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                {transportRequests.map((req: any) => (
                    <Card key={req.id} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 tracking-tight">{req.material_type}</p>
                                    <div className="flex items-center gap-1.5">
                                        <Badge className={`px-2 py-0 text-[8px] font-black border-none uppercase tracking-tighter shadow-none ${statusColors[req.status] || ""}`}>{req.status}</Badge>
                                        <span className="text-[9px] text-slate-300 font-bold">{new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between gap-2 border border-slate-100/50">
                            <div className="text-center flex-1">
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Pick</p>
                                <p className="text-[10px] font-black text-slate-700 truncate">{req.from_district}</p>
                            </div>
                            <div className="flex flex-col items-center gap-1 opacity-20">
                                <div className="h-0.5 w-8 bg-slate-400 rounded-full" />
                                <MapPin className="h-3 w-3" />
                            </div>
                            <div className="text-center flex-1">
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Drop</p>
                                <p className="text-[10px] font-black text-slate-700 truncate">{req.to_district}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 px-2">
                             <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    <Package className="h-3 w-3" /> {req.quantity.toLocaleString()} KG
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    <Calendar className="h-3 w-3" /> {new Date(req.requested_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                             </div>
                             <div className="text-right">
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Est. Budget</p>
                                <p className="text-sm font-black text-emerald">₹{req.estimated_cost?.toLocaleString()}</p>
                             </div>
                        </div>

                        {req.provider_name && (
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                    {req.provider_name[0]}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-800 leading-tight uppercase">{req.provider_name}</p>
                                    <p className="text-[9px] text-primary font-black flex items-center gap-1 tracking-widest">
                                        <Phone className="h-2 w-2" /> {req.provider_phone}
                                    </p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" className="h-8 rounded-xl text-[9px] font-bold uppercase tracking-widest border-slate-200 bg-white">
                                CALL AGENT
                            </Button>
                        </div>
                        )}
                    </CardContent>
                    </Card>
                ))}
            </div>
            )}
        </div>
      )}
      
      <p className="text-[9px] text-center text-slate-200 mt-12 font-black uppercase tracking-[0.4em]">
          HiTex Logistics Protocol V.Alpha
      </p>
    </div>
  );
}
