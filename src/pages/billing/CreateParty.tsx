import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling, BillingParty } from "@/lib/billingContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutGrid, Phone, Ticket, Mail, BarChart3 } from "lucide-react";
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
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [type, setType] = useState<"customer" | "supplier">("customer");

  const handleSave = () => {
    if (!name) { toast.error("Party name is required"); return; }
    const stateObj = STATES.find(s => s.name === state);
    const party: BillingParty = {
      id: Date.now().toString(), name, gstin, phone, email, address, city,
      state: state || "Tamil Nadu", stateCode: stateObj?.code || "33", taxCode,
      type, openingBalance: 0, balanceType: type === "customer" ? "collect" : "pay",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setParties(prev => [party, ...prev]);
    toast.success("Party created!");
    goBack();
  };

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
        <button onClick={goBack}><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-base font-bold">Add New Party</h1>
      </header>

      <div className="flex-1 px-4 pt-6 pb-8 space-y-6">
        {/* Customer / Supplier Toggle */}
        <div className="flex items-center justify-center gap-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${type === "customer" ? "border-primary" : "border-muted-foreground/40"}`}>
              {type === "customer" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </div>
            <span className="text-sm font-medium">Customer</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${type === "supplier" ? "border-primary" : "border-muted-foreground/40"}`}>
              {type === "supplier" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </div>
            <span className="text-sm font-medium">Supplier</span>
          </label>
        </div>

        {/* Form Fields with icons */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-muted-foreground/50 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Party Name *</p>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="" className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground/50 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Mobile ( optional )</p>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="" className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Ticket className="h-5 w-5 text-muted-foreground/50 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">GST Number</p>
              <Input value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} maxLength={15} placeholder="" className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground/50 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Email ( optional )</p>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="" className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-muted-foreground/50 shrink-0" />
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Postal Address ( optional )</p>
              </div>
              <div>
                <p className="text-sm font-bold mb-1">Address</p>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="" className="border-0 border-b border-primary rounded-none px-0 focus-visible:ring-0 shadow-none" />
              </div>
              <div>
                <p className="text-sm font-bold mb-1">City Name</p>
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="" className="border-0 border-b border-primary rounded-none px-0 focus-visible:ring-0 shadow-none" />
              </div>
              <div>
                <p className="text-sm font-bold mb-1">State</p>
                <Input value={state} onChange={e => setState(e.target.value)} placeholder="" className="border-0 border-b border-primary rounded-none px-0 focus-visible:ring-0 shadow-none" />
              </div>
              <div>
                <p className="text-sm font-bold mb-1">Tax Code of Area</p>
                <Input value={taxCode} onChange={e => setTaxCode(e.target.value)} placeholder="" className="border-0 border-b border-primary rounded-none px-0 focus-visible:ring-0 shadow-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-primary">
        <Button onClick={handleSave} className="w-full h-14 text-lg font-bold rounded-none bg-primary hover:bg-primary/90 text-primary-foreground">
          Submit
        </Button>
      </div>
    </div>
  );
}
