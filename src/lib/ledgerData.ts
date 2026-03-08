export interface LedgerEntry {
  id: string;
  date: string;
  type: "SALES" | "PURCHASE" | string;
  invoiceNo: number;
  credit: number;
  debit: number;
  particular?: string;
}

export const MOCK_ENTRIES: Record<string, LedgerEntry[]> = {
  p1: [
    { id: "l1", date: "19-Nov-2025", type: "SALES", invoiceNo: 52, credit: 0, debit: 74332.00 },
    { id: "l2", date: "29-Dec-2026", type: "SALES", invoiceNo: 62, credit: 0, debit: 14114.00 },
  ],
  p3: [
    { id: "l3", date: "30-Jan-2026", type: "SALES", invoiceNo: 72, credit: 0, debit: 65889.00 },
    { id: "l4", date: "27-Jan-2026", type: "SALES", invoiceNo: 71, credit: 0, debit: 67219.00 },
  ],
};

export function getAllEntries(partyId: string): LedgerEntry[] {
  const storedEntries = JSON.parse(localStorage.getItem(`ledger_entries_${partyId}`) || "[]");
  return [...(MOCK_ENTRIES[partyId] || []), ...storedEntries];
}
