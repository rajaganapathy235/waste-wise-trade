import React, { createContext, useContext, useState, ReactNode } from "react";

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

export function BillingProvider({ children }: { children: ReactNode }) {
  const [parties, setParties] = useState<BillingParty[]>(MOCK_PARTIES);
  const [items, setItems] = useState<BillingItem[]>(MOCK_ITEMS);
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);

  return (
    <BillingContext.Provider value={{ parties, setParties, items, setItems, payments, setPayments, expenses, setExpenses }}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error("useBilling must be used within BillingProvider");
  return ctx;
}
