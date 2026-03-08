import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { MATERIAL_TYPES, LeadCategory, Lead, LeadType } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function PostLead() {
  const navigate = useNavigate();
  const { setLeads, user } = useApp();
  const [leadType, setLeadType] = useState<LeadType>("Sell");
  const [category, setCategory] = useState<LeadCategory>("Waste");
  const [materialType, setMaterialType] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [color, setColor] = useState("");
  const [trash, setTrash] = useState("");
  const [count, setCount] = useState("");

  const handleSubmit = () => {
    if (!materialType || !price || !quantity) {
      toast.error("Please fill required fields");
      return;
    }
    const newLead: Lead = {
      id: Date.now().toString(),
      leadType,
      category,
      materialType,
      pricePerKg: Number(price),
      quantity: Number(quantity),
      specs: { color: color || undefined, trashPercent: trash ? Number(trash) : undefined, count: count || undefined },
      status: "Active",
      posterName: user.businessName,
      posterPhone: user.phone,
      posterRole: user.roles[0] || "Waste Trader",
      posterId: user.id,
      locationDistrict: user.locationDistrict,
      postedAt: new Date().toISOString().split("T")[0],
      views: 0,
      inquiries: 0,
    };
    setLeads((prev) => [newLead, ...prev]);
    toast.success(`${leadType} lead posted!`);
    navigate("/my-leads");
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-lg font-bold mb-4">Post a New Lead</h1>

      <div className="space-y-4">
        {/* Buy / Sell selector */}
        <div>
          <Label className="text-xs">Lead Type *</Label>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setLeadType("Sell")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                leadType === "Sell" ? "bg-emerald text-emerald-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              🏷️ I want to Sell
            </button>
            <button
              onClick={() => setLeadType("Buy")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                leadType === "Buy" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              🛒 I want to Buy
            </button>
          </div>
        </div>

        <div>
          <Label className="text-xs">Category *</Label>
          <Select value={category} onValueChange={(v) => { setCategory(v as LeadCategory); setMaterialType(""); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Waste">Waste</SelectItem>
              <SelectItem value="Fiber">Fiber</SelectItem>
              <SelectItem value="Yarn">Yarn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Material Type *</Label>
          <Select value={materialType} onValueChange={setMaterialType}>
            <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
            <SelectContent>
              {MATERIAL_TYPES[category].map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Price (₹/kg) *</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="85" />
          </div>
          <div>
            <Label className="text-xs">Quantity (kg) *</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="5000" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Color</Label>
            <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="White" />
          </div>
          <div>
            <Label className="text-xs">Trash %</Label>
            <Input type="number" value={trash} onChange={(e) => setTrash(e.target.value)} placeholder="2.5" />
          </div>
          <div>
            <Label className="text-xs">Count</Label>
            <Input value={count} onChange={(e) => setCount(e.target.value)} placeholder="40s" />
          </div>
        </div>
        <Button onClick={handleSubmit} className={`w-full ${leadType === "Sell" ? "bg-emerald hover:bg-emerald/90" : "bg-primary"}`}>
          Post {leadType} Lead
        </Button>
      </div>
    </div>
  );
}
