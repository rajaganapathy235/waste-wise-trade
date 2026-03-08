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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, ArrowDownLeft, ArrowUpRight, Plus, FileText, Truck, RotateCcw, Download, Trash2,
  Receipt, ShoppingCart, FileCheck, ClipboardList, Briefcase,
  FileMinus, FilePlus, IndianRupee, CreditCard, Calendar,
  Home, Users, Package, ArrowRightLeft, BarChart3, Wallet, Search,
  MessageCircle, Upload, Bell, Repeat, Share2, Image, Globe, User,
  Pencil, QrCode, AlertTriangle, FileDown, CheckCircle2, Clock, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { generateInvoicePdf } from "@/lib/invoicePdf";
import { exportToCSV } from "@/lib/csvExport";
import { formatDisplayDate } from "@/components/DateRangeFilter";

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
  // Find max existing number for this prefix
  const existing = existingInvoices
    .filter(i => i.invoiceNo.startsWith(prefix + "/"))
    .map(i => {
      const parts = i.invoiceNo.split("/");
      return parseInt(parts[parts.length - 1]) || 0;
    });
  const next = (existing.length > 0 ? Math.max(...existing) : 0) + 1;
  return `${prefix}/${yearStr}/${String(next).padStart(4, "0")}`;
}

const statusConfig = {
  unpaid: { label: "Unpaid", color: "bg-destructive/10 text-destructive", icon: XCircle },
  partial: { label: "Partial", color: "bg-gold/10 text-gold", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald/10 text-emerald", icon: CheckCircle2 },
};

// ─── Quick Links Config ──────────────────────────────────
const QUICK_LINKS: { key: string; label: string; icon: any; type: GSTInvoice["type"]; color: string; action?: string }[] = [
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
  { key: "inward", label: "Payment In", icon: IndianRupee, type: "sale-invoice", color: "text-emerald", action: "payment-in" },
  { key: "outward", label: "Payment Out", icon: CreditCard, type: "purchase-invoice", color: "text-destructive", action: "payment-out" },
];

// ─── Component ──────────────────────────────────────────
export default function Billing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useApp();
  const { parties: billingParties, setParties: setBillingParties, items: billingItems, setItems: setBillingItems, payments: billingPayments, setPayments, expenses: billingExpenses, invoices, setInvoices } = useBilling();
  const i18n = useI18n();
  const { t, lang, setLang, languages } = i18n;

  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const state = location.state as { tab?: string } | null;
    if (state?.tab) {
      setActiveTab(state.tab);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [createOpen, setCreateOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<GSTInvoice | null>(null);
  const [docType, setDocType] = useState<GSTInvoice["type"]>("sale-invoice");
  const [partyFilter, setPartyFilter] = useState<"all" | "collect" | "pay">("all");
  const [itemFilter, setItemFilter] = useState<"all" | "lowstock">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [partySearchQuery, setPartySearchQuery] = useState("");
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState("");

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

  // Select existing item from catalog
  const selectCatalogItem = (index: number, catalogItemId: string) => {
    const catItem = billingItems.find(i => i.id === catalogItemId);
    if (!catItem) return;
    const isSale = SALE_TYPES.includes(docType);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      description: catItem.name,
      hsnSac: catItem.hsnSac,
      unit: catItem.unit,
      per: catItem.unit,
      rate: isSale ? catItem.salesPrice : catItem.purchasePrice,
      gstRate: catItem.gstRate,
      qty: updated[index].qty || 1,
      amount: (updated[index].qty || 1) * (isSale ? catItem.salesPrice : catItem.purchasePrice),
    };
    setItems(updated);
  };

  // Select existing party
  const selectParty = (party: BillingParty) => {
    setBuyerName(party.name);
    setBuyerGstin(party.gstin);
    setBuyerAddress(party.address);
    setBuyerState(party.state);
    setShowPartyDropdown(false);
    setPartySearchQuery("");
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
    setDocType(type);
    setEditingInvoiceId(null);
    resetForm();
    setCreateOpen(true);
  };

  // ─── Edit Invoice ──────────────────────────────────
  const editInvoice = (inv: GSTInvoice) => {
    setEditingInvoiceId(inv.id);
    setDocType(inv.type);
    setBuyerName(inv.buyerName);
    setBuyerGstin(inv.buyerGstin);
    setBuyerAddress(inv.buyerAddress);
    setBuyerState(inv.buyerState);
    setPlaceOfSupply(inv.placeOfSupply);
    setRefInvoice(inv.referenceInvoiceNo || "");
    setVehicleNo(inv.vehicleNo || "");
    setVehicleType(inv.vehicleType || "");
    setTransportMode(inv.transportMode || "");
    setTransporterName(inv.transporterName || "");
    setTransporterId(inv.transporterId || "");
    setLrNo(inv.lrNo || "");
    setLrDate(inv.lrDate || "");
    setEWayBillNo(inv.eWayBillNo || "");
    setEWayBillDate(inv.eWayBillDate || "");
    setNotes(inv.notes || "");
    setPaymentTerms(inv.paymentTerms || "");
    setGstRate(inv.isIgst ? inv.igstRate : inv.cgstRate * 2);
    setItems(inv.items.map(i => ({ ...i })));
    if (inv.consigneeName !== inv.buyerName) {
      setSameAsBilling(false);
      setShippingName(inv.consigneeName);
      setShippingAddress(inv.consigneeAddress);
      setShippingGstin(inv.consigneeGstin);
      setShippingState(inv.consigneeState);
    } else {
      setSameAsBilling(true);
    }
    setPreviewInvoice(null);
    setCreateOpen(true);
  };

  // ─── Delete Invoice ──────────────────────────────────
  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    setPreviewInvoice(null);
    toast.success("Invoice deleted");
  };

  // ─── Delete Party ──────────────────────────────────
  const deleteParty = (id: string) => {
    setBillingParties(prev => prev.filter(p => p.id !== id));
    toast.success("Party deleted");
  };

  // ─── Delete Item ──────────────────────────────────
  const deleteItem = (id: string) => {
    setBillingItems(prev => prev.filter(i => i.id !== id));
    toast.success("Item deleted");
  };

  // ─── Change Invoice Status ──────────────────────────
  const changeStatus = (id: string, status: GSTInvoice["status"]) => {
    const inv = invoices.find(i => i.id === id);
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (previewInvoice?.id === id) setPreviewInvoice(prev => prev ? { ...prev, status } : null);

    if (status === "paid" && inv) {
      const isSaleType = SALE_TYPES.includes(inv.type);
      const existingParty = billingParties.find(
        p => p.name.toLowerCase() === inv.buyerName.toLowerCase() || (inv.buyerGstin && p.gstin === inv.buyerGstin)
      );

      const payment: import("@/lib/billingContext").Payment = {
        id: "autopay_" + Date.now().toString(),
        type: isSaleType ? "in" : "out",
        partyId: existingParty?.id || "",
        partyName: inv.buyerName,
        amount: inv.totalAmount,
        paymentMode: "bank",
        date: new Date().toISOString().slice(0, 10),
        note: `Payment for ${inv.invoiceNo}`,
        invoiceRef: inv.invoiceNo,
      };
      setPayments(prev => [payment, ...prev]);
    }
    toast.success(`Status changed to ${statusConfig[status].label}`);
  };

  // ─── Compute party outstanding dynamically ──────────
  const getPartyOutstanding = (party: BillingParty) => {
    // Sum of unpaid/partial invoices for this party
    const partyInvoices = invoices.filter(inv => {
      const match = inv.buyerName.toLowerCase() === party.name.toLowerCase() || 
        (party.gstin && inv.buyerGstin === party.gstin);
      return match && inv.status !== "paid";
    });
    
    const saleTotal = partyInvoices
      .filter(i => SALE_TYPES.includes(i.type))
      .reduce((s, i) => s + i.totalAmount, 0);
    const purchaseTotal = partyInvoices
      .filter(i => PURCHASE_TYPES.includes(i.type))
      .reduce((s, i) => s + i.totalAmount, 0);
    
    const paymentsIn = billingPayments
      .filter(p => p.partyId === party.id && p.type === "in")
      .reduce((s, p) => s + p.amount, 0);
    const paymentsOut = billingPayments
      .filter(p => p.partyId === party.id && p.type === "out")
      .reduce((s, p) => s + p.amount, 0);

    const toCollect = Math.max(0, party.openingBalance * (party.balanceType === "collect" ? 1 : 0) + saleTotal - paymentsIn);
    const toPay = Math.max(0, party.openingBalance * (party.balanceType === "pay" ? 1 : 0) + purchaseTotal - paymentsOut);
    
    return { toCollect, toPay, net: toCollect - toPay };
  };

  const handleCreate = () => {
    const needsGstin = !["quotation", "proforma", "delivery-challan"].includes(docType);
    if (!buyerName || (needsGstin && !buyerGstin) || !buyerState || items.some((i) => !i.description)) {
      toast.error("Please fill all required fields (Party Name, State, Item Description" + (needsGstin ? ", GSTIN" : "") + ")");
      return;
    }
    if (items.every(i => i.amount === 0)) {
      toast.error("Please add at least one item with quantity and rate");
      return;
    }

    const taxableAmount = items.reduce((s, i) => s + i.amount, 0);
    let totalCgst = 0, totalSgst = 0, totalIgst = 0;
    const needsTaxCalc = !["delivery-challan", "quotation"].includes(docType);
    if (needsTaxCalc) {
      items.forEach(item => {
        const rate = item.gstRate || gstRate;
        if (isInterstate) {
          totalIgst += Math.round(item.amount * rate / 100);
        } else {
          totalCgst += Math.round(item.amount * rate / 200);
          totalSgst += Math.round(item.amount * rate / 200);
        }
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
      id: editingInvoiceId || Date.now().toString(),
      type: docType,
      invoiceNo: editingInvoiceId ? invoices.find(i => i.id === editingInvoiceId)?.invoiceNo || generateInvoiceNo(docType, invoices) : generateInvoiceNo(docType, invoices),
      date: editingInvoiceId ? invoices.find(i => i.id === editingInvoiceId)?.date || new Date().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: editingInvoiceId ? invoices.find(i => i.id === editingInvoiceId)?.status || "unpaid" : "unpaid",
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
      igstRate: isInterstate ? primaryRate : 0,
      cgstAmount: totalCgst,
      sgstAmount: totalSgst,
      igstAmount: totalIgst,
      totalAmount: total,
      amountInWords: numberToWords(total),
      taxAmountInWords: numberToWords(taxTotal),
      referenceInvoiceNo: refInvoice || undefined,
      transportMode: transportMode || undefined,
      vehicleNo: vehicleNo || undefined,
      vehicleType: vehicleType || undefined,
      transporterName: transporterName || undefined,
      transporterId: transporterId || undefined,
      lrNo: lrNo || undefined,
      lrDate: lrDate || undefined,
      eWayBillNo: eWayBillNo || undefined,
      eWayBillDate: eWayBillDate || undefined,
      notes: notes || undefined,
      paymentTerms: paymentTerms || undefined,
      declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
    };

    if (editingInvoiceId) {
      setInvoices(prev => prev.map(inv => inv.id === editingInvoiceId ? invoice : inv));
      toast.success("Invoice updated!");
    } else {
      setInvoices((prev) => [invoice, ...prev]);
      toast.success(`${docType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())} created!`);

      // Auto-create party if not exists
      const isSaleType = SALE_TYPES.includes(docType);
      const isPurchaseType = PURCHASE_TYPES.includes(docType);
      const existingParty = billingParties.find(
        p => p.name.toLowerCase() === buyerName.toLowerCase() || (buyerGstin && p.gstin === buyerGstin)
      );

      if (!existingParty) {
        const newParty: BillingParty = {
          id: "auto_" + Date.now().toString(),
          name: buyerName,
          gstin: buyerGstin,
          phone: "",
          address: buyerAddress,
          state: buyerState,
          stateCode: selectedBuyerState?.code || "",
          type: isSaleType ? "customer" : isPurchaseType ? "supplier" : "both",
          openingBalance: 0,
          balanceType: isSaleType ? "collect" : "pay",
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setBillingParties(prev => [newParty, ...prev]);
        toast.info(`Party "${buyerName}" auto-created`);
      }

      // Update stock for sale/purchase invoices
      if (docType === "sale-invoice" || docType === "delivery-challan") {
        // Decrease stock
        items.forEach(invItem => {
          const catItem = billingItems.find(bi => bi.name.toLowerCase() === invItem.description.toLowerCase() || bi.hsnSac === invItem.hsnSac);
          if (catItem) {
            setBillingItems(prev => prev.map(bi => bi.id === catItem.id ? { ...bi, stockQty: Math.max(0, bi.stockQty - invItem.qty) } : bi));
          }
        });
      } else if (docType === "purchase-invoice") {
        // Increase stock
        items.forEach(invItem => {
          const catItem = billingItems.find(bi => bi.name.toLowerCase() === invItem.description.toLowerCase() || bi.hsnSac === invItem.hsnSac);
          if (catItem) {
            setBillingItems(prev => prev.map(bi => bi.id === catItem.id ? { ...bi, stockQty: bi.stockQty + invItem.qty } : bi));
          }
        });
      }
    }

    if (total > 50000 && !["quotation", "proforma"].includes(docType)) {
      toast.info("⚠️ E-Way Bill required for goods value > ₹50,000", { duration: 6000 });
    }

    setCreateOpen(false);
    setEditingInvoiceId(null);
    resetForm();
    setActiveTab("dashboard");
  };

  const resetForm = () => {
    setBuyerName(""); setBuyerGstin(""); setBuyerAddress(""); setBuyerState("");
    setShippingName(""); setShippingAddress(""); setShippingGstin(""); setShippingState("");
    setSameAsBilling(true);
    setGstRate(18); setRefInvoice(""); setVehicleNo(""); setVehicleType(""); setTransportMode("");
    setTransporterName(""); setTransporterId(""); setLrNo(""); setLrDate(""); setEWayBillNo(""); setEWayBillDate("");
    setNotes(""); setPaymentTerms(""); setPlaceOfSupply("");
    setItems([{ slNo: 1, description: "", hsnSac: "", qty: 0, unit: "KG", rate: 0, per: "KG", discount: 0, amount: 0, gstRate: 18 }]);
    setPartySearchQuery(""); setShowPartyDropdown(false); setItemSearchQuery("");
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

  // ─── Search & Filter ──────────────────────────────
  const sq = searchQuery.toLowerCase();
  const searchedInvoices = sq
    ? invoices.filter(inv => inv.buyerName.toLowerCase().includes(sq) || inv.invoiceNo.toLowerCase().includes(sq) || inv.items.some(it => it.description.toLowerCase().includes(sq)))
    : invoices;

  const filtered = searchedInvoices.filter((i) => {
    if (activeTab === "all" || activeTab === "quicklinks") return true;
    if (activeTab === "invoices") return i.type === "sale-invoice" || i.type === "purchase-invoice";
    if (activeTab === "challans") return i.type === "delivery-challan";
    if (activeTab === "cn-dn") return i.type === "credit-note" || i.type === "debit-note";
    return true;
  });

  const needsTax = !["delivery-challan", "quotation"].includes(docType);

  // Dashboard stats computed dynamically
  const totalCollect = billingParties.reduce((s, p) => s + getPartyOutstanding(p).toCollect, 0);
  const totalPay = billingParties.reduce((s, p) => s + getPartyOutstanding(p).toPay, 0);
  const thisWeekSales = billingPayments.filter(p => p.type === "in").reduce((s, p) => s + p.amount, 0);
  const stockValue = billingItems.filter(i => i.itemType === "product").reduce((s, i) => s + i.salesPrice * i.stockQty, 0);

  // ─── CSV Export ──────────────────────────────────
  const handleExportInvoices = () => {
    const headers = ["Invoice No", "Date", "Type", "Buyer", "GSTIN", "Taxable", "CGST", "SGST", "IGST", "Total", "Status"];
    const rows = invoices.map(inv => [inv.invoiceNo, inv.date, typeLabel(inv.type), inv.buyerName, inv.buyerGstin, inv.taxableAmount, inv.cgstAmount, inv.sgstAmount, inv.igstAmount, inv.totalAmount, inv.status]);
    exportToCSV("invoices_export.csv", headers, rows);
    toast.success("Invoices exported to CSV!");
  };

  const handleExportParties = () => {
    const headers = ["Name", "GSTIN", "Phone", "Address", "State", "Type", "Opening Balance", "Balance Type"];
    const rows = billingParties.map(p => [p.name, p.gstin, p.phone, p.address, p.state, p.type, p.openingBalance, p.balanceType]);
    exportToCSV("parties_export.csv", headers, rows);
    toast.success("Parties exported to CSV!");
  };

  const handleExportItems = () => {
    const headers = ["Name", "Type", "Unit", "Sales Price", "Purchase Price", "GST Rate", "HSN/SAC", "Stock Qty", "Category"];
    const rows = billingItems.map(i => [i.name, i.itemType, i.unit, i.salesPrice, i.purchasePrice, i.gstRate, i.hsnSac, i.stockQty, i.category]);
    exportToCSV("items_export.csv", headers, rows);
    toast.success("Items exported to CSV!");
  };

  // ─── UPI QR URL ──────────────────────────────────
  const getUpiQrUrl = (inv: GSTInvoice) => {
    const upiId = user.upiId || "business@upi";
    const name = encodeURIComponent(inv.sellerName);
    const amt = inv.totalAmount.toFixed(2);
    const note = encodeURIComponent(`Payment for ${inv.invoiceNo}`);
    const upiLink = `upi://pay?pa=${upiId}&pn=${name}&am=${amt}&cu=INR&tn=${note}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(upiLink)}`;
  };

  // ─── Tax Summary Computation (per-item) ──────────
  const computeTaxSummary = (invItems: InvoiceItem[], interstate: boolean) => {
    const taxableAmount = invItems.reduce((s, i) => s + i.amount, 0);
    let totalCgst = 0, totalSgst = 0, totalIgst = 0;
    invItems.forEach(item => {
      const rate = item.gstRate || gstRate;
      if (interstate) {
        totalIgst += Math.round(item.amount * rate / 100);
      } else {
        totalCgst += Math.round(item.amount * rate / 200);
        totalSgst += Math.round(item.amount * rate / 200);
      }
    });
    return { taxableAmount, totalCgst, totalSgst, totalIgst, total: taxableAmount + totalCgst + totalSgst + totalIgst };
  };

  const BILLING_NAV = [
    { key: "dashboard", label: "Dashboard", icon: Home },
    { key: "parties", label: "Parties", icon: Users },
    { key: "items", label: "Items", icon: Package },
    { key: "services", label: "Services", icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background relative">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-navy text-navy-foreground px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">Hi<span className="text-emerald">Tex</span></span>
            <span className="text-[10px] bg-navy-foreground/10 rounded-full px-2 py-0.5 font-medium">Billing</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="flex items-center gap-1 text-xs font-medium bg-navy-foreground/10 rounded-full px-2.5 py-1.5 hover:bg-navy-foreground/20 transition-colors">
              <Search className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setActiveTab("quicklinks")} className="flex items-center gap-1 text-xs font-medium bg-navy-foreground/10 rounded-full px-2.5 py-1.5 hover:bg-navy-foreground/20 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Create
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-medium bg-navy-foreground/10 rounded-full px-2.5 py-1.5 hover:bg-navy-foreground/20 transition-colors">
                <Globe className="h-3.5 w-3.5" />
                <span>{languages.find((l) => l.code === lang)?.label?.slice(0, 2).toUpperCase()}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px]">
                {languages.map(({ code, label }) => (
                  <DropdownMenuItem key={code} onClick={() => setLang(code)} className={lang === code ? "bg-accent/10 font-semibold" : ""}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={() => navigate("/profile")} className="flex items-center gap-1 text-xs font-medium bg-navy-foreground/10 rounded-full px-2.5 py-1.5 hover:bg-navy-foreground/20 transition-colors">
              <User className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="mt-2">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search invoices, parties, items..."
              className="h-8 text-xs bg-navy-foreground/10 border-0 text-navy-foreground placeholder:text-navy-foreground/50"
              autoFocus
            />
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-32">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="hidden">
          <TabsTrigger value="dashboard" />
          <TabsTrigger value="quicklinks" />
          <TabsTrigger value="all" />
          <TabsTrigger value="parties" />
          <TabsTrigger value="items" />
        </TabsList>

        {/* ─── Dashboard Tab ─── */}
        <TabsContent value="dashboard" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-l-4 border-l-emerald cursor-pointer hover:shadow-md transition-all" onClick={() => { setPartyFilter("collect"); setActiveTab("parties"); }}>
              <CardContent className="p-3">
                <p className="text-lg font-bold">₹ {totalCollect.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-emerald font-semibold flex items-center gap-1">To Collect <ArrowDownLeft className="h-3 w-3" /></p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-destructive cursor-pointer hover:shadow-md transition-all" onClick={() => { setPartyFilter("pay"); setActiveTab("parties"); }}>
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
                <p className="text-[10px] text-muted-foreground">Total Received</p>
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
          <div className="flex gap-2 mb-4 flex-wrap">
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

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/billing/recurring")}>
              <CardContent className="p-3 flex items-center gap-2">
                <Repeat className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold">Recurring</p>
                  <p className="text-[10px] text-muted-foreground">Auto invoices</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/billing/reminders")}>
              <CardContent className="p-3 flex items-center gap-2">
                <Bell className="h-4 w-4 text-gold" />
                <div>
                  <p className="text-xs font-bold">Reminders</p>
                  <p className="text-[10px] text-muted-foreground">Payment alerts</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logo Upload */}
          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user.companyLogo ? (
                    <img src={user.companyLogo} alt="Logo" className="h-8 w-8 rounded object-contain border border-border" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                      <Image className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold">Company Logo</p>
                    <p className="text-[10px] text-muted-foreground">{user.companyLogo ? "Logo set — appears on PDF" : "Upload to show on invoices"}</p>
                  </div>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setUser((u: any) => ({ ...u, companyLogo: reader.result as string }));
                          toast.success("Logo uploaded!");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                    <Upload className="h-3 w-3" /> {user.companyLogo ? "Change" : "Upload"}
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold">Transactions</p>
              <div className="flex items-center gap-2">
                <button onClick={handleExportInvoices} className="text-[10px] font-semibold text-primary flex items-center gap-1">
                  <FileDown className="h-3 w-3" /> CSV
                </button>
                <button onClick={() => setActiveTab("all")} className="text-[10px] font-semibold text-primary flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> ALL
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {searchedInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">{searchQuery ? "No matching invoices" : "No transactions yet. Create your first invoice!"}</div>
              ) : (
                searchedInvoices.slice(0, 5).map((inv) => {
                  const sc = statusConfig[inv.status];
                  const StatusIcon = sc.icon;
                  return (
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
                            <Badge variant="outline" className={`text-[9px] mt-1 ${sc.color}`}>
                              <StatusIcon className="h-2.5 w-2.5 mr-0.5" /> {sc.label}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── Quick Links / Create Tab ─── */}
        <TabsContent value="quicklinks" className="mt-4">
          <p className="text-sm font-bold mb-3">Sales Transactions</p>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {QUICK_LINKS.filter((_, i) => i < 8).map(({ key, label, icon: Icon, type, color }) => (
              <button key={key} className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => openCreateForType(type)}>
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center hover:shadow-md transition-all">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>
          <p className="text-sm font-bold mb-3">Purchase & Payments</p>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {QUICK_LINKS.filter((_, i) => i >= 8).map(({ key, label, icon: Icon, type, color, action }) => (
              <button key={key} className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => {
                if (action === "payment-in") navigate("/billing/payment-in");
                else if (action === "payment-out") navigate("/billing/payment-out");
                else openCreateForType(type);
              }}>
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2 overflow-x-auto">
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
            <button onClick={handleExportInvoices} className="text-[10px] font-semibold text-primary flex items-center gap-1">
              <FileDown className="h-3 w-3" /> CSV
            </button>
          </div>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No documents yet</div>
            ) : (
              filtered.map((inv) => {
                const sc = statusConfig[inv.status];
                const StatusIcon = sc.icon;
                return (
                  <Card key={inv.id} className="overflow-hidden cursor-pointer" onClick={() => setPreviewInvoice(inv)}>
                    <CardContent className="p-0">
                      <div className={`px-4 py-1.5 flex items-center justify-between ${typeColor(inv.type)}`}>
                        <div className="flex items-center gap-2">
                          {inv.type.includes("challan") ? <Truck className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                          <span className="text-[10px] font-bold">{typeLabel(inv.type)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[8px] py-0 ${sc.color}`}><StatusIcon className="h-2 w-2 mr-0.5" />{sc.label}</Badge>
                          <span className="text-[10px] font-mono">{inv.invoiceNo}</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="text-sm font-semibold">{inv.buyerName}</p>
                            <p className="text-[10px] text-muted-foreground">{inv.buyerGstin}</p>
                          </div>
                          <div className="text-right">
                            {inv.totalAmount > 0 && <p className="text-sm font-bold">₹{inv.totalAmount.toLocaleString("en-IN")}</p>}
                            <p className="text-[10px] text-muted-foreground">{inv.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-1 flex-wrap items-center">
                          {inv.items.slice(0, 2).map((item, i) => (
                            <Badge key={i} variant="outline" className="text-[9px]">{item.description.slice(0, 20)}</Badge>
                          ))}
                          {inv.items.length > 2 && <Badge variant="outline" className="text-[9px]">+{inv.items.length - 2}</Badge>}
                          <div className="ml-auto flex gap-1">
                            <button onClick={e => { e.stopPropagation(); editInvoice(inv); }} className="p-1 hover:bg-secondary rounded"><Pencil className="h-3 w-3 text-muted-foreground" /></button>
                            <button onClick={e => { e.stopPropagation(); deleteInvoice(inv.id); }} className="p-1 hover:bg-secondary rounded"><Trash2 className="h-3 w-3 text-destructive" /></button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* ─── Parties Tab ─── */}
        <TabsContent value="parties" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 overflow-x-auto">
              {([
                { val: "collect" as const, label: "To Collect" },
                { val: "pay" as const, label: "To Pay" },
                { val: "all" as const, label: "All" },
              ]).map(f => (
                <button
                  key={f.val}
                  onClick={() => setPartyFilter(f.val)}
                  className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
                    partyFilter === f.val ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button onClick={handleExportParties} className="text-[10px] font-semibold text-primary flex items-center gap-1">
              <FileDown className="h-3 w-3" /> CSV
            </button>
          </div>
          {(() => {
            let fp = billingParties;
            if (partyFilter !== "all") {
              fp = fp.filter(p => {
                const out = getPartyOutstanding(p);
                if (partyFilter === "collect") return out.toCollect > 0;
                if (partyFilter === "pay") return out.toPay > 0;
                return true;
              });
            }
            if (sq) fp = fp.filter(p => p.name.toLowerCase().includes(sq) || p.gstin.toLowerCase().includes(sq));
            return fp.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm font-semibold text-muted-foreground">No Parties Found</p>
                <p className="text-[10px] text-muted-foreground mt-1">Create a new party to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fp.map(p => {
                  const out = getPartyOutstanding(p);
                  const outstanding = out.toCollect > 0 ? out.toCollect : out.toPay;
                  const isCollect = out.toCollect >= out.toPay;
                  return (
                    <Card key={p.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate(`/billing/party/${p.id}`)}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-primary">
                          {p.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{p.type} {p.gstin ? `• ${p.gstin}` : ""}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold flex items-center gap-0.5 ${isCollect ? "text-emerald" : "text-destructive"}`}>
                            ₹ {outstanding.toLocaleString("en-IN")}
                            {isCollect ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          </p>
                          <div className="flex gap-1 items-center justify-end mt-0.5">
                            {p.phone && (
                              <button onClick={(e) => {
                                e.stopPropagation();
                                const phone = p.phone.replace(/[^0-9]/g, "");
                                const msg = encodeURIComponent(`🔔 Payment Reminder\n\nDear ${p.name},\n\nKindly reminder: ₹${outstanding.toLocaleString("en-IN")} is pending.\n\nPlease arrange payment at the earliest.\n\nThank you! 🙏`);
                                window.open(`https://wa.me/${phone.startsWith("91") ? phone : "91" + phone}?text=${msg}`, "_blank");
                              }} className="text-[10px] text-primary font-semibold">Remind</button>
                            )}
                            <button onClick={e => { e.stopPropagation(); deleteParty(p.id); }} className="p-0.5 hover:bg-secondary rounded"><Trash2 className="h-3 w-3 text-destructive" /></button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
          <Button onClick={() => navigate("/billing/create-party")} className="w-full mt-4 gap-1.5">
            <Plus className="h-4 w-4" /> Create Party
          </Button>
        </TabsContent>

        {/* ─── Items Tab ─── */}
        <TabsContent value="items" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 overflow-x-auto">
              <button 
                onClick={() => setItemFilter("lowstock")}
                className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${itemFilter === "lowstock" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                Low Stock
              </button>
              <button 
                onClick={() => setItemFilter("all")}
                className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${itemFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                All Items
              </button>
            </div>
            <button onClick={handleExportItems} className="text-[10px] font-semibold text-primary flex items-center gap-1">
              <FileDown className="h-3 w-3" /> CSV
            </button>
          </div>
          {(() => {
            let filteredItems = sq ? billingItems.filter(i => i.name.toLowerCase().includes(sq) || i.hsnSac.toLowerCase().includes(sq)) : billingItems;
            if (itemFilter === "lowstock") {
              filteredItems = filteredItems.filter(i => i.itemType === "product" && i.stockQty <= i.lowStockAlert && i.lowStockAlert > 0);
            }
            return filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {itemFilter === "lowstock" ? "No low stock items 🎉" : "No items yet. Create an item to get started."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map(item => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-primary">
                        {item.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">HSN: {item.hsnSac || "N/A"} • GST: {item.gstRate}%</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px] text-muted-foreground">Sales: ₹{item.salesPrice.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] text-muted-foreground">Purchase: ₹{item.purchasePrice.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${item.stockQty <= item.lowStockAlert && item.lowStockAlert > 0 ? "text-destructive" : ""}`}>{item.stockQty}</p>
                        <p className="text-[10px] text-muted-foreground">{item.unit}</p>
                        <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="p-0.5 hover:bg-secondary rounded mt-1">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}
          <Button onClick={() => navigate("/billing/create-item")} className="w-full mt-4 gap-1.5">
            <Plus className="h-4 w-4" /> Create New Item
          </Button>
        </TabsContent>

        {["invoices", "challans", "cn-dn"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No documents yet</div>
              ) : (
                filtered.map((inv) => {
                  const sc = statusConfig[inv.status];
                  const StatusIcon = sc.icon;
                  return (
                    <Card key={inv.id} className="overflow-hidden cursor-pointer" onClick={() => setPreviewInvoice(inv)}>
                      <CardContent className="p-0">
                        <div className={`px-4 py-1.5 flex items-center justify-between ${typeColor(inv.type)}`}>
                          <span className="text-[10px] font-bold">{typeLabel(inv.type)}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[8px] py-0 ${sc.color}`}><StatusIcon className="h-2 w-2 mr-0.5" />{sc.label}</Badge>
                            <span className="text-[10px] font-mono">{inv.invoiceNo}</span>
                          </div>
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
                          <div className="flex gap-1 mt-1 items-center">
                            <div className="flex-1" />
                            <button onClick={e => { e.stopPropagation(); editInvoice(inv); }} className="p-1 hover:bg-secondary rounded"><Pencil className="h-3 w-3 text-muted-foreground" /></button>
                            <button onClick={e => { e.stopPropagation(); deleteInvoice(inv.id); }} className="p-1 hover:bg-secondary rounded"><Trash2 className="h-3 w-3 text-destructive" /></button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border-t border-border z-30">
        <div className="flex items-center justify-around py-2">
          {BILLING_NAV.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            if (key === "services") {
              return (
                <button key={key} onClick={() => navigate("/services", { state: { from: "billing" } })} className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
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
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) { setEditingInvoiceId(null); setShowPartyDropdown(false); } }}>
        <DialogContent className="max-w-[400px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{editingInvoiceId ? "Edit" : "Create"} {typeLabel(docType)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">

            {/* Reference Invoice (for credit/debit notes) */}
            {(docType === "credit-note" || docType === "debit-note") && (
              <div>
                <Label className="text-xs">Reference Invoice No. *</Label>
                <Input value={refInvoice} onChange={(e) => setRefInvoice(e.target.value)} placeholder="SI/2025-2026/0042" />
              </div>
            )}

            {/* Buyer / Bill To with Party Autocomplete */}
            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Buyer (Bill to)</p>
              <div className="relative">
                <Label className="text-xs">Party Name *</Label>
                <Input 
                  value={buyerName} 
                  onChange={(e) => { setBuyerName(e.target.value); setShowPartyDropdown(true); }} 
                  onFocus={() => setShowPartyDropdown(true)}
                  placeholder="Search or type party name" 
                />
                {showPartyDropdown && filteredPartyList.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredPartyList.map(p => (
                      <button
                        key={p.id}
                        className="w-full text-left px-3 py-2 hover:bg-secondary/50 text-xs border-b border-border last:border-0 flex justify-between items-center"
                        onClick={() => selectParty(p)}
                      >
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.gstin || "No GSTIN"} • {p.state}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground capitalize">{p.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs">GSTIN/UIN {!["quotation", "proforma", "delivery-challan"].includes(docType) ? "*" : ""}</Label>
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

            {/* Items with catalog selection */}
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
                      <Label className="text-[10px]">Description *</Label>
                      {/* Item catalog dropdown */}
                      {billingItems.length > 0 && !item.description && (
                        <Select onValueChange={(v) => selectCatalogItem(idx, v)}>
                          <SelectTrigger className="h-8 text-xs mb-1"><SelectValue placeholder="Select from catalog..." /></SelectTrigger>
                          <SelectContent>
                            {billingItems.map(bi => (
                              <SelectItem key={bi.id} value={bi.id}>{bi.name} (₹{SALE_TYPES.includes(docType) ? bi.salesPrice : bi.purchasePrice}/{bi.unit})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Input className="h-8 text-xs" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Or type item name" />
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
                    {needsTax && (
                      <div className="w-16">
                        <Label className="text-[10px]">GST %</Label>
                        <Select value={String(item.gstRate)} onValueChange={(v) => updateItem(idx, "gstRate", Number(v))}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {GST_RATES.map((r) => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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

            {/* Transport & Vehicle Details */}
            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" /> Transport Details
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Transport Mode</Label>
                  <Select value={transportMode} onValueChange={setTransportMode}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["Road", "Rail", "Air", "Ship/Vessel"].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px]">Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["Regular", "Over Dimensional Cargo (ODC)"].map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Vehicle No.</Label>
                  <Input className="h-8 text-xs" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value.toUpperCase())} placeholder="TN 39 AB 1234" />
                </div>
                <div>
                  <Label className="text-[10px]">Transporter Name</Label>
                  <Input className="h-8 text-xs" value={transporterName} onChange={(e) => setTransporterName(e.target.value)} placeholder="Sri Logistics" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Transporter ID</Label>
                  <Input className="h-8 text-xs" value={transporterId} onChange={(e) => setTransporterId(e.target.value.toUpperCase())} placeholder="33XXXXX1234X1Z5" maxLength={15} />
                </div>
                <div>
                  <Label className="text-[10px]">LR / GR No.</Label>
                  <Input className="h-8 text-xs" value={lrNo} onChange={(e) => setLrNo(e.target.value)} placeholder="LR-2026-001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">LR Date</Label>
                  <Input className="h-8 text-xs" type="date" value={lrDate} onChange={(e) => setLrDate(e.target.value)} />
                </div>
                <div>
                  <Label className="text-[10px]">E-Way Bill No.</Label>
                  <Input className="h-8 text-xs" value={eWayBillNo} onChange={(e) => setEWayBillNo(e.target.value)} placeholder="3714XXXXXXXX" />
                </div>
              </div>
              {eWayBillNo && (
                <div className="w-1/2">
                  <Label className="text-[10px]">E-Way Bill Date</Label>
                  <Input className="h-8 text-xs" type="date" value={eWayBillDate} onChange={(e) => setEWayBillDate(e.target.value)} />
                </div>
              )}
            </div>

            {/* Payment Terms */}
            <div>
              <Label className="text-xs">Payment Terms</Label>
              <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="Net 30 days / Advance payment" />
            </div>

            <div>
              <Label className="text-xs">Notes / Remarks</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." className="h-16 text-xs" />
            </div>

            {/* Per-item Tax Summary */}
            {needsTax && (() => {
              const ts = computeTaxSummary(items, isInterstate);
              return (
                <div className="bg-secondary rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Taxable Value</span>
                    <span>₹{ts.taxableAmount.toLocaleString("en-IN")}</span>
                  </div>
                  {Array.from(new Set(items.map(i => i.gstRate))).sort((a, b) => a - b).map(rate => {
                    const rateItems = items.filter(i => i.gstRate === rate);
                    const rateTotal = rateItems.reduce((s, i) => s + i.amount, 0);
                    if (rateTotal === 0) return null;
                    return isInterstate ? (
                      <div key={rate} className="flex justify-between text-muted-foreground">
                        <span>IGST @ {rate}%</span>
                        <span>₹{Math.round(rateTotal * rate / 100).toLocaleString("en-IN")}</span>
                      </div>
                    ) : (
                      <div key={rate}>
                        <div className="flex justify-between text-muted-foreground">
                          <span>CGST @ {rate / 2}%</span>
                          <span>₹{Math.round(rateTotal * rate / 200).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>SGST @ {rate / 2}%</span>
                          <span>₹{Math.round(rateTotal * rate / 200).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between text-sm font-bold border-t border-border pt-1 mt-1">
                    <span>Total</span>
                    <span>₹{ts.total.toLocaleString("en-IN")}</span>
                  </div>
                  {ts.total > 50000 && (
                    <div className="flex items-center gap-1 text-gold mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-[10px]">E-Way Bill required (value &gt; ₹50,000)</span>
                    </div>
                  )}
                </div>
              );
            })()}

            <Button onClick={handleCreate} className="w-full">
              {editingInvoiceId ? "Update" : "Create"} {typeLabel(docType)}
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
              {/* Status Bar + Actions */}
              <div className="px-3 pt-3 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`${statusConfig[previewInvoice.status].color} text-[10px]`}>
                    {statusConfig[previewInvoice.status].label}
                  </Badge>
                  {previewInvoice.totalAmount > 50000 && (
                    <Badge variant="outline" className="text-[9px] text-gold border-gold/30">
                      <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> E-Way Bill
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1">Status ▾</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(["unpaid", "partial", "paid"] as const).map(s => (
                        <DropdownMenuItem key={s} onClick={() => changeStatus(previewInvoice.id, s)} className={previewInvoice.status === s ? "font-bold" : ""}>
                          {statusConfig[s].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button onClick={() => editInvoice(previewInvoice)} className="p-1 hover:bg-secondary rounded"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => deleteInvoice(previewInvoice.id)} className="p-1 hover:bg-secondary rounded"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                </div>
              </div>

              {/* Tally-style bordered invoice */}
              <div className="border-2 border-foreground/80 m-3 text-[10px] leading-tight">
                <div className="text-center border-b border-foreground/80 py-2">
                  <p className="text-sm font-bold tracking-wide">{typeLabel(previewInvoice.type).toUpperCase()}</p>
                </div>

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
                  </div>
                </div>

                {/* Consignee */}
                <div className="border-b border-foreground/80 p-2">
                  <p className="text-[9px] text-muted-foreground">Consignee (Ship to)</p>
                  <p className="font-bold">{previewInvoice.consigneeName}</p>
                  <p>{previewInvoice.consigneeAddress}</p>
                  <p>GSTIN/UIN : {previewInvoice.consigneeGstin}</p>
                  <p>State Name : {previewInvoice.consigneeState}, Code : {previewInvoice.consigneeStateCode}</p>
                </div>

                {/* Buyer */}
                <div className="border-b border-foreground/80 p-2">
                  <p className="text-[9px] text-muted-foreground">Buyer (Bill to)</p>
                  <p className="font-bold">{previewInvoice.buyerName}</p>
                  <p>{previewInvoice.buyerAddress}</p>
                  <p>GSTIN/UIN : {previewInvoice.buyerGstin}</p>
                  <p>State Name : {previewInvoice.buyerState}, Code : {previewInvoice.buyerStateCode}</p>
                </div>

                {/* Transport */}
                {(previewInvoice.vehicleNo || previewInvoice.transporterName || previewInvoice.lrNo || previewInvoice.eWayBillNo) && (
                  <div className="border-b border-foreground/80 px-2 py-1.5">
                    <p className="text-[9px] text-muted-foreground font-semibold mb-0.5">Transport Details</p>
                    <div className="grid grid-cols-3 gap-x-3 gap-y-0.5">
                      {previewInvoice.transportMode && <p><span className="font-semibold">Mode:</span> {previewInvoice.transportMode}</p>}
                      {previewInvoice.vehicleNo && <p><span className="font-semibold">Vehicle No:</span> {previewInvoice.vehicleNo}</p>}
                      {previewInvoice.transporterName && <p><span className="font-semibold">Transporter:</span> {previewInvoice.transporterName}</p>}
                      {previewInvoice.lrNo && <p><span className="font-semibold">LR/GR:</span> {previewInvoice.lrNo}</p>}
                      {previewInvoice.eWayBillNo && <p><span className="font-semibold">E-Way Bill:</span> {previewInvoice.eWayBillNo}</p>}
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div className="border-b border-foreground/80">
                  <div className="grid grid-cols-12 text-[9px] font-bold border-b border-foreground/80 bg-secondary/30">
                    <div className="col-span-1 p-1 border-r border-foreground/30 text-center">Sl</div>
                    <div className="col-span-4 p-1 border-r border-foreground/30">Description</div>
                    <div className="col-span-1 p-1 border-r border-foreground/30 text-center">HSN</div>
                    <div className="col-span-2 p-1 border-r border-foreground/30 text-right">Qty</div>
                    <div className="col-span-2 p-1 border-r border-foreground/30 text-right">Rate</div>
                    <div className="col-span-2 p-1 text-right">Amount</div>
                  </div>

                  {previewInvoice.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 text-[10px] border-b border-foreground/20">
                      <div className="col-span-1 p-1 border-r border-foreground/30 text-center">{item.slNo}</div>
                      <div className="col-span-4 p-1 border-r border-foreground/30 font-semibold">{item.description}</div>
                      <div className="col-span-1 p-1 border-r border-foreground/30 text-center">{item.hsnSac}</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-right">{item.qty} {item.unit}</div>
                      <div className="col-span-2 p-1 border-r border-foreground/30 text-right">{item.rate.toFixed(2)}</div>
                      <div className="col-span-2 p-1 text-right font-medium">{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                    </div>
                  ))}

                  {/* Tax rows */}
                  {previewInvoice.type !== "delivery-challan" && (
                    <>
                      {previewInvoice.isIgst ? (
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
                      )}
                    </>
                  )}

                  {/* Total Row */}
                  <div className="grid grid-cols-12 text-[10px] border-t border-foreground/80 font-bold">
                    <div className="col-span-8 p-1 border-r border-foreground/30 text-right">Total</div>
                    <div className="col-span-4 p-1 text-right text-xs">₹ {previewInvoice.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>

                {/* Amount in words */}
                <div className="border-b border-foreground/80 px-2 py-1.5">
                  <p className="text-[9px] text-muted-foreground">Amount Chargeable (in words)</p>
                  <p className="font-bold text-[11px]">{previewInvoice.amountInWords}</p>
                </div>

                {/* Declaration + Signatory */}
                <div className="grid grid-cols-2">
                  <div className="p-2 border-r border-foreground/80">
                    <p className="text-[9px] font-semibold underline">Declaration</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{previewInvoice.declaration}</p>
                    {previewInvoice.paymentTerms && <p className="text-[8px] mt-1"><span className="font-semibold">Payment Terms:</span> {previewInvoice.paymentTerms}</p>}
                    {previewInvoice.notes && <p className="text-[8px] mt-1"><span className="font-semibold">Notes:</span> {previewInvoice.notes}</p>}
                  </div>
                  <div className="p-2 text-right">
                    <p className="text-[9px] font-semibold">for {previewInvoice.sellerName}</p>
                    <div className="h-10"></div>
                    <p className="text-[9px] font-semibold">Authorised Signatory</p>
                  </div>
                </div>

                <div className="border-t border-foreground/80 text-center py-1">
                  <p className="text-[8px] text-muted-foreground">This is a Computer Generated Invoice</p>
                </div>
              </div>

              {/* UPI QR Code */}
              <div className="px-3 pb-2">
                <div className="border rounded-lg p-3 flex items-center gap-3">
                  <img src={getUpiQrUrl(previewInvoice)} alt="UPI QR" className="h-24 w-24 rounded" />
                  <div>
                    <p className="text-xs font-bold flex items-center gap-1"><QrCode className="h-3.5 w-3.5" /> Scan to Pay</p>
                    <p className="text-[10px] text-muted-foreground">UPI payment for ₹{previewInvoice.totalAmount.toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-primary mt-1">{user.upiId || "Set UPI ID in profile"}</p>
                  </div>
                </div>
              </div>

              {/* E-Way Bill Warning */}
              {previewInvoice.totalAmount > 50000 && !["quotation", "proforma"].includes(previewInvoice.type) && (
                <div className="px-3 pb-2">
                  <div className="border border-gold/30 bg-gold/5 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gold">E-Way Bill Required</p>
                      <p className="text-[10px] text-muted-foreground">Goods value exceeds ₹50,000.</p>
                      {previewInvoice.eWayBillNo && <p className="text-[10px] font-semibold mt-1">E-Way Bill: {previewInvoice.eWayBillNo}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="px-3 pb-3 space-y-2">
                <Button variant="outline" className="w-full gap-1 text-xs" onClick={() => { generateInvoicePdf(previewInvoice!, user.companyLogo); toast.success("PDF downloaded!"); }}>
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-1 text-xs text-emerald border-emerald/30"
                  onClick={() => {
                    const msg = encodeURIComponent(
                      `📄 *${typeLabel(previewInvoice!.type)}*\n\nInvoice: ${previewInvoice!.invoiceNo}\nDate: ${previewInvoice!.date}\nAmount: ₹${previewInvoice!.totalAmount.toLocaleString("en-IN")}\n\nFrom: ${previewInvoice!.sellerName}\nGSTIN: ${previewInvoice!.sellerGstin}\n\nThank you! 🙏`
                    );
                    window.open(`https://wa.me/?text=${msg}`, "_blank");
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Share via WhatsApp
                </Button>
                {(previewInvoice!.type === "sale-invoice" || previewInvoice!.type === "purchase-invoice") && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 text-[10px] text-destructive border-destructive/30"
                      onClick={() => {
                        setPreviewInvoice(null);
                        setDocType("credit-note");
                        setBuyerName(previewInvoice!.buyerName);
                        setBuyerGstin(previewInvoice!.buyerGstin);
                        setBuyerAddress(previewInvoice!.buyerAddress);
                        setBuyerState(previewInvoice!.buyerState);
                        setRefInvoice(previewInvoice!.invoiceNo);
                        setGstRate(previewInvoice!.isIgst ? previewInvoice!.igstRate : previewInvoice!.cgstRate * 2);
                        setItems(previewInvoice!.items.map(i => ({ ...i })));
                        setCreateOpen(true);
                      }}
                    >
                      <FileMinus className="h-3 w-3" /> Credit Note
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 text-[10px] text-gold border-gold/30"
                      onClick={() => {
                        setPreviewInvoice(null);
                        setDocType("debit-note");
                        setBuyerName(previewInvoice!.buyerName);
                        setBuyerGstin(previewInvoice!.buyerGstin);
                        setBuyerAddress(previewInvoice!.buyerAddress);
                        setBuyerState(previewInvoice!.buyerState);
                        setRefInvoice(previewInvoice!.invoiceNo);
                        setGstRate(previewInvoice!.isIgst ? previewInvoice!.igstRate : previewInvoice!.cgstRate * 2);
                        setItems(previewInvoice!.items.map(i => ({ ...i })));
                        setCreateOpen(true);
                      }}
                    >
                      <FilePlus className="h-3 w-3" /> Debit Note
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
