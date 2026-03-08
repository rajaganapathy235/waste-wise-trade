import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useBilling } from "@/lib/billingContext";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, ArrowDownLeft, ArrowUpRight, Plus, FileText, Truck, RotateCcw, Download, Trash2,
  Receipt, ShoppingCart, FileCheck, ClipboardList, Briefcase,
  FileMinus, FilePlus, IndianRupee, CreditCard, Calendar,
  Home, Users, Package, ArrowRightLeft, BarChart3, Wallet, Search
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────
export interface InvoiceItem {
  slNo: number;
  description: string;
  hsnSac: string;
  qty: number;
  unit: string;
  rate: number;
  per: string;
  discount: number;
  amount: number;
}

export interface GSTInvoice {
  id: string;
  type: "sale-invoice" | "purchase-invoice" | "quotation" | "delivery-challan" | "proforma" | "purchase-order" | "sale-order" | "job-work" | "credit-note" | "debit-note";
  invoiceNo: string;
  date: string;
  // IRN / Ack
  irn?: string;
  ackNo?: string;
  ackDate?: string;
  // Seller
  sellerName: string;
  sellerGstin: string;
  sellerAddress: string;
  sellerState: string;
  sellerStateCode: string;
  // Consignee (Ship to)
  consigneeName: string;
  consigneeAddress: string;
  consigneeGstin: string;
  consigneeState: string;
  consigneeStateCode: string;
  // Buyer (Bill to)
  buyerName: string;
  buyerGstin: string;
  buyerAddress: string;
  buyerState: string;
  buyerStateCode: string;
  // Delivery info
  deliveryNote?: string;
  modeOfPayment?: string;
  referenceNo?: string;
  otherReferences?: string;
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  dispatchDocNo?: string;
  deliveryNoteDate?: string;
  dispatchedThrough?: string;
  destination?: string;
  termsOfDelivery?: string;
  // Items
  items: InvoiceItem[];
  // Tax
  placeOfSupply: string;
  isIgst: boolean;
  taxableAmount: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  amountInWords: string;
  taxAmountInWords: string;
  // Optional
  referenceInvoiceNo?: string;
  transportMode?: string;
  vehicleNo?: string;
  notes?: string;
  paymentTerms?: string;
  declaration?: string;
}

// ─── Helpers ──────────────────────────────────────────────
const UNITS = ["KG", "MTR", "PCS", "BAG", "BALE", "BOX", "TON", "LTR", "NOS", "SET"];
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
  { name: "West Bengal", code: "19" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Bihar", code: "10" },
  { name: "Punjab", code: "03" },
  { name: "Haryana", code: "06" },
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
  let result = "Indian Rupee " + convert(rupees);
  if (paise > 0) result += " and " + convert(paise) + " Paise";
  return result + " Only";
}

