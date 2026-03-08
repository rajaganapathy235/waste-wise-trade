import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { DISTRICTS, VEHICLE_TYPES, TransportRequest } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Truck, MapPin, Package, Calendar, Phone, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  Pending: "bg-gold/10 text-gold border-gold/20",
  Accepted: "bg-primary/10 text-primary border-primary/20",
  "In Transit": "bg-emerald/10 text-emerald border-emerald/20",
  Delivered: "bg-emerald/10 text-emerald border-emerald/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Transport() {
  const navigate = useNavigate();
  const { transportRequests, setTransportRequests, leads, user } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [fromDistrict, setFromDistrict] = useState(user.locationDistrict);
  const [toDistrict, setToDistrict] = useState("");
  const [vehicleType, setVehicleType] = useState<TransportRequest["vehicleType"]>("Tempo");
  const [quantity, setQuantity] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [materialType, setMaterialType] = useState("");

  const selectedVehicle = VEHICLE_TYPES.find((v) => v.type === vehicleType);

  const handleSubmit = () => {
    if (!toDistrict || !quantity || !requestedDate) {
      toast.error("Please fill all required fields");
      return;
    }
    const newRequest: TransportRequest = {
      id: `t-${Date.now()}`,
      leadId: "",
      materialType: materialType || "General",
      quantity: Number(quantity),
      fromDistrict,
      toDistrict,
      requestedDate,
      vehicleType,
      status: "Pending",
      estimatedCost: selectedVehicle ? selectedVehicle.baseRate + Math.floor(Math.random() * 2000) : 3000,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTransportRequests((prev) => [newRequest, ...prev]);
    toast.success("Transport request submitted! Providers will respond shortly.");
    setShowForm(false);
    setToDistrict("");
    setQuantity("");
    setRequestedDate("");
    setMaterialType("");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Logistics</h1>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-primary">
          <Plus className="h-4 w-4 mr-1" /> Book Transport
        </Button>
      </div>

      {/* Booking Form */}
      {showForm && (
        <Card className="mb-4 border-primary/20 animate-fade-in">
          <CardContent className="p-4 space-y-3">
            <h2 className="text-sm font-semibold">New Transport Request</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">From *</Label>
                <Select value={fromDistrict} onValueChange={setFromDistrict}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">To *</Label>
                <Select value={toDistrict} onValueChange={setToDistrict}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.filter((d) => d !== fromDistrict).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Vehicle Type *</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {VEHICLE_TYPES.map((v) => (
                  <button
                    key={v.type}
                    onClick={() => setVehicleType(v.type)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      vehicleType === v.type ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                    }`}
                  >
                    <Truck className={`h-4 w-4 mx-auto mb-1 ${vehicleType === v.type ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-[10px] font-medium">{v.type}</p>
                    <p className="text-[8px] text-muted-foreground">{v.capacity}</p>
                    <p className="text-[10px] font-semibold text-emerald mt-0.5">₹{v.baseRate}+</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Quantity (kg) *</Label>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="5000" className="text-xs" />
              </div>
              <div>
                <Label className="text-xs">Pickup Date *</Label>
                <Input type="date" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} className="text-xs" />
              </div>
            </div>

            <div>
              <Label className="text-xs">Material (optional)</Label>
              <Input value={materialType} onChange={(e) => setMaterialType(e.target.value)} placeholder="Comber Noil" className="text-xs" />
            </div>

            <Button onClick={handleSubmit} className="w-full bg-primary">
              Submit Request <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Existing Requests */}
      <h2 className="text-sm font-semibold mb-2">Your Requests</h2>
      {transportRequests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No transport requests yet.
        </div>
      ) : (
        <div className="space-y-3">
          {transportRequests.map((req) => (
            <Card key={req.id} className="animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold">{req.materialType}</p>
                    <p className="text-[10px] text-muted-foreground">{req.createdAt}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${statusColors[req.status] || ""}`}>
                    {req.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span>{req.fromDistrict}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>{req.toDistrict}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {req.quantity.toLocaleString()} kg</span>
                  <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> {req.vehicleType}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {req.requestedDate}</span>
                </div>

                {req.estimatedCost && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Est. Cost</span>
                    <span className="text-sm font-bold text-emerald">₹{req.estimatedCost.toLocaleString()}</span>
                  </div>
                )}

                {req.providerName && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs font-medium">{req.providerName}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {req.providerPhone}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
