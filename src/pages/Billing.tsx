import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, FileText, Truck, RotateCcw, Download, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────
export interface InvoiceItem {
  description: string;
  hsnCode: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface GSTInvoice {
  id: string;
  type: "invoice" | "challan" | "credit-note" | "debit-note";
  invoiceNo: string;
  date: string;
  // Seller
  sellerName: string;
  sellerGstin: string;
  sellerAddress: string;
  sellerState: string;
  sellerStateCode: string;
  // Buyer
  buyerName: string;
  buyerGstin: string;
  buyerAddress: string;
  buyerState: string;
  buyerStateCode: string;
  // Items
  items: InvoiceItem[];
  // Tax
  isIgst: boolean; // true if interstate
  taxableAmount: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  amountInWords: string;
  // Optional
  referenceInvoiceNo?: string; // for credit/debit notes
  transportMode?: string;
  vehicleNo?: string;
  notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────
const UNITS = ["KG", "MTR", "PCS", "BAG", "BALE", "BOX", "TON"];
const STATES: { name: string; code: string }[] = [
  { name: "Tamil Nadu", code: "33" },
  { name: "Karnataka", code: "29" },
  { name: "Kerala", code: "32" },
  { name: "Andhra Pradesh", code: "37" },
  { name: "Telangana", code: "36" },
  { name: "Maharashtra", code: "27" },
  { name: "Gujarat", code: "24" },
  { name: "Rajasthan", code: "08" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Delhi", code: "07" },
];

const GST_RATES = [0, 5, 12, 18, 28];

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = "Rupees " + convert(rupees);
  if (paise > 0) result += " and " + convert(paise) + " Paise";
  return result + " Only";
}

function generateInvoiceNo(type: string): string {
  const prefix = type === "invoice" ? "INV" : type === "challan" ? "DC" : type === "credit-note" ? "CN" : "DN";
  return `${prefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
}

// ─── Mock Data ──────────────────────────────────────────
const MOCK_INVOICES: GSTInvoice[] = [
  {
    id: "inv1", type: "invoice", invoiceNo: "INV-2025-0042", date: "2025-03-05",
    sellerName: "AK Textiles", sellerGstin: "33AABCT1234F1ZP", sellerAddress: "15, Nethaji Road, Tiruppur", sellerState: "Tamil Nadu", sellerStateCode: "33",
    buyerName: "Ravi Spinning Mills", buyerGstin: "33BBDCR5678G1ZQ", buyerAddress: "22, Mill Street, Coimbatore", buyerState: "Tamil Nadu", buyerStateCode: "33",
    items: [
      { description: "Cotton Comber Noil (White)", hsnCode: "5202", qty: 5000, unit: "KG", rate: 85, amount: 425000 },
      { description: "Polyester Fiber Waste", hsnCode: "5505", qty: 2000, unit: "KG", rate: 45, amount: 90000 },
    ],
    isIgst: false, taxableAmount: 515000, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0,
    cgstAmount: 12875, sgstAmount: 12875, igstAmount: 0, totalAmount: 540750,
    amountInWords: "Rupees Five Lakh Forty Thousand Seven Hundred and Fifty Only",
  },
  {
    id: "dc1", type: "challan", invoiceNo: "DC-2025-0015", date: "2025-03-04",
    sellerName: "AK Textiles", sellerGstin: "33AABCT1234F1ZP", sellerAddress: "15, Nethaji Road, Tiruppur", sellerState: "Tamil Nadu", sellerStateCode: "33",
    buyerName: "KM Sorting Unit", buyerGstin: "33CCDEK9012H1ZR", buyerAddress: "8, Erode Main Road", buyerState: "Tamil Nadu", buyerStateCode: "33",
    items: [
      { description: "Mixed Cotton Waste (For Sorting)", hsnCode: "5202", qty: 8000, unit: "KG", rate: 0, amount: 0 },
    ],
    isIgst: false, taxableAmount: 0, cgstRate: 0, sgstRate: 0, igstRate: 0,
    cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0,
    amountInWords: "", transportMode: "Road", vehicleNo: "TN 39 AB 1234",
    notes: "Goods sent for job work processing. To be returned within 90 days.",
  },
];

// ─── Component ──────────────────────────────────────────
export default function Billing() {
  const navigate = useNavigate();
  const { user } = useApp();
  const { t } = useI18n();
  const [invoices, setInvoices] = useState<GSTInvoice[]>(MOCK_INVOICES);
  const [activeTab, setActiveTab] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<GSTInvoice | null>(null);
  const [docType, setDocType] = useState<GSTInvoice["type"]>("invoice");

  // ─── Form State ──────────────────────────────────
  const [buyerName, setBuyerName] = useState("");
  const [buyerGstin, setBuyerGstin] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerState, setBuyerState] = useState("");
  const [gstRate, setGstRate] = useState(5);
  const [refInvoice, setRefInvoice] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", hsnCode: "", qty: 0, unit: "KG", rate: 0, amount: 0 },
  ]);

  const addItem = () => setItems([...items, { description: "", hsnCode: "", qty: 0, unit: "KG", rate: 0, amount: 0 }]);

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === "qty" || field === "rate") {
      updated[index].amount = updated[index].qty * updated[index].rate;
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const selectedBuyerState = STATES.find((s) => s.name === buyerState);
  const isInterstate = selectedBuyerState ? selectedBuyerState.code !== "33" : false;

  const handleCreate = () => {
    if (!buyerName || !buyerGstin || !buyerState || items.some((i) => !i.description)) {
      toast.error(t("billing.fillRequired"));
      return;
    }

    const taxableAmount = items.reduce((s, i) => s + i.amount, 0);
    const halfRate = gstRate / 2;
    const cgst = isInterstate ? 0 : Math.round(taxableAmount * halfRate / 100);
    const sgst = isInterstate ? 0 : Math.round(taxableAmount * halfRate / 100);
    const igst = isInterstate ? Math.round(taxableAmount * gstRate / 100) : 0;
    const total = taxableAmount + cgst + sgst + igst;

    const invoice: GSTInvoice = {
      id: Date.now().toString(),
      type: docType,
      invoiceNo: generateInvoiceNo(docType),
      date: new Date().toISOString().split("T")[0],
      sellerName: user.businessName,
      sellerGstin: user.gstNumber,
      sellerAddress: `${user.locationDistrict}, Tamil Nadu`,
      sellerState: "Tamil Nadu",
      sellerStateCode: "33",
      buyerName,
      buyerGstin,
      buyerAddress,
      buyerState,
      buyerStateCode: selectedBuyerState?.code || "",
      items,
      isIgst: isInterstate,
      taxableAmount,
      cgstRate: isInterstate ? 0 : halfRate,
      sgstRate: isInterstate ? 0 : halfRate,
      igstRate: isInterstate ? gstRate : 0,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      totalAmount: total,
      amountInWords: numberToWords(total),
      referenceInvoiceNo: refInvoice || undefined,
      vehicleNo: vehicleNo || undefined,
      notes: notes || undefined,
    };

    setInvoices((prev) => [invoice, ...prev]);
    toast.success(`${docType === "invoice" ? "Invoice" : docType === "challan" ? "Challan" : "Note"} ${t("billing.created")}`);
    setCreateOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setBuyerName(""); setBuyerGstin(""); setBuyerAddress(""); setBuyerState("");
    setGstRate(5); setRefInvoice(""); setVehicleNo(""); setNotes("");
    setItems([{ description: "", hsnCode: "", qty: 0, unit: "KG", rate: 0, amount: 0 }]);
  };

  const filtered = activeTab === "all" ? invoices : invoices.filter((i) => i.type === activeTab);

  const typeLabel = (type: GSTInvoice["type"]) => {
    switch (type) {
      case "invoice": return t("billing.invoice");
      case "challan": return t("billing.challan");
      case "credit-note": return t("billing.creditNote");
      case "debit-note": return t("billing.debitNote");
    }
  };

  const typeColor = (type: GSTInvoice["type"]) => {
    switch (type) {
      case "invoice": return "bg-emerald/10 text-emerald";
      case "challan": return "bg-primary/10 text-primary";
      case "credit-note": return "bg-destructive/10 text-destructive";
      case "debit-note": return "bg-gold/10 text-gold";
    }
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("lead.back")}
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">{t("billing.title")}</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> {t("billing.new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[380px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("billing.createDoc")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Document Type */}
              <div className="grid grid-cols-2 gap-2">
                {(["invoice", "challan", "credit-note", "debit-note"] as const).map((dt) => (
                  <button key={dt} onClick={() => setDocType(dt)}
                    className={`py-2 px-2 rounded-lg text-[11px] font-medium transition-colors ${
                      docType === dt ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                    {typeLabel(dt)}
                  </button>
                ))}
              </div>

