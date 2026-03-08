import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { MOCK_PARTIES } from "@/lib/partyData";
import { useSafeBack } from "@/hooks/use-safe-back";

interface BillItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  discount: number;
}

type GstType = "CGST/SGST" | "IGST";
type DiscountSetting = "amount" | "amount_percent";
type BillTitle = "Tax Invoice" | "Bill Of Supply";

export default function GenerateBill() {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = useSafeBack("/billing");
  const billType = (location.state as any)?.billType || "Sales";

  // Invoice info
  const [invoiceNo] = useState(() => {
    const last = parseInt(localStorage.getItem("last_invoice_no") || "62", 10);
    return last + 1;
  });
  const [billDate] = useState(format(new Date(), "dd/MM/yyyy"));

  // Party
  const [selectedParty, setSelectedParty] = useState<string>("");
  const [showPartyPicker, setShowPartyPicker] = useState(false);

  // Items
  const [items, setItems] = useState<BillItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemDiscount, setNewItemDiscount] = useState("0");

  // Other charges
  const [freightEnabled, setFreightEnabled] = useState(false);
  const [freightAmount, setFreightAmount] = useState("");
  const [packagingEnabled, setPackagingEnabled] = useState(false);
  const [packagingAmount, setPackagingAmount] = useState("");
  const [tcsEnabled, setTcsEnabled] = useState(false);
  const [tcsAmount, setTcsAmount] = useState("");

  // Settings
  const [gstType, setGstType] = useState<GstType>("CGST/SGST");
  const [discountSetting, setDiscountSetting] = useState<DiscountSetting>("amount");
  const [billTitle, setBillTitle] = useState<BillTitle>("Tax Invoice");
  const [consigneeEnabled, setConsigneeEnabled] = useState(false);

  // Calculations
  const subTotal = items.reduce((s, i) => s + (i.qty * i.price - i.discount), 0);
  const taxRate = 0.18; // 18% GST default
  const taxAmount = subTotal * taxRate;
  const otherCharges =
    (freightEnabled ? parseFloat(freightAmount) || 0 : 0) +
    (packagingEnabled ? parseFloat(packagingAmount) || 0 : 0) +
    (tcsEnabled ? parseFloat(tcsAmount) || 0 : 0);
  const total = subTotal + taxAmount + otherCharges;

  const selectedPartyData = MOCK_PARTIES.find((p) => p.id === selectedParty);

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemPrice) {
      toast.error("Enter item name and price");
      return;
    }
    const item: BillItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      qty: parseInt(newItemQty) || 1,
      price: parseFloat(newItemPrice) || 0,
      discount: parseFloat(newItemDiscount) || 0,
    };
    setItems([...items, item]);
    setNewItemName("");
    setNewItemQty("1");
    setNewItemPrice("");
    setNewItemDiscount("0");
    setShowAddItem(false);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleGeneratePDF = () => {
    if (!selectedParty) {
      toast.error("Please select a party");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    localStorage.setItem("last_invoice_no", String(invoiceNo));
    toast.success(`Invoice ${invoiceNo} generated successfully!`);
    navigate("/billing");
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-accent text-accent-foreground">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold">{billType} Tally Bill</h1>
          </div>
          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-1.5 bg-accent-foreground/20 rounded-lg px-3 py-1.5"
          >
            <span className="text-sm font-bold">Go</span>
            <TrendingUp className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">
        {/* Invoice Info */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground">बिल का Number</span>
              <span className="text-base font-bold text-foreground">Invoice{invoiceNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground">(Click here)</span>
                <p className="text-sm font-bold text-accent">HYTEX COTTON MILLS</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Bill Date</span>
                <p className="text-sm font-bold text-foreground">{billDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Party Selector */}
        <Card
          className="border-accent/40 border-dashed shadow-sm cursor-pointer"
          onClick={() => setShowPartyPicker(!showPartyPicker)}
        >
          <CardContent className="p-4">
            {selectedPartyData ? (
              <div>
                <p className="text-xs text-muted-foreground">To</p>
                <p className="text-sm font-bold text-foreground">{selectedPartyData.name}</p>
                {selectedPartyData.gstin && (
                  <p className="text-[10px] text-muted-foreground">{selectedPartyData.gstin}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">To (जिसको बिल भेजना है)</p>
                  <p className="text-sm font-bold text-accent">(click here)</p>
                </div>
                <span className="text-xs text-muted-foreground">Add</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Party picker dropdown */}
        {showPartyPicker && (
          <div className="border border-border rounded-lg bg-card shadow-md overflow-hidden">
            {MOCK_PARTIES.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedParty(p.id);
                  setShowPartyPicker(false);
                }}
                className="w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
              >
                <p className="text-sm font-bold text-foreground">{p.name}</p>
                {p.gstin && <p className="text-[10px] text-muted-foreground">{p.gstin}</p>}
              </button>
            ))}
          </div>
        )}

        {/* Items */}
        <Card className="border-accent/40 shadow-sm">
          <CardContent className="p-4 space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.qty} × ₹{item.price.toFixed(2)}
                    {item.discount > 0 ? ` (-₹${item.discount.toFixed(2)})` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">
                    ₹{(item.qty * item.price - item.discount).toFixed(2)}
                  </p>
                  <button onClick={() => removeItem(item.id)} className="text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {showAddItem ? (
              <div className="space-y-2 border border-border rounded-lg p-3">
                <Input
                  placeholder="Item name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="h-9 text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Qty</label>
                    <Input
                      type="number"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Price (₹)</label>
                    <Input
                      type="number"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Discount</label>
                    <Input
                      type="number"
                      value={newItemDiscount}
                      onChange={(e) => setNewItemDiscount(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddItem} size="sm" className="flex-1 h-9 text-xs font-bold bg-accent hover:bg-accent/90 text-accent-foreground">
                    Add
                  </Button>
                  <Button onClick={() => setShowAddItem(false)} size="sm" variant="outline" className="h-9 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddItem(true)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-accent">Add Item (+)</span>
                  <span className="text-xs text-muted-foreground">यहां क्लिक करे</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {items.length > 0 ? `${items.length} items` : "1 × ₹0.00"}
                  </p>
                  <p className="text-xs text-muted-foreground">₹{subTotal.toFixed(2)}</p>
                </div>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <div className="space-y-0 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between bg-muted px-4 py-2.5">
            <p className="text-sm font-bold text-foreground">SubTotal</p>
            <p className="text-sm font-bold text-foreground">₹{subTotal.toFixed(0)}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-2">
            <p className="text-sm font-medium text-foreground">Total Tax Amount</p>
            <p className="text-sm font-medium text-foreground">₹{taxAmount.toFixed(0)}</p>
          </div>
          <div className="flex items-center justify-between bg-foreground px-4 py-2.5">
            <p className="text-sm font-bold text-background">Total</p>
            <p className="text-sm font-bold text-background">₹{total.toFixed(0)}</p>
          </div>
        </div>

        {/* Other Charges */}
        <Card className="border-accent/40 shadow-sm">
          <CardContent className="p-0">
            <div className="bg-accent px-4 py-2.5">
              <p className="text-sm font-bold text-accent-foreground">Other Charges ( optional )</p>
            </div>

            {/* Freight */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex-1">
                <p className="text-xs font-bold text-accent">Freight Charge</p>
                {freightEnabled ? (
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={freightAmount}
                    onChange={(e) => setFreightAmount(e.target.value)}
                    className="h-8 text-xs mt-1 w-32"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">(click here)</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${!freightEnabled ? "border-accent" : "border-muted-foreground"}`}>
                    {!freightEnabled && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                  </div>
                  <span className="text-sm text-foreground">No</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setFreightEnabled(true)}>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${freightEnabled ? "border-accent" : "border-muted-foreground"}`}>
                    {freightEnabled && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                  </div>
                  <span className="text-sm text-foreground">Yes</span>
                </label>
              </div>
            </div>

            {/* Packaging */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex-1">
                <p className="text-xs font-bold text-accent">Packaging Charge</p>
                {packagingEnabled ? (
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={packagingAmount}
                    onChange={(e) => setPackagingAmount(e.target.value)}
                    className="h-8 text-xs mt-1 w-32"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">(click here)</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setPackagingEnabled(false)}>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${!packagingEnabled ? "border-accent" : "border-muted-foreground"}`}>
                    {!packagingEnabled && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                  </div>
                  <span className="text-sm text-foreground">No</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setPackagingEnabled(true)}>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${packagingEnabled ? "border-accent" : "border-muted-foreground"}`}>
                    {packagingEnabled && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                  </div>
                  <span className="text-sm text-foreground">Yes</span>
                </label>
              </div>
            </div>

            {/* TCS Tax */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex-1">
                <p className="text-xs font-bold text-accent">TCS Tax</p>
                {tcsEnabled ? (
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={tcsAmount}
                    onChange={(e) => setTcsAmount(e.target.value)}
                    className="h-8 text-xs mt-1 w-32"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">(click here)</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setTcsEnabled(false)}>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${!tcsEnabled ? "border-accent" : "border-muted-foreground"}`}>
                    {!tcsEnabled && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                  </div>
                  <span className="text-sm text-foreground">No</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setTcsEnabled(true)}>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${tcsEnabled ? "border-accent" : "border-muted-foreground"}`}>
                    {tcsEnabled && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                  </div>
                  <span className="text-sm text-foreground">Yes</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GST Type */}
        <div className="px-2 py-3">
          <div className="flex items-center gap-4">
            <p className="text-sm font-bold text-foreground">बिल का प्रकार</p>
            {(["CGST/SGST", "IGST"] as GstType[]).map((type) => (
              <label key={type} className="flex items-center gap-1.5 cursor-pointer" onClick={() => setGstType(type)}>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${gstType === type ? "border-accent" : "border-muted-foreground"}`}>
                  {gstType === type && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </div>
                <span className="text-sm text-foreground">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Discount Setting */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-bold text-accent">Discount Setting  (show in bill column)</p>
            {[
              { value: "amount" as const, label: "Show Amount only" },
              { value: "amount_percent" as const, label: "Show  Amount and Percentage" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer" onClick={() => setDiscountSetting(opt.value)}>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${discountSetting === opt.value ? "border-accent" : "border-muted-foreground"}`}>
                  {discountSetting === opt.value && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </div>
                <span className="text-sm text-foreground">{opt.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Optional buttons */}
        <div className="space-y-3">
          <Button className="w-full h-11 rounded-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground">
            Add Bank Detail (Optional)
          </Button>
          <Button className="w-full h-11 rounded-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground">
            Add Delivery Options (Optional)
          </Button>
        </div>

        {/* Bill Title */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-bold text-accent">Bill Title</p>
            {(["Tax Invoice", "Bill Of Supply"] as BillTitle[]).map((title) => (
              <label key={title} className="flex items-center gap-2 cursor-pointer" onClick={() => setBillTitle(title)}>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${billTitle === title ? "border-accent" : "border-muted-foreground"}`}>
                  {billTitle === title && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </div>
                <span className="text-sm text-foreground">{title}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Consignee */}
        <Card className="border-accent/40 border-dashed shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-accent">Consignee :</p>
                <p className="text-xs text-muted-foreground">(click here to select)</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setConsigneeEnabled(false)}>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${!consigneeEnabled ? "border-accent" : "border-muted-foreground"}`}>
                    {!consigneeEnabled && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                  </div>
                  <span className="text-sm text-foreground">No</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setConsigneeEnabled(true)}>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${consigneeEnabled ? "border-accent" : "border-muted-foreground"}`}>
                    {consigneeEnabled && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                  </div>
                  <span className="text-sm text-foreground">Yes</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom PDF bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30">
        <button
          onClick={handleGeneratePDF}
          className="w-full flex items-center justify-center gap-3 bg-destructive text-destructive-foreground py-4"
        >
          <span className="text-lg font-bold">PDF</span>
          <TrendingUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
