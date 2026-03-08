import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ──────────────────────────────────────────────
export interface BillingParty {
  id: string;
  name: string;
  gstin: string;
  phone: string;
  address: string;
  state: string;
  stateCode: string;
  type: "customer" | "supplier" | "both";
  openingBalance: number;
  balanceType: "collect" | "pay";
  createdAt: string;
}

export interface BillingItem {
  id: string;
  name: string;
  itemType: "product" | "service";
  unit: string;
  salesPrice: number;
  purchasePrice: number;
  gstRate: number;
  hsnSac: string;
  stockQty: number;
  lowStockAlert: number;
  category: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  type: "in" | "out";
  partyId: string;
  partyName: string;
  amount: number;
  paymentMode: "cash" | "upi" | "bank" | "cheque";
  bankAccount?: string;
  date: string;
  note?: string;
  invoiceRef?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  note: string;
  paymentMode: "cash" | "upi" | "bank";
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountType: "current" | "savings";
  upiId?: string;
  openingBalance: number;
  isDefault: boolean;
  createdAt: string;
}

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
  gstRate: number;
}

export interface GSTInvoice {
  id: string;
  type: "sale-invoice" | "purchase-invoice" | "quotation" | "delivery-challan" | "proforma" | "purchase-order" | "sale-order" | "job-work" | "credit-note" | "debit-note";
  invoiceNo: string;
  date: string;
  status: "unpaid" | "partial" | "paid";
  irn?: string;
  ackNo?: string;
  ackDate?: string;
  sellerName: string;
  sellerGstin: string;
  sellerAddress: string;
  sellerState: string;
  sellerStateCode: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeGstin: string;
  consigneeState: string;
  consigneeStateCode: string;
  buyerName: string;
  buyerGstin: string;
  buyerAddress: string;
  buyerState: string;
  buyerStateCode: string;
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
  items: InvoiceItem[];
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
  referenceInvoiceNo?: string;
  transportMode?: string;
  vehicleNo?: string;
  vehicleType?: string;
  transporterName?: string;
  transporterId?: string;
  lrNo?: string;
  lrDate?: string;
  eWayBillNo?: string;
  eWayBillDate?: string;
  notes?: string;
  paymentTerms?: string;
  declaration?: string;
}

