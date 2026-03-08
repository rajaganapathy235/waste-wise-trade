import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling, BillingParty } from "@/lib/billingContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";

const STATES = [
  { name: "Tamil Nadu", code: "33" }, { name: "Karnataka", code: "29" }, { name: "Kerala", code: "32" },
  { name: "Andhra Pradesh", code: "37" }, { name: "Telangana", code: "36" }, { name: "Maharashtra", code: "27" },
  { name: "Gujarat", code: "24" }, { name: "Rajasthan", code: "08" }, { name: "Uttar Pradesh", code: "09" },
  { name: "Delhi", code: "07" }, { name: "West Bengal", code: "19" }, { name: "Punjab", code: "03" },
];

export default function CreateParty() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing");
  const { setParties } = useBilling();
  const [name, setName] = useState("");
  const [gstin, setGstin] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [type, setType] = useState<"customer" | "supplier" | "both">("customer");
  const [openingBalance, setOpeningBalance] = useState(0);
  const [balanceType, setBalanceType] = useState<"collect" | "pay">("collect");

  const handleSave = () => {
    if (!name) { toast.error("Party name is required"); return; }
    const stateObj = STATES.find(s => s.name === state);
    const party: BillingParty = {
      id: Date.now().toString(), name, gstin, phone, address,
      state: state || "Tamil Nadu", stateCode: stateObj?.code || "33",
      type, openingBalance, balanceType, createdAt: new Date().toISOString().slice(0, 10),
    };
    setParties(prev => [party, ...prev]);
    toast.success("Party created!");
    goBack();
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={goBack}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Create Party</h1>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Party Name *</Label>
          <div className="flex items-center gap-2 mt-1 border rounded-lg px-3 py-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Search/Create Party" className="border-0 p-0 h-auto focus-visible:ring-0" />
          </div>
        </div>

        <div className="flex gap-3">
          {(["customer", "supplier", "both"] as const).map(t => (
            <button key={t} onClick={() => setType(t)} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${type === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div>
          <Label className="text-xs">GSTIN</Label>
          <Input value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} placeholder="29XXXXX1234X1Z5" maxLength={15} />
        </div>
        <div>
          <Label className="text-xs">Phone</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>
        <div>
          <Label className="text-xs">Address</Label>
          <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address" />
        </div>
        <div>
          <Label className="text-xs">State</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent>{STATES.map(s => <SelectItem key={s.code} value={s.name}>{s.name} ({s.code})</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="border-t border-border pt-4">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Opening Balance</Label>
          <div className="flex gap-3 mt-2">
            <Input type="number" value={openingBalance || ""} onChange={e => setOpeningBalance(Number(e.target.value))} placeholder="₹ 0" className="flex-1" />
            <Select value={balanceType} onValueChange={v => setBalanceType(v as any)}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="collect">To Collect</SelectItem>
                <SelectItem value="pay">To Pay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full mt-4">Create Party</Button>
      </div>
    </div>
  );
}