function generateInvoiceNo(type: string): string {
  const prefixMap: Record<string, string> = {
    "sale-invoice": "SI", "purchase-invoice": "PI", "quotation": "QT",
    "delivery-challan": "DC", "proforma": "PF", "purchase-order": "PO",
    "sale-order": "SO", "job-work": "JW", "credit-note": "CN", "debit-note": "DN"
  };
  const prefix = prefixMap[type] || "INV";
  return `${prefix}/${new Date().getFullYear()}-${new Date().getFullYear() + 1}/${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
}

// ─── Quick Links Config ──────────────────────────────────
const QUICK_LINKS: { key: string; label: string; icon: any; type: GSTInvoice["type"]; color: string }[] = [
  { key: "sale", label: "Sale Invoice", icon: Receipt, type: "sale-invoice", color: "text-emerald" },
  { key: "purchase", label: "Purchase Invoice", icon: ShoppingCart, type: "purchase-invoice", color: "text-primary" },
  { key: "quotation", label: "Quotation", icon: FileCheck, type: "quotation", color: "text-gold" },
  { key: "challan", label: "Delivery Challan", icon: Truck, type: "delivery-challan", color: "text-primary" },
  { key: "proforma", label: "Proforma", icon: ClipboardList, type: "proforma", color: "text-emerald" },
  { key: "po", label: "Purchase Order", icon: ShoppingCart, type: "purchase-order", color: "text-gold" },
  { key: "so", label: "Sale Order", icon: FileText, type: "sale-order", color: "text-primary" },
  { key: "jobwork", label: "Job Work", icon: Briefcase, type: "job-work", color: "text-emerald" },
  { key: "cn", label: "Credit Note", icon: FileMinus, type: "credit-note", color: "text-destructive" },
  { key: "dn", label: "Debit Note", icon: FilePlus, type: "debit-note", color: "text-gold" },
  { key: "inward", label: "Inward Payment", icon: IndianRupee, type: "sale-invoice", color: "text-emerald" },
  { key: "outward", label: "Outward Payment", icon: CreditCard, type: "purchase-invoice", color: "text-destructive" },
];

// ─── Mock Data ──────────────────────────────────────────
const MOCK_INVOICES: GSTInvoice[] = [
  {
    id: "inv1", type: "sale-invoice", invoiceNo: "SHB/456/20", date: "20-Dec-20",
    irn: "fef1df90406b928db28a62f816debc9bb5256d9375e6-0dc4226653cc23a8c595",
    ackNo: "112010036563310", ackDate: "21-Dec-20",
    sellerName: "Surabhi Hardwares, Bangalore", sellerGstin: "29AACCT3705E000",
    sellerAddress: "HSR Layout, Bangalore", sellerState: "Karnataka", sellerStateCode: "29",
    consigneeName: "Kiran Enterprises", consigneeAddress: "12th Cross",
    consigneeGstin: "29AAFFC8126N1ZZ", consigneeState: "Karnataka", consigneeStateCode: "29",
    buyerName: "Kiran Enterprises", buyerGstin: "29AAFFC8126N1ZZ",
    buyerAddress: "12th Cross", buyerState: "Karnataka", buyerStateCode: "29",
    deliveryNote: "Delivery Note", modeOfPayment: "Other References",
    placeOfSupply: "Karnataka",
    items: [
      { slNo: 1, description: "12MM**", hsnSac: "1005", qty: 7, unit: "No", rate: 500, per: "No", discount: 0, amount: 3500 },
    ],
    isIgst: false, taxableAmount: 3500, cgstRate: 9, sgstRate: 9, igstRate: 0,
    cgstAmount: 315, sgstAmount: 315, igstAmount: 0, totalAmount: 4130,
    amountInWords: "Indian Rupee Four Thousand One Hundred Thirty Only",
    taxAmountInWords: "Indian Rupee Six Hundred Thirty Only",
    declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  },
];

// ─── Component ──────────────────────────────────────────
export default function Billing() {
  const navigate = useNavigate();
  const { user } = useApp();
  const { parties: billingParties, items: billingItems, payments: billingPayments, expenses: billingExpenses } = useBilling();
  const { t } = useI18n();
  const [invoices, setInvoices] = useState<GSTInvoice[]>(MOCK_INVOICES);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [createOpen, setCreateOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<GSTInvoice | null>(null);
  const [docType, setDocType] = useState<GSTInvoice["type"]>("sale-invoice");

  // ─── Form State ──────────────────────────────────
  const [buyerName, setBuyerName] = useState("");
  const [buyerGstin, setBuyerGstin] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerState, setBuyerState] = useState("");
  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingGstin, setShippingGstin] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [gstRate, setGstRate] = useState(18);
  const [refInvoice, setRefInvoice] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { slNo: 1, description: "", hsnSac: "", qty: 0, unit: "KG", rate: 0, per: "KG", discount: 0, amount: 0 },
  ]);

  const addItem = () => setItems([...items, { slNo: items.length + 1, description: "", hsnSac: "", qty: 0, unit: "KG", rate: 0, per: "KG", discount: 0, amount: 0 }]);

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === "qty" || field === "rate" || field === "discount") {
      const gross = updated[index].qty * updated[index].rate;
      updated[index].amount = gross - (gross * updated[index].discount / 100);
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updated = items.filter((_, i) => i !== index).map((item, i) => ({ ...item, slNo: i + 1 }));
      setItems(updated);
    }
  };

  const selectedBuyerState = STATES.find((s) => s.name === buyerState);
  const selectedSupplyState = STATES.find((s) => s.name === placeOfSupply);
  const isInterstate = selectedSupplyState ? selectedSupplyState.code !== "33" : (selectedBuyerState ? selectedBuyerState.code !== "33" : false);

  const openCreateForType = (type: GSTInvoice["type"]) => {
    setDocType(type);
    resetForm();
    setCreateOpen(true);
  };

  const handleCreate = () => {
    if (!buyerName || !buyerGstin || !buyerState || items.some((i) => !i.description)) {
      toast.error("Please fill all required fields");
      return;
    }

    const taxableAmount = items.reduce((s, i) => s + i.amount, 0);
    const halfRate = gstRate / 2;
    const cgst = isInterstate ? 0 : Math.round(taxableAmount * halfRate / 100);
    const sgst = isInterstate ? 0 : Math.round(taxableAmount * halfRate / 100);
    const igst = isInterstate ? Math.round(taxableAmount * gstRate / 100) : 0;
    const total = taxableAmount + cgst + sgst + igst;
    const taxTotal = cgst + sgst + igst;

    const consignee = sameAsBilling
      ? { consigneeName: buyerName, consigneeAddress: buyerAddress, consigneeGstin: buyerGstin, consigneeState: buyerState, consigneeStateCode: selectedBuyerState?.code || "" }
      : { consigneeName: shippingName, consigneeAddress: shippingAddress, consigneeGstin: shippingGstin, consigneeState: shippingState, consigneeStateCode: STATES.find(s => s.name === shippingState)?.code || "" };

    const invoice: GSTInvoice = {
      id: Date.now().toString(),
      type: docType,
      invoiceNo: generateInvoiceNo(docType),
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }),
      sellerName: user.businessName,
      sellerGstin: user.gstNumber,
      sellerAddress: `${user.locationDistrict}, Tamil Nadu`,
      sellerState: "Tamil Nadu",
      sellerStateCode: "33",
      ...consignee,
      buyerName,
      buyerGstin,
      buyerAddress,
      buyerState,
      buyerStateCode: selectedBuyerState?.code || "",
      placeOfSupply: placeOfSupply || buyerState,
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
      taxAmountInWords: numberToWords(taxTotal),
      referenceInvoiceNo: refInvoice || undefined,
      vehicleNo: vehicleNo || undefined,
      notes: notes || undefined,
      paymentTerms: paymentTerms || undefined,
      declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
    };

    setInvoices((prev) => [invoice, ...prev]);
    toast.success(`${docType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())} created!`);
    setCreateOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setBuyerName(""); setBuyerGstin(""); setBuyerAddress(""); setBuyerState("");
    setShippingName(""); setShippingAddress(""); setShippingGstin(""); setShippingState("");
    setSameAsBilling(true);
    setGstRate(18); setRefInvoice(""); setVehicleNo(""); setNotes(""); setPaymentTerms(""); setPlaceOfSupply("");
    setItems([{ slNo: 1, description: "", hsnSac: "", qty: 0, unit: "KG", rate: 0, per: "KG", discount: 0, amount: 0 }]);
  };

  const typeLabel = (type: GSTInvoice["type"]) => {
    const map: Record<string, string> = {
      "sale-invoice": "Tax Invoice", "purchase-invoice": "Purchase Invoice", "quotation": "Quotation",
      "delivery-challan": "Delivery Challan", "proforma": "Proforma Invoice", "purchase-order": "Purchase Order",
      "sale-order": "Sale Order", "job-work": "Job Work Invoice", "credit-note": "Credit Note", "debit-note": "Debit Note"
    };
    return map[type] || type;
  };

  const typeColor = (type: GSTInvoice["type"]) => {
    if (type.includes("credit")) return "bg-destructive/10 text-destructive";
    if (type.includes("debit") || type.includes("quotation")) return "bg-gold/10 text-gold";
    if (type.includes("challan") || type.includes("purchase")) return "bg-primary/10 text-primary";
    return "bg-emerald/10 text-emerald";
  };

  const filtered = invoices.filter((i) => {
    if (activeTab === "all" || activeTab === "quicklinks") return true;
    if (activeTab === "invoices") return i.type === "sale-invoice" || i.type === "purchase-invoice";
    if (activeTab === "challans") return i.type === "delivery-challan";
    if (activeTab === "cn-dn") return i.type === "credit-note" || i.type === "debit-note";
    return true;
  });

  const needsTax = !["delivery-challan", "quotation"].includes(docType);

  // Dashboard stats from billing context
  const totalCollect = billingParties.filter(p => p.balanceType === "collect").reduce((s, p) => s + p.openingBalance, 0) + billingPayments.filter(p => p.type === "in").reduce((s, p) => s + p.amount, 0);
  const totalPay = billingParties.filter(p => p.balanceType === "pay").reduce((s, p) => s + p.openingBalance, 0) + billingPayments.filter(p => p.type === "out").reduce((s, p) => s + p.amount, 0);
  const thisWeekSales = billingPayments.filter(p => p.type === "in").reduce((s, p) => s + p.amount, 0);
  const stockValue = billingItems.filter(i => i.itemType === "product").reduce((s, i) => s + i.salesPrice * i.stockQty, 0);
  const totalExpenseAmt = billingExpenses.reduce((s, e) => s + e.amount, 0);

  const BILLING_NAV = [
    { key: "dashboard", label: "Dashboard", icon: Home },
    { key: "parties", label: "Parties", icon: Users },
    { key: "items", label: "Items", icon: Package },
    { key: "marketplace", label: "HiTex", icon: ArrowRightLeft },
  ];

  return (
    <div className="px-4 pt-3 pb-32 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">GST Billing</h1>
        <button onClick={() => setActiveTab("quicklinks")} className="flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground rounded-full px-3 py-1.5">
          <Plus className="h-3.5 w-3.5" /> Create
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        {/* Hidden TabsList — nav is at bottom */}
        <TabsList className="hidden">
          <TabsTrigger value="dashboard" />
          <TabsTrigger value="quicklinks" />
          <TabsTrigger value="all" />
          <TabsTrigger value="parties" />
          <TabsTrigger value="items" />
        </TabsList>

        {/* ─── Dashboard Tab ─── */}
        <TabsContent value="dashboard" className="mt-4 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-l-4 border-l-emerald cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("all")}>
              <CardContent className="p-3">
                <p className="text-lg font-bold">₹ {totalCollect.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-emerald font-semibold flex items-center gap-1">To Collect <ArrowDownLeft className="h-3 w-3" /></p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-destructive cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("all")}>
              <CardContent className="p-3">
                <p className="text-lg font-bold">₹ {totalPay.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-destructive font-semibold flex items-center gap-1">To Pay <ArrowUpRight className="h-3 w-3" /></p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/billing/stock-summary")}>
              <CardContent className="p-3">
                <p className="text-xs font-bold">₹ {stockValue.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground">Stock Value</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/billing/sales-summary")}>
              <CardContent className="p-3">
                <p className="text-xs font-bold">₹ {thisWeekSales.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground">This week's sale</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/billing/cash-bank")}>
              <CardContent className="p-3">
                <p className="text-xs font-bold">Total Balance</p>
                <p className="text-[10px] text-muted-foreground">Cash + Bank Balance</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/billing/reports")}>
              <CardContent className="p-3">
                <p className="text-xs font-bold flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> Reports</p>
                <p className="text-[10px] text-muted-foreground">Sales, Party, GST...</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <Button size="sm" variant="outline" className="text-[10px] gap-1 flex-1" onClick={() => navigate("/billing/payment-in")}>
              <ArrowDownLeft className="h-3 w-3 text-emerald" /> Payment In
            </Button>
            <Button size="sm" variant="outline" className="text-[10px] gap-1 flex-1" onClick={() => navigate("/billing/payment-out")}>
              <ArrowUpRight className="h-3 w-3 text-destructive" /> Payment Out
            </Button>
            <Button size="sm" variant="outline" className="text-[10px] gap-1 flex-1" onClick={() => navigate("/billing/expenses")}>
              <Wallet className="h-3 w-3 text-gold" /> Expense
            </Button>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold">Transactions</p>
              <button onClick={() => setActiveTab("all")} className="text-[10px] font-semibold text-primary flex items-center gap-1">
                <Calendar className="h-3 w-3" /> LAST 365 DAYS
              </button>
            </div>
            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No transactions yet. Create your first invoice!</div>
              ) : (
                invoices.slice(0, 5).map((inv) => (
                  <Card key={inv.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setPreviewInvoice(inv)}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold">{inv.buyerName}</p>
                          <p className="text-[10px] text-muted-foreground">{typeLabel(inv.type)} {inv.invoiceNo}</p>
                          <p className="text-[10px] text-muted-foreground">{inv.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">₹ {inv.totalAmount.toLocaleString("en-IN")}</p>
                          <Badge variant="outline" className="text-[9px] mt-1">
                            {inv.type.includes("purchase") ? "Paid" : "Open"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── Quick Links / Create Tab ─── */}
        <TabsContent value="quicklinks" className="mt-4">
          {/* Sales Transactions */}
          <p className="text-sm font-bold mb-3">Sales Transactions</p>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {QUICK_LINKS.filter((_, i) => i < 8).map(({ key, label, icon: Icon, type, color }) => (
              <button
                key={key}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                onClick={() => openCreateForType(type)}
              >
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center hover:shadow-md transition-all">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>
          {/* Purchase & Other */}
          <p className="text-sm font-bold mb-3">Purchase & Payments</p>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {QUICK_LINKS.filter((_, i) => i >= 8).map(({ key, label, icon: Icon, type, color }) => (
              <button
                key={key}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                onClick={() => openCreateForType(type)}
              >
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center hover:shadow-md transition-all">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* ─── History Tab ─── */}
        <TabsContent value="all" className="mt-4">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {[
              { val: "all", label: "All" },
              { val: "invoices", label: "Invoices" },
              { val: "challans", label: "Challans" },
              { val: "cn-dn", label: "CN/DN" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setActiveTab(val === "all" ? "all" : val)}
                className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
                  activeTab === val ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No documents yet</div>
            ) : (
              filtered.map((inv) => (
                <Card key={inv.id} className="overflow-hidden cursor-pointer" onClick={() => setPreviewInvoice(inv)}>
                  <CardContent className="p-0">
                    <div className={`px-4 py-1.5 flex items-center justify-between ${typeColor(inv.type)}`}>
                      <div className="flex items-center gap-2">
                        {inv.type.includes("challan") ? <Truck className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
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
                      <div className="flex gap-1 mt-1 flex-wrap">
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
        </TabsContent>

        {/* ─── Parties Tab ─── */}
        <TabsContent value="parties" className="mt-4">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {["To Pay", "To Collect", "All"].map(f => (
              <button key={f} className="px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                {f}
              </button>
            ))}
          </div>
          {/* Extract unique parties from invoices */}
          {(() => {
            const parties = Array.from(new Set(invoices.map(i => i.buyerName))).map(name => {
              const partyInvoices = invoices.filter(i => i.buyerName === name);
              const total = partyInvoices.reduce((s, i) => s + i.totalAmount, 0);
              const isBuyer = partyInvoices.some(i => i.type.includes("sale"));
              return { name, total, isBuyer, gstin: partyInvoices[0]?.buyerGstin };
            });
            return parties.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No parties yet. Create an invoice to add parties.</div>
            ) : (
              <div className="space-y-3">
                {parties.map(p => (
                  <Card key={p.name} className="cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-primary">
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">Customer</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald flex items-center gap-0.5">₹ {p.total.toLocaleString("en-IN")} <ArrowDownLeft className="h-3 w-3" /></p>
                        <button className="text-[10px] text-primary font-semibold">Send Reminder</button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}
        </TabsContent>

        {/* ─── Items Tab ─── */}
        <TabsContent value="items" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 overflow-x-auto">
              <button className="px-3 py-1 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground">Low Stock</button>
              <button className="px-3 py-1 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground">All Items</button>
            </div>
          </div>
          {/* Mock items from invoices */}
          {(() => {
            const allItems = invoices.flatMap(inv => inv.items.map(item => ({ ...item, invoiceType: inv.type })));
            const uniqueItems = Array.from(new Map(allItems.map(i => [i.description, i])).values());
            return uniqueItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No items yet. Create an invoice to add items.</div>
            ) : (
              <div className="space-y-3">
                {uniqueItems.map((item, idx) => (
                  <Card key={idx} className="cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-primary">
                        {item.description.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{item.description}</p>
                        <p className="text-[10px] text-muted-foreground">HSN: {item.hsnSac || "N/A"}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px] text-muted-foreground">Sales: ₹{item.rate.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{item.qty}</p>
                        <p className="text-[10px] text-muted-foreground">{item.unit}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}
          <Button onClick={() => { setDocType("sale-invoice"); resetForm(); setCreateOpen(true); }} className="w-full mt-4 gap-1.5">
            <Plus className="h-4 w-4" /> Create New Item
          </Button>
        </TabsContent>

        {["invoices", "challans", "cn-dn"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No documents yet</div>
              ) : (
                filtered.map((inv) => (
                  <Card key={inv.id} className="overflow-hidden cursor-pointer" onClick={() => setPreviewInvoice(inv)}>
                    <CardContent className="p-0">
                      <div className={`px-4 py-1.5 flex items-center justify-between ${typeColor(inv.type)}`}>
                        <span className="text-[10px] font-bold">{typeLabel(inv.type)}</span>
                        <span className="text-[10px] font-mono">{inv.invoiceNo}</span>
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-semibold">{inv.buyerName}</p>
                            <p className="text-[10px] text-muted-foreground">{inv.buyerGstin}</p>
                          </div>
                          <div className="text-right">
                            {inv.totalAmount > 0 && <p className="text-sm font-bold">₹{inv.totalAmount.toLocaleString("en-IN")}</p>}
                            <p className="text-[10px] text-muted-foreground">{inv.date}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border-t border-border z-30">
        <div className="flex items-center justify-around py-2">
          {BILLING_NAV.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            if (key === "marketplace") {
              return (
                <button key={key} onClick={() => navigate("/")} className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              );
            }
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          CREATE INVOICE DIALOG
         ═══════════════════════════════════════════════════════ */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-[400px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{typeLabel(docType)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">

            {/* Reference Invoice (for credit/debit notes) */}
            {(docType === "credit-note" || docType === "debit-note") && (
              <div>
                <Label className="text-xs">Reference Invoice No. *</Label>
                <Input value={refInvoice} onChange={(e) => setRefInvoice(e.target.value)} placeholder="SI/2025-2026/0042" />
              </div>
            )}

            {/* Buyer / Bill To */}
            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Buyer (Bill to)</p>
              <div>
                <Label className="text-xs">Party Name *</Label>
                <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Business name" />
              </div>
              <div>
                <Label className="text-xs">GSTIN/UIN *</Label>
                <Input value={buyerGstin} onChange={(e) => setBuyerGstin(e.target.value.toUpperCase())} placeholder="29XXXXX1234X1Z5" maxLength={15} />
              </div>
              <div>
                <Label className="text-xs">Address</Label>
                <Input value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} placeholder="Full address" />
              </div>
              <div>
                <Label className="text-xs">State *</Label>
                <Select value={buyerState} onValueChange={setBuyerState}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s.code} value={s.name}>{s.name} : Code {s.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Consignee / Ship To */}
            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Consignee (Ship to)</p>
                <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={sameAsBilling} onChange={(e) => setSameAsBilling(e.target.checked)} className="rounded" />
                  Same as billing
                </label>
              </div>
              {!sameAsBilling && (
                <>
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input value={shippingName} onChange={(e) => setShippingName(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">GSTIN/UIN</Label>
                    <Input value={shippingGstin} onChange={(e) => setShippingGstin(e.target.value.toUpperCase())} maxLength={15} />
                  </div>
                  <div>
                    <Label className="text-xs">Address</Label>
                    <Input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">State</Label>
                    <Select value={shippingState} onValueChange={setShippingState}>
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {STATES.map((s) => (
                          <SelectItem key={s.code} value={s.name}>{s.name} : Code {s.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {/* Place of Supply */}
            <div>
              <Label className="text-xs">Place of Supply</Label>
              <Select value={placeOfSupply} onValueChange={setPlaceOfSupply}>
                <SelectTrigger><SelectValue placeholder="Auto-detect from buyer state" /></SelectTrigger>
                <SelectContent>
                  {STATES.map((s) => (
                    <SelectItem key={s.code} value={s.name}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInterstate && (
                <p className="text-[10px] text-gold mt-1">⚠️ Interstate — IGST will apply</p>
              )}
            </div>

            {/* Items */}
            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item Details</p>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={addItem}>
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="space-y-2 pb-2 border-b last:border-0">
                  <div className="flex gap-2">
                    <div className="w-6 flex items-end pb-2">
                      <span className="text-[10px] text-muted-foreground font-mono">{item.slNo}</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px]">Description of Goods/Services *</Label>
                      <Input className="h-8 text-xs" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Cotton Comber Noil" />
                    </div>
                    <div className="w-20">
                      <Label className="text-[10px]">HSN/SAC</Label>
                      <Input className="h-8 text-xs" value={item.hsnSac} onChange={(e) => updateItem(idx, "hsnSac", e.target.value)} placeholder="5202" />
                    </div>
                  </div>
                  <div className="flex gap-2 items-end flex-wrap">
                    <div className="w-14">
                      <Label className="text-[10px]">Qty</Label>
                      <Input className="h-8 text-xs" type="number" value={item.qty || ""} onChange={(e) => updateItem(idx, "qty", Number(e.target.value))} />
                    </div>
                    <div className="w-16">
                      <Label className="text-[10px]">Unit</Label>
                      <Select value={item.unit} onValueChange={(v) => { updateItem(idx, "unit", v); updateItem(idx, "per", v); }}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-16">
                      <Label className="text-[10px]">Rate (₹)</Label>
                      <Input className="h-8 text-xs" type="number" value={item.rate || ""} onChange={(e) => updateItem(idx, "rate", Number(e.target.value))} />
                    </div>
                    <div className="w-14">
                      <Label className="text-[10px]">Disc %</Label>
                      <Input className="h-8 text-xs" type="number" value={item.discount || ""} onChange={(e) => updateItem(idx, "discount", Number(e.target.value))} />
                    </div>
                    <div className="w-20">
                      <Label className="text-[10px]">Amount</Label>
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
            {needsTax && (
              <div>
                <Label className="text-xs">GST Rate</Label>
                <Select value={String(gstRate)} onValueChange={(v) => setGstRate(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GST_RATES.map((r) => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Transport */}
            {docType === "delivery-challan" && (
              <div>
                <Label className="text-xs">Vehicle No.</Label>
                <Input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value.toUpperCase())} placeholder="TN 39 AB 1234" />
              </div>
            )}

            {/* Payment Terms */}
            <div>
              <Label className="text-xs">Payment Terms</Label>
              <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="Net 30 days / Advance payment" />
            </div>

            <div>
              <Label className="text-xs">Notes / Remarks</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." className="h-16 text-xs" />
            </div>

            {/* Tax Summary */}
            {needsTax && (
              <div className="bg-secondary rounded-lg p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Taxable Value</span>
                  <span>₹{items.reduce((s, i) => s + i.amount, 0).toLocaleString("en-IN")}</span>
                </div>
                {isInterstate ? (
                  <div className="flex justify-between">
                    <span>IGST @ {gstRate}%</span>
                    <span>₹{Math.round(items.reduce((s, i) => s + i.amount, 0) * gstRate / 100).toLocaleString("en-IN")}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>CGST @ {gstRate / 2}%</span>
                      <span>₹{Math.round(items.reduce((s, i) => s + i.amount, 0) * gstRate / 200).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST @ {gstRate / 2}%</span>
                      <span>₹{Math.round(items.reduce((s, i) => s + i.amount, 0) * gstRate / 200).toLocaleString("en-IN")}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-border pt-1 mt-1">
                  <span>Total</span>
                  <span>₹{(items.reduce((s, i) => s + i.amount, 0) * (1 + gstRate / 100)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            )}

            <Button onClick={handleCreate} className="w-full">
              Create {typeLabel(docType)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════
          TALLY-STYLE INVOICE PREVIEW
         ═══════════════════════════════════════════════════════ */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-[440px] max-h-[95vh] overflow-y-auto p-0">
          {previewInvoice && (
            <div className="bg-background">
              {/* Tally-style bordered invoice */}
              <div className="border-2 border-foreground/80 m-3 text-[10px] leading-tight">
                {/* Title */}
                <div className="text-center border-b border-foreground/80 py-2">
                  <p className="text-sm font-bold tracking-wide">{typeLabel(previewInvoice.type).toUpperCase()}</p>
                </div>

                {/* IRN & e-Invoice */}
                {previewInvoice.irn && (
                  <div className="border-b border-foreground/80 px-2 py-1.5 space-y-0.5">
                    <p><span className="font-semibold">IRN</span> : {previewInvoice.irn}</p>
                    {previewInvoice.ackNo && <p><span className="font-semibold">Ack No.</span> : {previewInvoice.ackNo}</p>}
                    {previewInvoice.ackDate && <p><span className="font-semibold">Ack Date</span> : {previewInvoice.ackDate}</p>}
                  </div>
                )}

                {/* Seller + Invoice Meta */}
                <div className="border-b border-foreground/80 grid grid-cols-12">
                  <div className="col-span-7 border-r border-foreground/80 p-2">
                    <p className="font-bold text-xs">{previewInvoice.sellerName}</p>
                    <p>{previewInvoice.sellerAddress}</p>
                    <p>GSTIN/UIN: {previewInvoice.sellerGstin}</p>
                    <p>State Name : {previewInvoice.sellerState}, Code : {previewInvoice.sellerStateCode}</p>
                  </div>
                  <div className="col-span-5 p-1 space-y-0.5">
                    <div className="grid grid-cols-2 gap-0.5">
                      <div className="border-b border-foreground/30 pb-0.5">
                        <p className="font-semibold">Invoice No.</p>
                        <p className="font-bold">{previewInvoice.invoiceNo}</p>
                      </div>
                      <div className="border-b border-foreground/30 pb-0.5">
                        <p className="font-semibold">Dated</p>
                        <p className="font-bold">{previewInvoice.date}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-0.5">
                      <p className="font-semibold">{previewInvoice.deliveryNote || "Delivery Note"}</p>
                      <p className="font-semibold">{previewInvoice.modeOfPayment || "Mode/Terms of Payment"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-0.5">
                      <p className="font-semibold">Reference No. & Date.</p>
                      <p className="font-semibold">{previewInvoice.otherReferences || "Other References"}</p>
                    </div>
                  </div>
                </div>

                {/* Consignee (Ship to) */}
                <div className="border-b border-foreground/80 grid grid-cols-12">
                  <div className="col-span-7 border-r border-foreground/80 p-2">
                    <p className="text-[9px] text-muted-foreground">Consignee (Ship to)</p>
                    <p className="font-bold">{previewInvoice.consigneeName}</p>
                    <p>{previewInvoice.consigneeAddress}</p>
                    <p>GSTIN/UIN : {previewInvoice.consigneeGstin}</p>
                    <p>State Name : {previewInvoice.consigneeState}, Code : {previewInvoice.consigneeStateCode}</p>
                  </div>
                  <div className="col-span-5 p-1 space-y-0.5">
                    <div className="grid grid-cols-2 gap-0.5">
                      <p className="font-semibold">Buyer's Order No.</p>
                      <p className="font-semibold">Dated</p>
                    </div>
                    <div className="grid grid-cols-2 gap-0.5">
                      <p className="font-semibold">Dispatch Doc No.</p>
                      <p className="font-semibold">Delivery Note Date</p>
                    </div>
                  </div>
                </div>

                {/* Buyer (Bill to) */}
                <div className="border-b border-foreground/80 grid grid-cols-12">
                  <div className="col-span-7 border-r border-foreground/80 p-2">
                    <p className="text-[9px] text-muted-foreground">Buyer (Bill to)</p>
                    <p className="font-bold">{previewInvoice.buyerName}</p>
                    <p>{previewInvoice.buyerAddress}</p>
                    <p>GSTIN/UIN : {previewInvoice.buyerGstin}</p>
                    <p>State Name : {previewInvoice.buyerState}, Code : {previewInvoice.buyerStateCode}</p>
                  </div>
                  <div className="col-span-5 p-1 space-y-0.5">
                    <div className="grid grid-cols-2 gap-0.5">
                      <p className="font-semibold">Dispatched through</p>
                      <p className="font-semibold">Destination</p>
                    </div>
                    <p className="font-semibold">Terms of Delivery</p>
                    {previewInvoice.termsOfDelivery && <p>{previewInvoice.termsOfDelivery}</p>}
                  </div>
                </div>

                {/* Items Table Header */}
                <div className="border-b border-foreground/80">
                  <div className="grid grid-cols-24 text-[9px] font-bold border-b border-foreground/80">
                    <div className="col-span-2 p-1 border-r border-foreground/30 text-center">Sl No.</div>
                    <div className="col-span-7 p-1 border-r border-foreground/30">Description of Goods</div>
                    <div className="col-span-3 p-1 border-r border-foreground/30 text-center">HSN/SAC</div>
                    <div className="col-span-3 p-1 border-r border-foreground/30 text-right">Quantity</div>
                    <div className="col-span-3 p-1 border-r border-foreground/30 text-right">Rate</div>
                    <div className="col-span-2 p-1 border-r border-foreground/30 text-center">per</div>
                    <div className="col-span-1 p-1 border-r border-foreground/30 text-center">Disc.%</div>
                    <div className="col-span-3 p-1 text-right">Amount</div>
                  </div>

                  {/* Items */}
                  {previewInvoice.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-24 text-[10px]">
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-center">{item.slNo}</div>
                      <div className="col-span-7 p-1 border-r border-foreground/30 font-semibold">{item.description}</div>
                      <div className="col-span-3 p-1 border-r border-foreground/30 text-center">{item.hsnSac}</div>
                      <div className="col-span-3 p-1 border-r border-foreground/30 text-right font-bold">{item.qty} {item.unit}</div>
                      <div className="col-span-3 p-1 border-r border-foreground/30 text-right">{item.rate.toFixed(2)}</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-center">{item.per}</div>
                      <div className="col-span-1 p-1 border-r border-foreground/30 text-center">{item.discount || ""}</div>
                      <div className="col-span-3 p-1 text-right font-medium">{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                    </div>
                  ))}

                  {/* Tax rows within items */}
                  {previewInvoice.type !== "delivery-challan" && (
                    <>
                      {previewInvoice.isIgst ? (
                        <div className="grid grid-cols-24 text-[10px]">
                          <div className="col-span-2 p-1 border-r border-foreground/30"></div>
                          <div className="col-span-7 p-1 border-r border-foreground/30"></div>
                          <div className="col-span-3 p-1 border-r border-foreground/30"></div>
                          <div className="col-span-3 p-1 border-r border-foreground/30"></div>
                          <div className="col-span-3 p-1 border-r border-foreground/30 text-right font-bold">IGST</div>
                          <div className="col-span-2 p-1 border-r border-foreground/30"></div>
                          <div className="col-span-1 p-1 border-r border-foreground/30"></div>
                          <div className="col-span-3 p-1 text-right">{previewInvoice.igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-24 text-[10px]">
                            <div className="col-span-2 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-7 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-3 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-3 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-3 p-1 border-r border-foreground/30 text-right font-bold">CGST</div>
                            <div className="col-span-2 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-1 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-3 p-1 text-right">{previewInvoice.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                          </div>
                          <div className="grid grid-cols-24 text-[10px]">
                            <div className="col-span-2 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-7 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-3 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-3 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-3 p-1 border-r border-foreground/30 text-right font-bold">SGST</div>
                            <div className="col-span-2 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-1 p-1 border-r border-foreground/30"></div>
                            <div className="col-span-3 p-1 text-right">{previewInvoice.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Total Row */}
                  <div className="grid grid-cols-24 text-[10px] border-t border-foreground/80 font-bold">
                    <div className="col-span-2 p-1 border-r border-foreground/30"></div>
                    <div className="col-span-7 p-1 border-r border-foreground/30 text-right">Total</div>
                    <div className="col-span-3 p-1 border-r border-foreground/30"></div>
                    <div className="col-span-3 p-1 border-r border-foreground/30 text-right">{previewInvoice.items.reduce((s, i) => s + i.qty, 0)} {previewInvoice.items[0]?.unit}</div>
                    <div className="col-span-3 p-1 border-r border-foreground/30"></div>
                    <div className="col-span-2 p-1 border-r border-foreground/30"></div>
                    <div className="col-span-1 p-1 border-r border-foreground/30"></div>
                    <div className="col-span-3 p-1 text-right text-xs">₹ {previewInvoice.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>

                {/* Amount Chargeable (in words) */}
                <div className="border-b border-foreground/80 px-2 py-1.5">
                  <p className="text-[9px] text-muted-foreground">Amount Chargeable (in words)</p>
                  <p className="font-bold text-[11px]">{previewInvoice.amountInWords}</p>
                  <p className="text-right text-[9px] text-muted-foreground">E. & O.E</p>
                </div>

                {/* HSN/SAC Tax Summary Table */}
                {previewInvoice.type !== "delivery-challan" && (
                  <div className="border-b border-foreground/80">
                    <div className="grid grid-cols-12 text-[8px] font-bold border-b border-foreground/30 bg-secondary/30">
                      <div className="col-span-2 p-1 border-r border-foreground/30">HSN/SAC</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-right">Taxable Value</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-center">Central Tax<br/>Rate | Amt</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-center">State Tax<br/>Rate | Amt</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-center">{previewInvoice.isIgst ? "IGST" : "Total Tax"}<br/>Rate | Amt</div>
                      <div className="col-span-2 p-1 text-right">Total Tax Amount</div>
                    </div>
                    {/* Group by HSN */}
                    {Array.from(new Set(previewInvoice.items.map(i => i.hsnSac))).map(hsn => {
                      const hsnItems = previewInvoice.items.filter(i => i.hsnSac === hsn);
                      const hsnTaxable = hsnItems.reduce((s, i) => s + i.amount, 0);
                      const totalTax = previewInvoice.isIgst
                        ? Math.round(hsnTaxable * previewInvoice.igstRate / 100)
                        : Math.round(hsnTaxable * previewInvoice.cgstRate / 100) + Math.round(hsnTaxable * previewInvoice.sgstRate / 100);
                      return (
                        <div key={hsn} className="grid grid-cols-12 text-[9px] border-b border-foreground/20">
                          <div className="col-span-2 p-1 border-r border-foreground/30">{hsn}</div>
                          <div className="col-span-2 p-1 border-r border-foreground/30 text-right">{hsnTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                          <div className="col-span-2 p-1 border-r border-foreground/30 text-center">
                            {previewInvoice.isIgst ? "-" : `${previewInvoice.cgstRate}% | ${Math.round(hsnTaxable * previewInvoice.cgstRate / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                          </div>
                          <div className="col-span-2 p-1 border-r border-foreground/30 text-center">
                            {previewInvoice.isIgst ? "-" : `${previewInvoice.sgstRate}% | ${Math.round(hsnTaxable * previewInvoice.sgstRate / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                          </div>
                          <div className="col-span-2 p-1 border-r border-foreground/30 text-center">
                            {previewInvoice.isIgst
                              ? `${previewInvoice.igstRate}% | ${Math.round(hsnTaxable * previewInvoice.igstRate / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                              : `${totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                            }
                          </div>
                          <div className="col-span-2 p-1 text-right">{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                        </div>
                      );
                    })}
                    {/* HSN Total Row */}
                    <div className="grid grid-cols-12 text-[9px] font-bold border-t border-foreground/50">
                      <div className="col-span-2 p-1 border-r border-foreground/30">Total</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-right">{previewInvoice.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-center">{previewInvoice.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-center">{previewInvoice.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-center">{(previewInvoice.cgstAmount + previewInvoice.sgstAmount + previewInvoice.igstAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                      <div className="col-span-2 p-1 text-right">{(previewInvoice.cgstAmount + previewInvoice.sgstAmount + previewInvoice.igstAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                )}

                {/* Tax Amount in Words */}
                {previewInvoice.taxAmountInWords && (
                  <div className="border-b border-foreground/80 px-2 py-1">
                    <p className="text-[9px]"><span className="font-semibold">Tax Amount (in words) :</span> <span className="font-bold">{previewInvoice.taxAmountInWords}</span></p>
                  </div>
                )}

                {/* Declaration + Signatory */}
                <div className="grid grid-cols-2">
                  <div className="p-2 border-r border-foreground/80">
                    <p className="text-[9px] font-semibold underline">Declaration</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">
                      {previewInvoice.declaration || "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."}
                    </p>
                    {previewInvoice.paymentTerms && (
                      <p className="text-[8px] mt-1"><span className="font-semibold">Payment Terms:</span> {previewInvoice.paymentTerms}</p>
                    )}
                    {previewInvoice.notes && (
                      <p className="text-[8px] mt-1"><span className="font-semibold">Notes:</span> {previewInvoice.notes}</p>
                    )}
                  </div>
                  <div className="p-2 text-right">
                    <p className="text-[9px] font-semibold">for {previewInvoice.sellerName}</p>
                    <div className="h-10"></div>
                    <p className="text-[9px] font-semibold">Authorised Signatory</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-foreground/80 text-center py-1">
                  <p className="text-[8px] text-muted-foreground">This is a Computer Generated Invoice</p>
                </div>
              </div>

              {/* Download Button */}
              <div className="px-3 pb-3">
                <Button variant="outline" className="w-full gap-1 text-xs" onClick={() => toast.success("PDF download coming soon!")}>
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