              {/* Reference Invoice (for credit/debit notes) */}
              {(docType === "credit-note" || docType === "debit-note") && (
                <div>
                  <Label className="text-xs">{t("billing.refInvoice")}</Label>
                  <Input value={refInvoice} onChange={(e) => setRefInvoice(e.target.value)} placeholder="INV-2025-0042" />
                </div>
              )}

              {/* Buyer Details */}
              <div className="border rounded-lg p-3 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">{t("billing.buyerDetails")}</p>
                <div>
                  <Label className="text-xs">{t("billing.partyName")} *</Label>
                  <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Business name" />
                </div>
                <div>
                  <Label className="text-xs">GSTIN *</Label>
                  <Input value={buyerGstin} onChange={(e) => setBuyerGstin(e.target.value.toUpperCase())} placeholder="33XXXXX1234X1Z5" maxLength={15} />
                </div>
                <div>
                  <Label className="text-xs">{t("billing.address")}</Label>
                  <Input value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} placeholder="Full address" />
                </div>
                <div>
                  <Label className="text-xs">{t("billing.state")} *</Label>
                  <Select value={buyerState} onValueChange={setBuyerState}>
                    <SelectTrigger><SelectValue placeholder={t("billing.selectState")} /></SelectTrigger>
                    <SelectContent>
                      {STATES.map((s) => (
                        <SelectItem key={s.code} value={s.name}>{s.name} ({s.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isInterstate && (
                    <p className="text-[10px] text-gold mt-1">⚠️ {t("billing.igstApplied")}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">{t("billing.items")}</p>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={addItem}>
                    <Plus className="h-3 w-3" /> {t("billing.addItem")}
                  </Button>
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="space-y-2 pb-2 border-b last:border-0">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-[10px]">{t("billing.itemDesc")} *</Label>
                        <Input className="h-8 text-xs" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Cotton Comber Noil" />
                      </div>
                      <div className="w-20">
                        <Label className="text-[10px]">HSN</Label>
                        <Input className="h-8 text-xs" value={item.hsnCode} onChange={(e) => updateItem(idx, "hsnCode", e.target.value)} placeholder="5202" />
                      </div>
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="w-16">
                        <Label className="text-[10px]">{t("billing.qty")}</Label>
                        <Input className="h-8 text-xs" type="number" value={item.qty || ""} onChange={(e) => updateItem(idx, "qty", Number(e.target.value))} />
                      </div>
                      <div className="w-16">
                        <Label className="text-[10px]">{t("billing.unit")}</Label>
                        <Select value={item.unit} onValueChange={(v) => updateItem(idx, "unit", v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <Label className="text-[10px]">{t("billing.rate")}</Label>
                        <Input className="h-8 text-xs" type="number" value={item.rate || ""} onChange={(e) => updateItem(idx, "rate", Number(e.target.value))} />
                      </div>
                      <div className="w-20">
                        <Label className="text-[10px]">{t("billing.amount")}</Label>
                        <Input className="h-8 text-xs" value={`₹${item.amount.toLocaleString("en-IN")}`} disabled />
                      </div>
                      {items.length > 1 && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => removeItem(idx)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* GST Rate */}
              {docType !== "challan" && (
                <div>
                  <Label className="text-xs">{t("billing.gstRate")}</Label>
                  <Select value={String(gstRate)} onValueChange={(v) => setGstRate(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GST_RATES.map((r) => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Transport (for challan) */}
              {docType === "challan" && (
                <div>
                  <Label className="text-xs">{t("billing.vehicleNo")}</Label>
                  <Input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value.toUpperCase())} placeholder="TN 39 AB 1234" />
                </div>
              )}

              <div>
                <Label className="text-xs">{t("billing.notes")}</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("billing.notesPlaceholder")} />
              </div>

              {/* Tax Summary */}
              {docType !== "challan" && (
                <div className="bg-secondary rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{t("billing.taxable")}</span>
                    <span>₹{items.reduce((s, i) => s + i.amount, 0).toLocaleString("en-IN")}</span>
                  </div>
                  {isInterstate ? (
                    <div className="flex justify-between text-xs">
                      <span>IGST @ {gstRate}%</span>
                      <span>₹{Math.round(items.reduce((s, i) => s + i.amount, 0) * gstRate / 100).toLocaleString("en-IN")}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-xs">
                        <span>CGST @ {gstRate / 2}%</span>
                        <span>₹{Math.round(items.reduce((s, i) => s + i.amount, 0) * gstRate / 200).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>SGST @ {gstRate / 2}%</span>
                        <span>₹{Math.round(items.reduce((s, i) => s + i.amount, 0) * gstRate / 200).toLocaleString("en-IN")}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
                    <span>{t("billing.total")}</span>
                    <span>₹{(items.reduce((s, i) => s + i.amount, 0) * (1 + gstRate / 100)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleCreate} className="w-full">
                {t("billing.createDoc")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="w-full grid grid-cols-4 h-9">
          <TabsTrigger value="all" className="text-[10px]">{t("home.all")}</TabsTrigger>
          <TabsTrigger value="invoice" className="text-[10px]">{t("billing.invoices")}</TabsTrigger>
          <TabsTrigger value="challan" className="text-[10px]">{t("billing.challans")}</TabsTrigger>
          <TabsTrigger value="credit-note" className="text-[10px]">CN/DN</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Invoice List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">{t("billing.noDocuments")}</div>
        ) : (
          filtered.map((inv) => (
            <Card key={inv.id} className="overflow-hidden cursor-pointer" onClick={() => setPreviewInvoice(inv)}>
              <CardContent className="p-0">
                <div className={`px-4 py-1.5 flex items-center justify-between ${typeColor(inv.type)}`}>
                  <div className="flex items-center gap-2">
                    {inv.type === "challan" ? <Truck className="h-3.5 w-3.5" /> : inv.type === "invoice" ? <FileText className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    <span className="text-[10px] font-bold">{typeLabel(inv.type)}</span>
                  </div>
                  <span className="text-[10px] font-mono">{inv.invoiceNo}</span>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-sm font-semibold">{inv.buyerName}</p>
                      <p className="text-[10px] text-muted-foreground">{inv.buyerGstin}</p>
                    </div>
                    <div className="text-right">
                      {inv.totalAmount > 0 && (
                        <p className="text-sm font-bold">₹{inv.totalAmount.toLocaleString("en-IN")}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">{inv.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {inv.items.slice(0, 2).map((item, i) => (
                      <Badge key={i} variant="outline" className="text-[9px]">{item.description.slice(0, 20)}</Badge>
                    ))}
                    {inv.items.length > 2 && (
                      <Badge variant="outline" className="text-[9px]">+{inv.items.length - 2}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-[380px] max-h-[90vh] overflow-y-auto">
          {previewInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{typeLabel(previewInvoice.type)} {previewInvoice.invoiceNo}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-2 text-xs space-y-3">
                {/* Header */}
                <div className="border-b pb-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    {previewInvoice.type === "challan" ? "DELIVERY CHALLAN" : previewInvoice.type === "invoice" ? "TAX INVOICE" : previewInvoice.type === "credit-note" ? "CREDIT NOTE" : "DEBIT NOTE"}
                  </p>
                  <div className="flex justify-between">
                    <span>{t("billing.date")}: {previewInvoice.date}</span>
                    <span>{previewInvoice.invoiceNo}</span>
                  </div>
                  {previewInvoice.referenceInvoiceNo && (
                    <p className="text-muted-foreground">Ref: {previewInvoice.referenceInvoiceNo}</p>
                  )}
                </div>

                {/* Seller / Buyer */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground mb-0.5">{t("billing.from")}</p>
                    <p className="font-semibold">{previewInvoice.sellerName}</p>
                    <p className="text-muted-foreground">{previewInvoice.sellerGstin}</p>
                    <p className="text-muted-foreground">{previewInvoice.sellerAddress}</p>
                    <p className="text-muted-foreground">{previewInvoice.sellerState} ({previewInvoice.sellerStateCode})</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground mb-0.5">{t("billing.to")}</p>
                    <p className="font-semibold">{previewInvoice.buyerName}</p>
                    <p className="text-muted-foreground">{previewInvoice.buyerGstin}</p>
                    <p className="text-muted-foreground">{previewInvoice.buyerAddress}</p>
                    <p className="text-muted-foreground">{previewInvoice.buyerState} ({previewInvoice.buyerStateCode})</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 bg-secondary px-2 py-1.5 text-[9px] font-bold text-muted-foreground">
                    <span className="col-span-4">{t("billing.itemDesc")}</span>
                    <span className="col-span-2">HSN</span>
                    <span className="col-span-2 text-right">{t("billing.qty")}</span>
                    <span className="col-span-2 text-right">{t("billing.rate")}</span>
                    <span className="col-span-2 text-right">{t("billing.amount")}</span>
                  </div>
                  {previewInvoice.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 px-2 py-1.5 text-[10px] border-t">
                      <span className="col-span-4">{item.description}</span>
                      <span className="col-span-2 text-muted-foreground">{item.hsnCode}</span>
                      <span className="col-span-2 text-right">{item.qty} {item.unit}</span>
                      <span className="col-span-2 text-right">₹{item.rate}</span>
                      <span className="col-span-2 text-right font-medium">₹{item.amount.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>

                {/* Tax Summary */}
                {previewInvoice.type !== "challan" && (
                  <div className="bg-secondary rounded-lg p-3 space-y-1">
                    <div className="flex justify-between">
                      <span>{t("billing.taxable")}</span>
                      <span>₹{previewInvoice.taxableAmount.toLocaleString("en-IN")}</span>
                    </div>
                    {previewInvoice.isIgst ? (
                      <div className="flex justify-between">
                        <span>IGST @ {previewInvoice.igstRate}%</span>
                        <span>₹{previewInvoice.igstAmount.toLocaleString("en-IN")}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>CGST @ {previewInvoice.cgstRate}%</span>
                          <span>₹{previewInvoice.cgstAmount.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SGST @ {previewInvoice.sgstRate}%</span>
                          <span>₹{previewInvoice.sgstAmount.toLocaleString("en-IN")}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-bold border-t pt-1 mt-1 text-sm">
                      <span>{t("billing.total")}</span>
                      <span>₹{previewInvoice.totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground italic pt-1">{previewInvoice.amountInWords}</p>
                  </div>
                )}

                {/* Transport / Notes */}
                {(previewInvoice.vehicleNo || previewInvoice.notes) && (
                  <div className="border-t pt-2 space-y-1">
                    {previewInvoice.vehicleNo && <p><span className="font-semibold">{t("billing.vehicleNo")}:</span> {previewInvoice.vehicleNo}</p>}
                    {previewInvoice.notes && <p><span className="font-semibold">{t("billing.notes")}:</span> {previewInvoice.notes}</p>}
                  </div>
                )}

                <Button variant="outline" className="w-full gap-1 text-xs" onClick={() => toast.success(t("billing.downloadSuccess"))}>
                  <Download className="h-3.5 w-3.5" /> {t("billing.downloadPdf")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
