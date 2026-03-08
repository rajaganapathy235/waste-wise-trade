import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useBilling, type GSTInvoice, type InvoiceItem, type BillingParty } from "@/lib/billingContext";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, FileText, Truck, Download, Trash2,
  Receipt, ShoppingCart, FileCheck,
  FileMinus, FilePlus, IndianRupee,
  Users, Package, Search,
  MessageCircle, Upload, Share2, User, Phone,
  Pencil, QrCode, AlertTriangle, FileDown, CheckCircle2, Clock, XCircle,
  Info, Send
} from "lucide-react";
import { toast } from "sonner";
import { generateInvoicePdf } from "@/lib/invoicePdf";
import { exportToCSV } from "@/lib/csvExport";
import { formatDisplayDate } from "@/components/DateRangeFilter";

// ─── Helpers ──────────────────────────────────────────────
const UNITS = ["KG", "MTR", "PCS", "BAG", "BALE", "BOX", "TON", "LTR", "NOS", "SET"];
const STATES: { name: string; code: string }[] = [
  { name: "Tamil Nadu", code: "33" }, { name: "Karnataka", code: "29" }, { name: "Kerala", code: "32" },
  { name: "Andhra Pradesh", code: "37" }, { name: "Telangana", code: "36" }, { name: "Maharashtra", code: "27" },
  { name: "Gujarat", code: "24" }, { name: "Rajasthan", code: "08" }, { name: "Uttar Pradesh", code: "09" },
  { name: "Delhi", code: "07" }, { name: "West Bengal", code: "19" }, { name: "Madhya Pradesh", code: "23" },
  { name: "Bihar", code: "10" }, { name: "Punjab", code: "03" }, { name: "Haryana", code: "06" },
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

const SALE_TYPES = ["sale-invoice", "quotation", "proforma", "sale-order", "delivery-challan", "job-work"];
const PURCHASE_TYPES = ["purchase-invoice", "purchase-order", "debit-note"];

function generateInvoiceNo(type: string, existingInvoices: GSTInvoice[]): string {
  const prefixMap: Record<string, string> = {
    "sale-invoice": "SI", "purchase-invoice": "PI", "quotation": "QT",
    "delivery-challan": "DC", "proforma": "PF", "purchase-order": "PO",
    "sale-order": "SO", "job-work": "JW", "credit-note": "CN", "debit-note": "DN"
  };
  const prefix = prefixMap[type] || "INV";
  const year = new Date().getFullYear();
  const yearStr = `${year}-${year + 1}`;
  const existing = existingInvoices
    .filter(i => i.invoiceNo.startsWith(prefix + "/"))
    .map(i => { const parts = i.invoiceNo.split("/"); return parseInt(parts[parts.length - 1]) || 0; });
  const next = (existing.length > 0 ? Math.max(...existing) : 0) + 1;
  return `${prefix}/${yearStr}/${String(next).padStart(4, "0")}`;
}

const statusConfig = {
  unpaid: { label: "Unpaid", color: "bg-destructive/10 text-destructive", icon: XCircle },
  partial: { label: "Partial", color: "bg-gold/10 text-gold", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald/10 text-emerald", icon: CheckCircle2 },
};

// ─── Component ──────────────────────────────────────────
export default function Billing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useApp();
  const { parties: billingParties, setParties: setBillingParties, items: billingItems, setItems: setBillingItems, payments: billingPayments, setPayments, expenses: billingExpenses, invoices, setInvoices } = useBilling();
  const i18n = useI18n();
  const { t, lang, setLang, languages } = i18n;

  // Bottom nav active tab: send, party, bills, products
  const [activeTab, setActiveTab] = useState("send");

  useEffect(() => {
    const state = location.state as { tab?: string } | null;
    if (state?.tab) { setActiveTab(state.tab); window.history.replaceState({}, document.title); }
  }, [location.state]);

  const [createOpen, setCreateOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<GSTInvoice | null>(null);
  const [docType, setDocType] = useState<GSTInvoice["type"]>("sale-invoice");
  const [partySubTab, setPartySubTab] = useState<"customer" | "supplier">("customer");
  const [billSubTab, setBillSubTab] = useState<"sales" | "purchase" | "quotation">("sales");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [partySearchQuery, setPartySearchQuery] = useState("");
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);

  // Bill type for home
  const [homeBillType, setHomeBillType] = useState<"sales" | "purchase" | "quotation">("sales");

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
  const [vehicleType, setVehicleType] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [transporterId, setTransporterId] = useState("");
  const [lrNo, setLrNo] = useState("");
  const [lrDate, setLrDate] = useState("");
  const [eWayBillNo, setEWayBillNo] = useState("");
  const [eWayBillDate, setEWayBillDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { slNo: 1, description: "", hsnSac: "", qty: 0, unit: "KG", rate: 0, per: "KG", discount: 0, amount: 0, gstRate: 18 },
  ]);

  const addItem = () => setItems([...items, { slNo: items.length + 1, description: "", hsnSac: "", qty: 0, unit: "KG", rate: 0, per: "KG", discount: 0, amount: 0, gstRate: 18 }]);

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

  const selectCatalogItem = (index: number, catalogItemId: string) => {
    const catItem = billingItems.find(i => i.id === catalogItemId);
    if (!catItem) return;
    const isSale = SALE_TYPES.includes(docType);
    const updated = [...items];
    updated[index] = {
      ...updated[index], description: catItem.name, hsnSac: catItem.hsnSac, unit: catItem.unit, per: catItem.unit,
      rate: isSale ? catItem.salesPrice : catItem.purchasePrice, gstRate: catItem.gstRate,
      qty: updated[index].qty || 1,
      amount: (updated[index].qty || 1) * (isSale ? catItem.salesPrice : catItem.purchasePrice),
    };
    setItems(updated);
  };

  const selectParty = (party: BillingParty) => {
    setBuyerName(party.name); setBuyerGstin(party.gstin); setBuyerAddress(party.address); setBuyerState(party.state);
    setShowPartyDropdown(false); setPartySearchQuery("");
  };

  const filteredPartyList = useMemo(() => {
    const q = (partySearchQuery || buyerName).toLowerCase();
    if (!q) return billingParties.slice(0, 10);
    return billingParties.filter(p => p.name.toLowerCase().includes(q) || p.gstin.toLowerCase().includes(q));
  }, [partySearchQuery, buyerName, billingParties]);

  const selectedBuyerState = STATES.find((s) => s.name === buyerState);
  const selectedSupplyState = STATES.find((s) => s.name === placeOfSupply);
  const isInterstate = selectedSupplyState ? selectedSupplyState.code !== "33" : (selectedBuyerState ? selectedBuyerState.code !== "33" : false);

  const openCreateForType = (type: GSTInvoice["type"]) => {
    setDocType(type); setEditingInvoiceId(null); resetForm(); setCreateOpen(true);
  };

  const editInvoice = (inv: GSTInvoice) => {
    setEditingInvoiceId(inv.id); setDocType(inv.type);
    setBuyerName(inv.buyerName); setBuyerGstin(inv.buyerGstin); setBuyerAddress(inv.buyerAddress); setBuyerState(inv.buyerState);
    setPlaceOfSupply(inv.placeOfSupply); setRefInvoice(inv.referenceInvoiceNo || "");
    setVehicleNo(inv.vehicleNo || ""); setVehicleType(inv.vehicleType || "");
    setTransportMode(inv.transportMode || ""); setTransporterName(inv.transporterName || "");
    setTransporterId(inv.transporterId || ""); setLrNo(inv.lrNo || ""); setLrDate(inv.lrDate || "");
    setEWayBillNo(inv.eWayBillNo || ""); setEWayBillDate(inv.eWayBillDate || "");
    setNotes(inv.notes || ""); setPaymentTerms(inv.paymentTerms || "");
    setGstRate(inv.isIgst ? inv.igstRate : inv.cgstRate * 2);
    setItems(inv.items.map(i => ({ ...i })));
    if (inv.consigneeName !== inv.buyerName) {
      setSameAsBilling(false); setShippingName(inv.consigneeName);
      setShippingAddress(inv.consigneeAddress); setShippingGstin(inv.consigneeGstin); setShippingState(inv.consigneeState);
    } else { setSameAsBilling(true); }
    setPreviewInvoice(null); setCreateOpen(true);
  };

  const deleteInvoice = (id: string) => { setInvoices(prev => prev.filter(inv => inv.id !== id)); setPreviewInvoice(null); toast.success("Invoice deleted"); };
  const deleteParty = (id: string) => { setBillingParties(prev => prev.filter(p => p.id !== id)); toast.success("Party deleted"); };
  const deleteItem = (id: string) => { setBillingItems(prev => prev.filter(i => i.id !== id)); toast.success("Item deleted"); };

  const changeStatus = (id: string, status: GSTInvoice["status"]) => {
    const inv = invoices.find(i => i.id === id);
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (previewInvoice?.id === id) setPreviewInvoice(prev => prev ? { ...prev, status } : null);
    if (status === "paid" && inv) {
      const isSaleType = SALE_TYPES.includes(inv.type);
      const existingParty = billingParties.find(p => p.name.toLowerCase() === inv.buyerName.toLowerCase() || (inv.buyerGstin && p.gstin === inv.buyerGstin));
      const payment: import("@/lib/billingContext").Payment = {
        id: "autopay_" + Date.now().toString(), type: isSaleType ? "in" : "out",
        partyId: existingParty?.id || "", partyName: inv.buyerName, amount: inv.totalAmount,
        paymentMode: "bank", date: new Date().toISOString().slice(0, 10),
        note: `Payment for ${inv.invoiceNo}`, invoiceRef: inv.invoiceNo,
      };
      setPayments(prev => [payment, ...prev]);
    }
    toast.success(`Status changed to ${statusConfig[status].label}`);
  };

  const getPartyOutstanding = (party: BillingParty) => {
    const partyInvoices = invoices.filter(inv => {
      const match = inv.buyerName.toLowerCase() === party.name.toLowerCase() || (party.gstin && inv.buyerGstin === party.gstin);
      return match && inv.status !== "paid";
    });
    const saleTotal = partyInvoices.filter(i => SALE_TYPES.includes(i.type)).reduce((s, i) => s + i.totalAmount, 0);
    const purchaseTotal = partyInvoices.filter(i => PURCHASE_TYPES.includes(i.type)).reduce((s, i) => s + i.totalAmount, 0);
    const paymentsIn = billingPayments.filter(p => p.partyId === party.id && p.type === "in").reduce((s, p) => s + p.amount, 0);
    const paymentsOut = billingPayments.filter(p => p.partyId === party.id && p.type === "out").reduce((s, p) => s + p.amount, 0);
    const toCollect = Math.max(0, party.openingBalance * (party.balanceType === "collect" ? 1 : 0) + saleTotal - paymentsIn);
    const toPay = Math.max(0, party.openingBalance * (party.balanceType === "pay" ? 1 : 0) + purchaseTotal - paymentsOut);
    return { toCollect, toPay, net: toCollect - toPay };
  };

  const getPartyBillCount = (party: BillingParty) => {
    return invoices.filter(inv => inv.buyerName.toLowerCase() === party.name.toLowerCase() || (party.gstin && inv.buyerGstin === party.gstin)).length;
  };

  const handleCreate = () => {
    const needsGstin = !["quotation", "proforma", "delivery-challan"].includes(docType);
    if (!buyerName || (needsGstin && !buyerGstin) || !buyerState || items.some((i) => !i.description)) {
      toast.error("Fill all required fields"); return;
    }
    if (items.every(i => i.amount === 0)) { toast.error("Add at least one item with quantity and rate"); return; }

    const taxableAmount = items.reduce((s, i) => s + i.amount, 0);
    let totalCgst = 0, totalSgst = 0, totalIgst = 0;
    const needsTaxCalc = !["delivery-challan", "quotation"].includes(docType);
    if (needsTaxCalc) {
      items.forEach(item => {
        const rate = item.gstRate || gstRate;
        if (isInterstate) { totalIgst += Math.round(item.amount * rate / 100); }
        else { totalCgst += Math.round(item.amount * rate / 200); totalSgst += Math.round(item.amount * rate / 200); }
      });
    }
    const total = taxableAmount + totalCgst + totalSgst + totalIgst;
    const taxTotal = totalCgst + totalSgst + totalIgst;
    const primaryRate = items[0]?.gstRate || gstRate;
    const halfRate = primaryRate / 2;

    const consignee = sameAsBilling
      ? { consigneeName: buyerName, consigneeAddress: buyerAddress, consigneeGstin: buyerGstin, consigneeState: buyerState, consigneeStateCode: selectedBuyerState?.code || "" }
      : { consigneeName: shippingName, consigneeAddress: shippingAddress, consigneeGstin: shippingGstin, consigneeState: shippingState, consigneeStateCode: STATES.find(s => s.name === shippingState)?.code || "" };

    const invoice: GSTInvoice = {
      id: editingInvoiceId || Date.now().toString(), type: docType,
      invoiceNo: editingInvoiceId ? invoices.find(i => i.id === editingInvoiceId)?.invoiceNo || generateInvoiceNo(docType, invoices) : generateInvoiceNo(docType, invoices),
      date: editingInvoiceId ? invoices.find(i => i.id === editingInvoiceId)?.date || new Date().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: editingInvoiceId ? invoices.find(i => i.id === editingInvoiceId)?.status || "unpaid" : "unpaid",
      sellerName: user.businessName, sellerGstin: user.gstNumber, sellerAddress: `${user.locationDistrict}, Tamil Nadu`,
      sellerState: "Tamil Nadu", sellerStateCode: "33",
      ...consignee, buyerName, buyerGstin, buyerAddress, buyerState, buyerStateCode: selectedBuyerState?.code || "",
      placeOfSupply: placeOfSupply || buyerState, items,
      isIgst: isInterstate, taxableAmount,
      cgstRate: isInterstate ? 0 : halfRate, sgstRate: isInterstate ? 0 : halfRate, igstRate: isInterstate ? primaryRate : 0,
      cgstAmount: totalCgst, sgstAmount: totalSgst, igstAmount: totalIgst, totalAmount: total,
      amountInWords: numberToWords(total), taxAmountInWords: numberToWords(taxTotal),
      referenceInvoiceNo: refInvoice || undefined, transportMode: transportMode || undefined,
      vehicleNo: vehicleNo || undefined, vehicleType: vehicleType || undefined,
      transporterName: transporterName || undefined, transporterId: transporterId || undefined,
      lrNo: lrNo || undefined, lrDate: lrDate || undefined, eWayBillNo: eWayBillNo || undefined,
      eWayBillDate: eWayBillDate || undefined, notes: notes || undefined, paymentTerms: paymentTerms || undefined,
      declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
    };

    if (editingInvoiceId) {
      setInvoices(prev => prev.map(inv => inv.id === editingInvoiceId ? invoice : inv));
      toast.success("Invoice updated!");
    } else {
      setInvoices((prev) => [invoice, ...prev]);
      toast.success(`${docType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())} created!`);
      const isSaleType = SALE_TYPES.includes(docType);
      const isPurchaseType = PURCHASE_TYPES.includes(docType);
      const existingParty = billingParties.find(p => p.name.toLowerCase() === buyerName.toLowerCase() || (buyerGstin && p.gstin === buyerGstin));
      if (!existingParty) {
        const newParty: BillingParty = {
          id: "auto_" + Date.now().toString(), name: buyerName, gstin: buyerGstin, phone: "", address: buyerAddress,
          state: buyerState, stateCode: selectedBuyerState?.code || "",
          type: isSaleType ? "customer" : isPurchaseType ? "supplier" : "both",
          openingBalance: 0, balanceType: isSaleType ? "collect" : "pay", createdAt: new Date().toISOString().slice(0, 10),
        };
        setBillingParties(prev => [newParty, ...prev]);
      }
      if (docType === "sale-invoice" || docType === "delivery-challan") {
        items.forEach(invItem => {
          const catItem = billingItems.find(bi => bi.name.toLowerCase() === invItem.description.toLowerCase());
          if (catItem) setBillingItems(prev => prev.map(bi => bi.id === catItem.id ? { ...bi, stockQty: Math.max(0, bi.stockQty - invItem.qty) } : bi));
        });
      } else if (docType === "purchase-invoice") {
        items.forEach(invItem => {
          const catItem = billingItems.find(bi => bi.name.toLowerCase() === invItem.description.toLowerCase());
          if (catItem) setBillingItems(prev => prev.map(bi => bi.id === catItem.id ? { ...bi, stockQty: bi.stockQty + invItem.qty } : bi));
        });
      }
    }
    if (total > 50000 && !["quotation", "proforma"].includes(docType)) {
      toast.info("⚠️ E-Way Bill required for goods value > ₹50,000", { duration: 6000 });
    }
    setCreateOpen(false); setEditingInvoiceId(null); resetForm();
  };

  const resetForm = () => {
    setBuyerName(""); setBuyerGstin(""); setBuyerAddress(""); setBuyerState("");
    setShippingName(""); setShippingAddress(""); setShippingGstin(""); setShippingState("");
    setSameAsBilling(true); setGstRate(18); setRefInvoice(""); setVehicleNo(""); setVehicleType("");
    setTransportMode(""); setTransporterName(""); setTransporterId(""); setLrNo(""); setLrDate("");
    setEWayBillNo(""); setEWayBillDate(""); setNotes(""); setPaymentTerms(""); setPlaceOfSupply("");
    setItems([{ slNo: 1, description: "", hsnSac: "", qty: 0, unit: "KG", rate: 0, per: "KG", discount: 0, amount: 0, gstRate: 18 }]);
    setPartySearchQuery(""); setShowPartyDropdown(false);
  };

  const typeLabel = (type: GSTInvoice["type"]) => {
    const map: Record<string, string> = {
      "sale-invoice": "Tax Invoice", "purchase-invoice": "Purchase Invoice", "quotation": "Quotation",
      "delivery-challan": "Delivery Challan", "proforma": "Proforma Invoice", "purchase-order": "Purchase Order",
      "sale-order": "Sale Order", "job-work": "Job Work Invoice", "credit-note": "Credit Note", "debit-note": "Debit Note"
    };
    return map[type] || type;
  };

  const needsTax = !["delivery-challan", "quotation"].includes(docType);

  const handleExportInvoices = () => {
    const headers = ["Invoice No", "Date", "Type", "Buyer", "GSTIN", "Taxable", "CGST", "SGST", "IGST", "Total", "Status"];
    const rows = invoices.map(inv => [inv.invoiceNo, inv.date, typeLabel(inv.type), inv.buyerName, inv.buyerGstin, inv.taxableAmount, inv.cgstAmount, inv.sgstAmount, inv.igstAmount, inv.totalAmount, inv.status]);
    exportToCSV("invoices_export.csv", headers, rows);
    toast.success("Invoices exported!");
  };

  const getUpiQrUrl = (inv: GSTInvoice) => {
    const upiId = user.upiId || "business@upi";
    const name = encodeURIComponent(inv.sellerName);
    const amt = inv.totalAmount.toFixed(2);
    const note = encodeURIComponent(`Payment for ${inv.invoiceNo}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${name}&am=${amt}&cu=INR&tn=${note}`)}`;
  };

  const computeTaxSummary = (invItems: InvoiceItem[], interstate: boolean) => {
    const taxableAmount = invItems.reduce((s, i) => s + i.amount, 0);
    let totalCgst = 0, totalSgst = 0, totalIgst = 0;
    invItems.forEach(item => {
      const rate = item.gstRate || gstRate;
      if (interstate) totalIgst += Math.round(item.amount * rate / 100);
      else { totalCgst += Math.round(item.amount * rate / 200); totalSgst += Math.round(item.amount * rate / 200); }
    });
    return { taxableAmount, totalCgst, totalSgst, totalIgst, total: taxableAmount + totalCgst + totalSgst + totalIgst };
  };

  // Filter helpers
  const sq = searchQuery.toLowerCase();
  const filteredParties = useMemo(() => {
    let fp = billingParties.filter(p => {
      if (partySubTab === "customer") return p.type === "customer" || p.type === "both";
      return p.type === "supplier" || p.type === "both";
    });
    if (sq) fp = fp.filter(p => p.name.toLowerCase().includes(sq) || p.gstin.toLowerCase().includes(sq));
    return fp;
  }, [billingParties, partySubTab, sq]);

  const filteredBills = useMemo(() => {
    let fb = invoices;
    if (billSubTab === "sales") fb = fb.filter(i => i.type === "sale-invoice" || i.type === "proforma" || i.type === "sale-order" || i.type === "delivery-challan" || i.type === "credit-note");
    else if (billSubTab === "purchase") fb = fb.filter(i => i.type === "purchase-invoice" || i.type === "purchase-order" || i.type === "debit-note");
    else fb = fb.filter(i => i.type === "quotation");
    if (sq) fb = fb.filter(inv => inv.buyerName.toLowerCase().includes(sq) || inv.invoiceNo.toLowerCase().includes(sq));
    return fb.sort((a, b) => b.date.localeCompare(a.date));
  }, [invoices, billSubTab, sq]);

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatDateParts = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return { day, month, year };
  };

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background relative">
      {/* ═══════ HEADER ═══════ */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeTab === "send" && (
              <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold px-3 py-1 h-7 rounded">
                Send
              </Button>
            )}
            {activeTab === "party" && (
              <Button size="sm" variant="ghost" className="text-xs font-bold px-3 py-1 h-7" onClick={() => {
                const headers = ["Name", "GSTIN", "Phone", "Address", "State", "Type"];
                const rows = filteredParties.map(p => [p.name, p.gstin, p.phone, p.address, p.state, p.type]);
                exportToCSV("parties.csv", headers, rows);
                toast.success("Exported!");
              }}>
                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded">Pdf</span>
              </Button>
            )}
            <span className="text-base font-bold">
              {activeTab === "send" && "HiTex Billing"}
              {activeTab === "party" && `${partySubTab === "customer" ? "Customers" : "Suppliers"} (${filteredParties.length})`}
              {activeTab === "bills" && `${billSubTab === "sales" ? "Sales" : billSubTab === "purchase" ? "Purchase Entries" : "Quotations"} (${filteredBills.length})`}
              {activeTab === "products" && `Products (${billingItems.length})`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(activeTab === "products") && (
              <button className="p-1.5 rounded-full hover:bg-primary-foreground/10"><Share2 className="h-4 w-4" /></button>
            )}
            <button onClick={() => navigate("/billing/reports")} className="p-1.5 rounded-full hover:bg-primary-foreground/10">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="flex-1 overflow-y-auto pb-24">

        {/* ─── SEND / HOME TAB ─── */}
        {activeTab === "send" && (
          <div className="px-4 pt-4 space-y-4">
            {/* New Bill Card */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold">New Bill</h2>
                </div>
                <div className="border-b border-border mb-4" />

                <p className="text-sm text-muted-foreground mb-3">Bill Type</p>
                <div className="flex gap-6 mb-5">
                  {(["sales", "purchase", "quotation"] as const).map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${homeBillType === t ? "border-primary" : "border-muted-foreground/40"}`}>
                        {homeBillType === t && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className="text-sm font-medium capitalize">{t === "sales" ? "Sales" : t === "purchase" ? "Purchase" : "Quotation"}</span>
                    </label>
                  ))}
                </div>

                <Button
                  className="w-full h-14 text-lg font-bold bg-[hsl(25,95%,53%)] hover:bg-[hsl(25,95%,45%)] text-white rounded-lg"
                  onClick={() => {
                    const typeMap = { sales: "sale-invoice" as const, purchase: "purchase-invoice" as const, quotation: "quotation" as const };
                    openCreateForType(typeMap[homeBillType]);
                  }}
                >
                  Generate Bill
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/billing/payment-in")}>
                <CardContent className="p-3 flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-emerald" />
                  <span className="text-xs font-bold">Payment In</span>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/billing/payment-out")}>
                <CardContent className="p-3 flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-bold">Payment Out</span>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/billing/expenses")}>
                <CardContent className="p-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-gold" />
                  <span className="text-xs font-bold">Expenses</span>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/billing/reports")}>
                <CardContent className="p-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold">Reports</span>
                </CardContent>
              </Card>
            </div>

            {/* Logo / Stamp */}
            <Card className="cursor-pointer hover:shadow-md" onClick={() => {}}>
              <CardContent className="p-4 flex items-center gap-3">
                {user.companyLogo ? (
                  <img src={user.companyLogo} alt="Logo" className="h-10 w-10 rounded-lg object-contain border border-border" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold">Logo | Signature | Stamp</p>
                  <p className="text-xs text-muted-foreground">Colorful Bill</p>
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => { setUser((u: any) => ({ ...u, companyLogo: reader.result as string })); toast.success("Logo uploaded!"); };
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <span className="text-xs text-primary font-semibold">Upload</span>
                </label>
              </CardContent>
            </Card>

            {/* Monthly Report */}
            <Card className="bg-primary cursor-pointer hover:shadow-md" onClick={() => navigate("/billing/reports")}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary-foreground">Monthly Report</p>
                  <p className="text-xs text-primary-foreground/70">Sales | Purchase</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── PARTY TAB ─── */}
        {activeTab === "party" && (
          <div>
            {/* Search */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search Here"
                  className="border-0 shadow-none p-0 h-auto focus-visible:ring-0 text-sm"
                />
              </div>
            </div>

            {/* Party List */}
            <div className="divide-y divide-border">
              {filteredParties.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No parties found</div>
              ) : (
                filteredParties.map(party => {
                  const billCount = getPartyBillCount(party);
                  return (
                    <div key={party.id} className="px-4 py-4 flex items-center gap-3">
                      {/* Avatar with bill count */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-12 w-12 rounded-full border-2 border-border flex items-center justify-center text-base font-bold text-muted-foreground">
                          {getInitials(party.name)}
                        </div>
                        <Badge className="bg-purple-600 text-white text-[9px] px-1.5 py-0 leading-4 hover:bg-purple-600">
                          {billCount} Bills
                        </Badge>
                      </div>

                      {/* Party Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold truncate">{party.name}</p>
                        {party.gstin && <p className="text-xs text-muted-foreground truncate">{party.gstin},{party.state}</p>}
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            className="h-7 text-[11px] font-bold bg-[hsl(25,95%,53%)] hover:bg-[hsl(25,95%,45%)] text-white rounded px-3"
                            onClick={() => navigate(`/billing/party/${party.id}`)}
                          >
                            Statement
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-[11px] font-bold bg-[hsl(220,70%,55%)] hover:bg-[hsl(220,70%,45%)] text-white rounded px-3"
                            onClick={() => navigate(`/billing/party/${party.id}`)}
                          >
                            Ledger
                          </Button>
                        </div>
                      </div>

                      {/* Phone + Actions */}
                      <div className="flex flex-col items-center gap-2">
                        {party.phone && (
                          <button onClick={() => window.open(`tel:${party.phone.replace(/[^0-9+]/g, "")}`)}>
                            <Phone className="h-6 w-6 text-primary/50" />
                          </button>
                        )}
                        <button onClick={() => deleteParty(party.id)} className="p-1 hover:bg-secondary rounded">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Customers / Suppliers Toggle - Bottom */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20 max-w-lg w-[calc(100%-2rem)]">
              <div className="bg-background border border-border rounded-full flex overflow-hidden shadow-lg">
                <button
                  onClick={() => setPartySubTab("customer")}
                  className={`flex-1 py-2.5 text-sm font-bold text-center transition-colors ${partySubTab === "customer" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Customers
                </button>
                <button
                  onClick={() => setPartySubTab("supplier")}
                  className={`flex-1 py-2.5 text-sm font-bold text-center transition-colors ${partySubTab === "supplier" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Suppliers
                </button>
              </div>
            </div>

            {/* FAB */}
            <button
              onClick={() => navigate("/billing/create-party")}
              className="fixed bottom-32 right-4 z-20 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow max-w-lg"
              style={{ right: "max(1rem, calc((100vw - 32rem) / 2 + 1rem))" }}
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>
        )}

        {/* ─── BILLS TAB ─── */}
        {activeTab === "bills" && (
          <div>
            {/* Search + Client filter */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Here"
                className="border-0 shadow-none p-0 h-auto focus-visible:ring-0 text-sm flex-1"
              />
              <div className="h-9 w-9 rounded-full bg-[hsl(25,95%,53%)] flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Bill Cards */}
            <div className="space-y-3 p-4">
              {filteredBills.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No bills yet</div>
              ) : (
                filteredBills.map(inv => {
                  const dp = formatDateParts(inv.date);
                  const invNoShort = inv.invoiceNo.split("/").pop() || inv.invoiceNo;
                  const typeShort = inv.type === "sale-invoice" ? "Sales" : inv.type === "purchase-invoice" ? "Purchase" : inv.type === "quotation" ? "Quotation" : typeLabel(inv.type);
                  return (
                    <Card key={inv.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setPreviewInvoice(inv)}>
                      <CardContent className="p-0">
                        <div className="flex items-center gap-3 p-3">
                          {/* Date Circle */}
                          <div className="flex flex-col items-center shrink-0">
                            <div className="h-11 w-11 rounded-full bg-emerald text-white flex items-center justify-center text-base font-bold">
                              {dp.day}
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-0.5">{dp.month}-{dp.year}</span>
                          </div>

                          {/* Bill Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold">#{typeShort}{invNoShort}</p>
                              <p className="text-sm font-bold text-primary">
                                {inv.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} ₹
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">{inv.buyerName}</p>

                            {/* Action Icons */}
                            <div className="flex items-center gap-2 mt-2">
                              <button onClick={e => { e.stopPropagation(); setPreviewInvoice(inv); }} className="h-8 w-8 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary/5">
                                <Info className="h-4 w-4 text-primary" />
                              </button>
                              <button onClick={e => {
                                e.stopPropagation();
                                const msg = encodeURIComponent(`📄 *${typeLabel(inv.type)}*\nInvoice: ${inv.invoiceNo}\nAmount: ₹${inv.totalAmount.toLocaleString("en-IN")}\nFrom: ${inv.sellerName}`);
                                window.open(`https://wa.me/?text=${msg}`, "_blank");
                              }} className="h-8 w-8 rounded-full border border-emerald/30 flex items-center justify-center hover:bg-emerald/5">
                                <Share2 className="h-4 w-4 text-emerald" />
                              </button>
                              <button onClick={e => { e.stopPropagation(); editInvoice(inv); }} className="h-8 w-8 rounded-full border border-emerald/30 flex items-center justify-center hover:bg-emerald/5">
                                <Pencil className="h-4 w-4 text-emerald" />
                              </button>
                              <button onClick={e => { e.stopPropagation(); deleteInvoice(inv.id); }} className="h-8 w-8 rounded-full border border-muted-foreground/30 flex items-center justify-center hover:bg-secondary">
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>

                            {/* Ledger Entry */}
                            {inv.status === "paid" ? (
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-primary text-primary-foreground text-[10px] px-2">Ledger Entry ✓</Badge>
                                <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">L</div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-2">
                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={e => { e.stopPropagation(); changeStatus(inv.id, "paid"); }}>
                                  Ledger Entry
                                </Button>
                                <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">L</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Sales/Purchase/Quotation Toggle */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20 max-w-lg w-[calc(100%-2rem)]">
              <div className="bg-background border border-border rounded-full flex overflow-hidden shadow-lg">
                {(["sales", "purchase", "quotation"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setBillSubTab(t)}
                    className={`flex-1 py-2.5 text-sm font-bold text-center transition-colors ${billSubTab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {t === "sales" ? "Sales" : t === "purchase" ? "Purchase" : "Quotation"}
                  </button>
                ))}
              </div>
            </div>

            {/* FAB */}
            <button
              onClick={() => {
                const typeMap = { sales: "sale-invoice" as const, purchase: "purchase-invoice" as const, quotation: "quotation" as const };
                openCreateForType(typeMap[billSubTab]);
              }}
              className="fixed bottom-32 right-4 z-20 h-14 w-14 rounded-full bg-emerald text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
              style={{ right: "max(1rem, calc((100vw - 32rem) / 2 + 1rem))" }}
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>
        )}

        {/* ─── PRODUCTS TAB ─── */}
        {activeTab === "products" && (
          <div className="p-4 space-y-4">
            {billingItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No products yet</div>
            ) : (
              billingItems.map(item => {
                // Calculate sales/purchase stock from invoices
                const salesQty = invoices
                  .filter(inv => SALE_TYPES.includes(inv.type))
                  .reduce((s, inv) => s + inv.items.filter(i => i.description.toLowerCase() === item.name.toLowerCase()).reduce((ss, i) => ss + i.qty, 0), 0);
                const purchaseQty = invoices
                  .filter(inv => PURCHASE_TYPES.includes(inv.type))
                  .reduce((s, inv) => s + inv.items.filter(i => i.description.toLowerCase() === item.name.toLowerCase()).reduce((ss, i) => ss + i.qty, 0), 0);

                return (
                  <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-4 flex gap-4">
                      {/* Product Icon */}
                      <div className="h-14 w-14 rounded-lg bg-[hsl(25,95%,53%)]/10 flex items-center justify-center shrink-0">
                        <Package className="h-7 w-7 text-[hsl(25,95%,53%)]" />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold uppercase leading-tight">{item.name}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Sell Price:</span>
                            <span className="text-sm font-bold text-primary">₹ {item.salesPrice.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Purchase Price:</span>
                            <span className="text-sm font-bold text-primary">₹ {item.purchasePrice.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Stock</span>
                            <span className="text-sm font-bold text-primary">{salesQty} / {purchaseQty}</span>
                            <span className="text-[10px] text-muted-foreground">( sales / purchase )</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete */}
                      <button onClick={() => deleteItem(item.id)} className="self-start p-1 hover:bg-secondary rounded">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </CardContent>
                  </Card>
                );
              })
            )}

            {/* FAB */}
            <button
              onClick={() => navigate("/billing/create-item")}
              className="fixed bottom-24 right-4 z-20 h-14 w-14 rounded-full bg-[hsl(80,60%,50%)] text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
              style={{ right: "max(1rem, calc((100vw - 32rem) / 2 + 1rem))" }}
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>
        )}
      </main>

      {/* ═══════ BOTTOM NAV ═══════ */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-lg w-full bg-background border-t border-border z-30">
        <div className="flex items-center justify-around py-1.5">
          {[
            { key: "send", label: "Send", icon: Send, color: "text-pink-500" },
            { key: "party", label: "Party", icon: Users, color: "text-primary" },
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearchQuery(""); }}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 ${activeTab === key ? color : "text-muted-foreground"}`}
            >
              <div className={`p-1.5 rounded-lg ${activeTab === key ? "bg-primary/10" : ""}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-medium ${activeTab === key ? "font-bold" : ""}`}>{label}</span>
            </button>
          ))}

          {/* Center Logo */}
          <button onClick={() => navigate("/")} className="flex flex-col items-center gap-0.5 py-1 px-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center -mt-4 shadow-lg border-4 border-background">
              <span className="text-xs font-bold text-primary-foreground">Hi</span>
            </div>
          </button>

          {[
            { key: "bills", label: "Bills", icon: FileText, color: "text-primary" },
            { key: "products", label: "Products", icon: Package, color: "text-emerald" },
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearchQuery(""); }}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 ${activeTab === key ? color : "text-muted-foreground"}`}
            >
              <div className={`p-1.5 rounded-lg ${activeTab === key ? "bg-primary/10" : ""}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-medium ${activeTab === key ? "font-bold" : ""}`}>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ═══════ CREATE INVOICE DIALOG ═══════ */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-[440px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{editingInvoiceId ? "Edit" : "Create"} {typeLabel(docType)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Doc Type */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(["sale-invoice", "purchase-invoice", "quotation", "delivery-challan", "proforma", "credit-note", "debit-note"] as const).map(t => (
                <button key={t} onClick={() => setDocType(t)}
                  className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${docType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {typeLabel(t)}
                </button>
              ))}
            </div>

            {/* Party */}
            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bill To (Party)</p>
              <div className="relative">
                <Input value={buyerName} onChange={e => { setBuyerName(e.target.value); setShowPartyDropdown(true); }} placeholder="Party Name *"
                  onFocus={() => setShowPartyDropdown(true)} />
                {showPartyDropdown && filteredPartyList.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 bg-background border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredPartyList.map(p => (
                      <button key={p.id} onClick={() => selectParty(p)} className="w-full text-left px-3 py-2 hover:bg-secondary flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold text-muted-foreground">{getInitials(p.name)}</div>
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          {p.phone && <p className="text-[10px] text-muted-foreground">{p.phone}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Input value={buyerGstin} onChange={e => setBuyerGstin(e.target.value.toUpperCase())} placeholder="GSTIN/UIN *" maxLength={15} />
              <Input value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} placeholder="Full address" />
              <Select value={buyerState} onValueChange={setBuyerState}>
                <SelectTrigger><SelectValue placeholder="Select state *" /></SelectTrigger>
                <SelectContent>{STATES.map(s => <SelectItem key={s.code} value={s.name}>{s.name} ({s.code})</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Consignee */}
            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ship to</p>
                <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={sameAsBilling} onChange={e => setSameAsBilling(e.target.checked)} className="rounded" />
                  Same as billing
                </label>
              </div>
              {!sameAsBilling && (
                <>
                  <Input value={shippingName} onChange={e => setShippingName(e.target.value)} placeholder="Name" />
                  <Input value={shippingGstin} onChange={e => setShippingGstin(e.target.value.toUpperCase())} maxLength={15} placeholder="GSTIN" />
                  <Input value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} placeholder="Address" />
                  <Select value={shippingState} onValueChange={setShippingState}>
                    <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent>{STATES.map(s => <SelectItem key={s.code} value={s.name}>{s.name} ({s.code})</SelectItem>)}</SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Place of Supply */}
            <div>
              <Label className="text-xs">Place of Supply</Label>
              <Select value={placeOfSupply} onValueChange={setPlaceOfSupply}>
                <SelectTrigger><SelectValue placeholder="Auto-detect from buyer state" /></SelectTrigger>
                <SelectContent>{STATES.map(s => <SelectItem key={s.code} value={s.name}>{s.name} ({s.code})</SelectItem>)}</SelectContent>
              </Select>
              {isInterstate && <p className="text-[10px] text-gold mt-1">⚠️ Interstate — IGST will apply</p>}
            </div>

            {/* Items */}
            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Items</p>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={addItem}><Plus className="h-3 w-3" /> Add</Button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="space-y-2 pb-2 border-b last:border-0">
                  <div className="flex gap-2">
                    <div className="w-6 flex items-end pb-2"><span className="text-[10px] text-muted-foreground font-mono">{item.slNo}</span></div>
                    <div className="flex-1">
                      <Label className="text-[10px]">Description *</Label>
                      {billingItems.length > 0 && !item.description && (
                        <Select onValueChange={v => selectCatalogItem(idx, v)}>
                          <SelectTrigger className="h-8 text-xs mb-1"><SelectValue placeholder="Select from catalog..." /></SelectTrigger>
                          <SelectContent>{billingItems.map(bi => <SelectItem key={bi.id} value={bi.id}>{bi.name} (₹{SALE_TYPES.includes(docType) ? bi.salesPrice : bi.purchasePrice}/{bi.unit})</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                      <Input className="h-8 text-xs" value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Item name" />
                    </div>
                    <div className="w-20">
                      <Label className="text-[10px]">HSN</Label>
                      <Input className="h-8 text-xs" value={item.hsnSac} onChange={e => updateItem(idx, "hsnSac", e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2 items-end flex-wrap">
                    <div className="w-14"><Label className="text-[10px]">Qty</Label><Input className="h-8 text-xs" type="number" value={item.qty || ""} onChange={e => updateItem(idx, "qty", Number(e.target.value))} /></div>
                    <div className="w-16"><Label className="text-[10px]">Unit</Label>
                      <Select value={item.unit} onValueChange={v => { updateItem(idx, "unit", v); updateItem(idx, "per", v); }}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="w-16"><Label className="text-[10px]">Rate</Label><Input className="h-8 text-xs" type="number" value={item.rate || ""} onChange={e => updateItem(idx, "rate", Number(e.target.value))} /></div>
                    <div className="w-14"><Label className="text-[10px]">Disc%</Label><Input className="h-8 text-xs" type="number" value={item.discount || ""} onChange={e => updateItem(idx, "discount", Number(e.target.value))} /></div>
                    {needsTax && (
                      <div className="w-16"><Label className="text-[10px]">GST%</Label>
                        <Select value={String(item.gstRate)} onValueChange={v => updateItem(idx, "gstRate", Number(v))}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{GST_RATES.map(r => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="w-20"><Label className="text-[10px]">Amount</Label><Input className="h-8 text-xs" value={`₹${item.amount.toLocaleString("en-IN")}`} disabled /></div>
                    {items.length > 1 && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => removeItem(idx)}><Trash2 className="h-3 w-3" /></Button>}
                  </div>
                </div>
              ))}
            </div>

            {/* Transport */}
            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Transport</p>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[10px]">Mode</Label><Select value={transportMode} onValueChange={setTransportMode}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Road", "Rail", "Air", "Ship"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-[10px]">Vehicle No</Label><Input className="h-8 text-xs" value={vehicleNo} onChange={e => setVehicleNo(e.target.value.toUpperCase())} /></div>
                <div><Label className="text-[10px]">Transporter</Label><Input className="h-8 text-xs" value={transporterName} onChange={e => setTransporterName(e.target.value)} /></div>
                <div><Label className="text-[10px]">LR No</Label><Input className="h-8 text-xs" value={lrNo} onChange={e => setLrNo(e.target.value)} /></div>
                <div><Label className="text-[10px]">E-Way Bill</Label><Input className="h-8 text-xs" value={eWayBillNo} onChange={e => setEWayBillNo(e.target.value)} /></div>
              </div>
            </div>

            <Input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="Payment Terms" />
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes..." className="h-16 text-xs" />

            {/* Tax Summary */}
            {needsTax && (() => {
              const ts = computeTaxSummary(items, isInterstate);
              return (
                <div className="bg-secondary rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex justify-between"><span>Taxable</span><span>₹{ts.taxableAmount.toLocaleString("en-IN")}</span></div>
                  {isInterstate ? (
                    <div className="flex justify-between text-muted-foreground"><span>IGST</span><span>₹{ts.totalIgst.toLocaleString("en-IN")}</span></div>
                  ) : (
                    <>
                      <div className="flex justify-between text-muted-foreground"><span>CGST</span><span>₹{ts.totalCgst.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between text-muted-foreground"><span>SGST</span><span>₹{ts.totalSgst.toLocaleString("en-IN")}</span></div>
                    </>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-border pt-1 mt-1"><span>Total</span><span>₹{ts.total.toLocaleString("en-IN")}</span></div>
                </div>
              );
            })()}

            <Button onClick={handleCreate} className="w-full h-12 text-base font-bold bg-primary">
              {editingInvoiceId ? "Update" : "Create"} {typeLabel(docType)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════ INVOICE PREVIEW ═══════ */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-[440px] max-h-[95vh] overflow-y-auto p-0">
          {previewInvoice && (
            <div className="bg-background">
              <div className="px-3 pt-3 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`${statusConfig[previewInvoice.status].color} text-[10px]`}>{statusConfig[previewInvoice.status].label}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1">Status ▾</Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(["unpaid", "partial", "paid"] as const).map(s => (
                        <DropdownMenuItem key={s} onClick={() => changeStatus(previewInvoice.id, s)} className={previewInvoice.status === s ? "font-bold" : ""}>{statusConfig[s].label}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button onClick={() => editInvoice(previewInvoice)} className="p-1 hover:bg-secondary rounded"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => deleteInvoice(previewInvoice.id)} className="p-1 hover:bg-secondary rounded"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                </div>
              </div>

              {/* Tally-style invoice */}
              <div className="border-2 border-foreground/80 m-3 text-[10px] leading-tight">
                <div className="text-center border-b border-foreground/80 py-2">
                  <p className="text-sm font-bold tracking-wide">{typeLabel(previewInvoice.type).toUpperCase()}</p>
                </div>
                {previewInvoice.irn && (
                  <div className="border-b border-foreground/80 px-2 py-1.5 space-y-0.5">
                    <p><span className="font-semibold">IRN</span>: {previewInvoice.irn}</p>
                    {previewInvoice.ackNo && <p><span className="font-semibold">Ack No.</span>: {previewInvoice.ackNo}</p>}
                  </div>
                )}
                <div className="border-b border-foreground/80 grid grid-cols-12">
                  <div className="col-span-7 border-r border-foreground/80 p-2">
                    <p className="font-bold text-xs">{previewInvoice.sellerName}</p>
                    <p>{previewInvoice.sellerAddress}</p>
                    <p>GSTIN: {previewInvoice.sellerGstin}</p>
                    <p>State: {previewInvoice.sellerState}, Code: {previewInvoice.sellerStateCode}</p>
                  </div>
                  <div className="col-span-5 p-1">
                    <p className="font-semibold">Invoice: {previewInvoice.invoiceNo}</p>
                    <p>Date: {previewInvoice.date}</p>
                  </div>
                </div>
                <div className="border-b border-foreground/80 p-2">
                  <p className="text-[9px] text-muted-foreground">Buyer</p>
                  <p className="font-bold">{previewInvoice.buyerName}</p>
                  <p>{previewInvoice.buyerAddress}</p>
                  <p>GSTIN: {previewInvoice.buyerGstin}</p>
                  <p>State: {previewInvoice.buyerState}, Code: {previewInvoice.buyerStateCode}</p>
                </div>
                {/* Items */}
                <div className="border-b border-foreground/80">
                  <div className="grid grid-cols-12 text-[9px] font-bold border-b border-foreground/80 bg-secondary/30">
                    <div className="col-span-1 p-1 border-r border-foreground/30 text-center">Sl</div>
                    <div className="col-span-4 p-1 border-r border-foreground/30">Description</div>
                    <div className="col-span-1 p-1 border-r border-foreground/30">HSN</div>
                    <div className="col-span-2 p-1 border-r border-foreground/30 text-right">Qty</div>
                    <div className="col-span-2 p-1 border-r border-foreground/30 text-right">Rate</div>
                    <div className="col-span-2 p-1 text-right">Amount</div>
                  </div>
                  {previewInvoice.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 text-[10px] border-b border-foreground/20">
                      <div className="col-span-1 p-1 border-r border-foreground/30 text-center">{item.slNo}</div>
                      <div className="col-span-4 p-1 border-r border-foreground/30 font-semibold">{item.description}</div>
                      <div className="col-span-1 p-1 border-r border-foreground/30">{item.hsnSac}</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-right">{item.qty} {item.unit}</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-right">{item.rate.toFixed(2)}</div>
                      <div className="col-span-2 p-1 text-right font-medium">{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                    </div>
                  ))}
                  {previewInvoice.type !== "delivery-challan" && (
                    previewInvoice.isIgst ? (
                      <div className="grid grid-cols-12 text-[10px]">
                        <div className="col-span-8 p-1 border-r border-foreground/30 text-right font-bold">IGST @ {previewInvoice.igstRate}%</div>
                        <div className="col-span-4 p-1 text-right">{previewInvoice.igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-12 text-[10px]">
                          <div className="col-span-8 p-1 border-r border-foreground/30 text-right font-bold">CGST @ {previewInvoice.cgstRate}%</div>
                          <div className="col-span-4 p-1 text-right">{previewInvoice.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="grid grid-cols-12 text-[10px]">
                          <div className="col-span-8 p-1 border-r border-foreground/30 text-right font-bold">SGST @ {previewInvoice.sgstRate}%</div>
                          <div className="col-span-4 p-1 text-right">{previewInvoice.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                        </div>
                      </>
                    )
                  )}
                  <div className="grid grid-cols-12 text-[10px] border-t border-foreground/80 font-bold">
                    <div className="col-span-8 p-1 border-r border-foreground/30 text-right">Total</div>
                    <div className="col-span-4 p-1 text-right text-xs">₹ {previewInvoice.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="border-b border-foreground/80 px-2 py-1.5">
                  <p className="text-[9px] text-muted-foreground">Amount in words</p>
                  <p className="font-bold text-[11px]">{previewInvoice.amountInWords}</p>
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-2 border-r border-foreground/80">
                    <p className="text-[9px] font-semibold underline">Declaration</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{previewInvoice.declaration}</p>
                  </div>
                  <div className="p-2 text-right">
                    <p className="text-[9px] font-semibold">for {previewInvoice.sellerName}</p>
                    <div className="h-10" />
                    <p className="text-[9px] font-semibold">Authorised Signatory</p>
                  </div>
                </div>
                <div className="border-t border-foreground/80 text-center py-1">
                  <p className="text-[8px] text-muted-foreground">Computer Generated Invoice</p>
                </div>
              </div>

              {/* UPI QR */}
              <div className="px-3 pb-2">
                <div className="border rounded-lg p-3 flex items-center gap-3">
                  <img src={getUpiQrUrl(previewInvoice)} alt="UPI QR" className="h-24 w-24 rounded" />
                  <div>
                    <p className="text-xs font-bold flex items-center gap-1"><QrCode className="h-3.5 w-3.5" /> Scan to Pay</p>
                    <p className="text-[10px] text-muted-foreground">₹{previewInvoice.totalAmount.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-3 pb-3 space-y-2">
                <Button variant="outline" className="w-full gap-1 text-xs" onClick={() => { generateInvoicePdf(previewInvoice!, user.companyLogo); toast.success("PDF downloaded!"); }}>
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </Button>
                <Button variant="outline" className="w-full gap-1 text-xs text-emerald border-emerald/30" onClick={() => {
                  const msg = encodeURIComponent(`📄 *${typeLabel(previewInvoice!.type)}*\nInvoice: ${previewInvoice!.invoiceNo}\nAmount: ₹${previewInvoice!.totalAmount.toLocaleString("en-IN")}\nFrom: ${previewInvoice!.sellerName}`);
                  window.open(`https://wa.me/?text=${msg}`, "_blank");
                }}>
                  <MessageCircle className="h-3.5 w-3.5" /> Share via WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