// ─── Context ──────────────────────────────────────────────
interface BillingContextType {
  parties: BillingParty[];
  setParties: React.Dispatch<React.SetStateAction<BillingParty[]>>;
  items: BillingItem[];
  setItems: React.Dispatch<React.SetStateAction<BillingItem[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  invoices: GSTInvoice[];
  setInvoices: React.Dispatch<React.SetStateAction<GSTInvoice[]>>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

// ─── Mock Data ──────────────────────────────────────────
const MOCK_PARTIES: BillingParty[] = [
  { id: "p1", name: "Kiran Enterprises", gstin: "29AAFFC8126N1ZZ", phone: "+91 98765 43210", address: "12th Cross, HSR Layout, Bangalore", state: "Karnataka", stateCode: "29", type: "customer", openingBalance: 5192, balanceType: "collect", createdAt: "2026-02-15" },
  { id: "p2", name: "Murugan Fibers", gstin: "33AABCM1234P1Z5", phone: "+91 87654 32109", address: "Sathy Road, Erode", state: "Tamil Nadu", stateCode: "33", type: "supplier", openingBalance: 0, balanceType: "pay", createdAt: "2026-02-20" },
  { id: "p3", name: "Cash Sale", gstin: "", phone: "", address: "", state: "Tamil Nadu", stateCode: "33", type: "customer", openingBalance: 0, balanceType: "collect", createdAt: "2026-01-01" },
];

const MOCK_ITEMS: BillingItem[] = [
  { id: "i1", name: "Comber Noil (40s White)", itemType: "product", unit: "KG", salesPrice: 85, purchasePrice: 72, gstRate: 5, hsnSac: "5202", stockQty: 5000, lowStockAlert: 500, category: "Waste", createdAt: "2026-02-10" },
  { id: "i2", name: "Hosiery Clips (Mixed)", itemType: "product", unit: "KG", salesPrice: 62, purchasePrice: 48, gstRate: 5, hsnSac: "5202", stockQty: 3000, lowStockAlert: 300, category: "Waste", createdAt: "2026-02-12" },
  { id: "i3", name: "OE Yarn (10s Black)", itemType: "product", unit: "KG", salesPrice: 195, purchasePrice: 165, gstRate: 12, hsnSac: "5205", stockQty: 2000, lowStockAlert: 200, category: "Yarn", createdAt: "2026-02-18" },
  { id: "i4", name: "Transport Service", itemType: "service", unit: "NOS", salesPrice: 2500, purchasePrice: 0, gstRate: 18, hsnSac: "9965", stockQty: 0, lowStockAlert: 0, category: "Service", createdAt: "2026-03-01" },
];

const MOCK_PAYMENTS: Payment[] = [
  { id: "pay1", type: "in", partyId: "p1", partyName: "Kiran Enterprises", amount: 4130, paymentMode: "upi", date: "2026-03-05", note: "Against Invoice SHB/456/20" },
  { id: "pay2", type: "out", partyId: "p2", partyName: "Murugan Fibers", amount: 7200, paymentMode: "bank", bankAccount: "HDFC - 1234", date: "2026-03-03", note: "Purchase payment" },
];

const MOCK_EXPENSES: Expense[] = [
  { id: "exp1", category: "Transport", amount: 1500, date: "2026-03-04", note: "Truck loading charges", paymentMode: "cash" },
  { id: "exp2", category: "Office", amount: 800, date: "2026-03-02", note: "Stationery & printing", paymentMode: "upi" },
];

const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  { id: "ba1", bankName: "HDFC Bank", accountNumber: "50100XXXX1234", ifsc: "HDFC0001234", accountType: "current", upiId: "business@hdfcbank", openingBalance: 125000, isDefault: true, createdAt: "2026-01-01" },
  { id: "ba2", bankName: "SBI", accountNumber: "38XXXX5678", ifsc: "SBIN0001234", accountType: "savings", openingBalance: 45000, isDefault: false, createdAt: "2026-01-15" },
];

const MOCK_INVOICES: GSTInvoice[] = [
  {
    id: "inv1", type: "sale-invoice", invoiceNo: "SHB/456/20", date: "20-Dec-20",
    status: "unpaid",
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
      { slNo: 1, description: "12MM**", hsnSac: "1005", qty: 7, unit: "No", rate: 500, per: "No", discount: 0, amount: 3500, gstRate: 18 },
    ],
    isIgst: false, taxableAmount: 3500, cgstRate: 9, sgstRate: 9, igstRate: 0,
    cgstAmount: 315, sgstAmount: 315, igstAmount: 0, totalAmount: 4130,
    amountInWords: "Indian Rupee Four Thousand One Hundred Thirty Only",
    taxAmountInWords: "Indian Rupee Six Hundred Thirty Only",
    declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  },
];

// ─── LocalStorage helpers ──────────────────────────────
const STORAGE_KEY = "billing_data";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[key]) return parsed[key];
    }
  } catch {}
  return fallback;
}

function saveToStorage(data: Record<string, unknown>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const [parties, setParties] = useState<BillingParty[]>(() => loadFromStorage("parties", MOCK_PARTIES));
  const [items, setItems] = useState<BillingItem[]>(() => loadFromStorage("items", MOCK_ITEMS));
  const [payments, setPayments] = useState<Payment[]>(() => loadFromStorage("payments", MOCK_PAYMENTS));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage("expenses", MOCK_EXPENSES));
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => loadFromStorage("bankAccounts", MOCK_BANK_ACCOUNTS));
  const [invoices, setInvoices] = useState<GSTInvoice[]>(() => loadFromStorage("invoices", MOCK_INVOICES));

  // Persist all billing data to localStorage whenever anything changes
  useEffect(() => {
    saveToStorage({ parties, items, payments, expenses, bankAccounts, invoices });
  }, [parties, items, payments, expenses, bankAccounts, invoices]);

  return (
    <BillingContext.Provider value={{ parties, setParties, items, setItems, payments, setPayments, expenses, setExpenses, bankAccounts, setBankAccounts, invoices, setInvoices }}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error("useBilling must be used within BillingProvider");
  return ctx;
}
