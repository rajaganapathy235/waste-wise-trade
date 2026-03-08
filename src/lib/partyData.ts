export interface Party {
  id: string;
  name: string;
  initials: string;
  gstin?: string;
  location?: string;
  billCount: number;
  phone?: string;
  type: "Customers" | "Suppliers";
}

export const MOCK_PARTIES: Party[] = [
  { id: "p1", name: "KMK TEXTILES", initials: "KM", gstin: "33BACPN9245H1ZN", location: "tamilnadu", billCount: 2, phone: "9876543210", type: "Customers" },
  { id: "p2", name: "Cgh", initials: "CG", billCount: 0, type: "Customers" },
  { id: "p3", name: "SR COTTON", initials: "SR", gstin: "33BWXPB1896D1ZC", location: "TAMILNADU", billCount: 62, phone: "9876543211", type: "Customers" },
  { id: "p4", name: "RAJA YARNS", initials: "RA", gstin: "33AABCR1234M1Z5", location: "tamilnadu", billCount: 5, phone: "9876543212", type: "Suppliers" },
];
