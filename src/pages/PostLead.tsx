import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { MATERIAL_TYPES, LeadCategory, Lead } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function PostLead() {
  const navigate = useNavigate();
  const { setLeads, user } = useApp();
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
      category,
      materialType,
      pricePerKg: Number(price),
      quantity: Number(quantity),
      specs: { color: color || undefined, trashPercent: trash ? Number(trash) : undefined, count: count || undefined },
      status: "Active",
      sellerName: user.businessName,
      sellerPhone: user.phone,
      sellerRole: user.roles[0] || "Waste Trader",
      locationDistrict: user.locationDistrict,
      postedAt: new Date().toISOString().split("T")[0],
    };
    setLeads((prev) => [newLead, ...prev]);
    toast.success("Lead posted!");
    navigate("/my-leads");
  };

  return (
    <div className="px-4 pt-3 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-lg font-bold mb-4">Post a New Lead</h1>

      <div className="space-y-4">
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
        <Button onClick={handleSubmit} className="w-full bg-primary">Post Lead</Button>
      </div>
    </div>
  );
}
