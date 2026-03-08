export type UserRole = "Waste Trader" | "Recycling Mill" | "OE Mill" | "Job Worker";
export type LeadCategory = "Waste" | "Fiber" | "Yarn";
export type LeadStatus = "Active" | "Sold";

export interface Lead {
  id: string;
  category: LeadCategory;
  materialType: string;
  pricePerKg: number;
  quantity: number;
  specs: {
    color?: string;
    trashPercent?: number;
    count?: string;
  };
  status: LeadStatus;
  sellerName: string;
  sellerPhone: string;
  sellerRole: UserRole;
  locationDistrict: string;
  postedAt: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  businessName: string;
  gstNumber: string;
  locationDistrict: string;
  roles: UserRole[];
  isVerified: boolean;
  isSubscribed: boolean;
  subscriptionExpiry?: string;
  ebConsumerNumber?: string;
}

export const MATERIAL_TYPES: Record<LeadCategory, string[]> = {
  Waste: ["Comber Noil", "Hosiery Clips", "Denim Clips", "Knitting Waste", "Lycra Waste", "Card Fly", "Lickerin Waste", "Hard Waste", "Sweeping Waste"],
  Fiber: ["Polyester Fiber", "Viscose Fiber", "Cotton Fiber", "Recycled Fiber", "Blended Fiber"],
  Yarn: ["OE Yarn", "Ring Spun Yarn", "Blended Yarn", "Polyester Yarn", "Recycled Yarn"],
};

export const DISTRICTS = [
  "Coimbatore", "Tiruppur", "Erode", "Salem", "Namakkal",
  "Karur", "Dindigul", "Madurai", "Ramanathapuram", "Sivaganga",
];

export const mockLeads: Lead[] = [
  {
    id: "1",
    category: "Waste",
    materialType: "Comber Noil",
    pricePerKg: 85,
    quantity: 5000,
    specs: { color: "White", trashPercent: 2.5, count: "40s" },
    status: "Active",
    sellerName: "Balaji Textiles",
    sellerPhone: "+91 98765 43210",
    sellerRole: "Waste Trader",
    locationDistrict: "Tiruppur",
    postedAt: "2026-03-07",
  },
  {
    id: "2",
    category: "Waste",
    materialType: "Hosiery Clips",
    pricePerKg: 62,
    quantity: 3000,
    specs: { color: "Mixed", trashPercent: 5, count: "30s" },
    status: "Active",
    sellerName: "Sri Ganesh Recyclers",
    sellerPhone: "+91 87654 32109",
    sellerRole: "Recycling Mill",
    locationDistrict: "Coimbatore",
    postedAt: "2026-03-06",
  },
  {
    id: "3",
    category: "Fiber",
    materialType: "Recycled Fiber",
    pricePerKg: 110,
    quantity: 10000,
    specs: { color: "Grey", trashPercent: 1.5 },
    status: "Active",
    sellerName: "Murugan Fibers",
    sellerPhone: "+91 76543 21098",
    sellerRole: "OE Mill",
    locationDistrict: "Erode",
    postedAt: "2026-03-05",
  },
  {
    id: "4",
    category: "Yarn",
    materialType: "OE Yarn",
    pricePerKg: 195,
    quantity: 2000,
    specs: { color: "Black", count: "10s" },
    status: "Sold",
    sellerName: "Lakshmi Yarns",
    sellerPhone: "+91 65432 10987",
    sellerRole: "OE Mill",
    locationDistrict: "Salem",
    postedAt: "2026-03-04",
  },
  {
    id: "5",
    category: "Waste",
    materialType: "Denim Clips",
    pricePerKg: 48,
    quantity: 8000,
    specs: { color: "Indigo", trashPercent: 8 },
    status: "Active",
    sellerName: "Annamalai Waste Co.",
    sellerPhone: "+91 54321 09876",
    sellerRole: "Waste Trader",
    locationDistrict: "Karur",
    postedAt: "2026-03-03",
  },
  {
    id: "6",
    category: "Waste",
    materialType: "Knitting Waste",
    pricePerKg: 55,
    quantity: 4500,
    specs: { color: "Assorted", trashPercent: 6, count: "24s" },
    status: "Active",
    sellerName: "KPR Waste Traders",
    sellerPhone: "+91 43210 98765",
    sellerRole: "Waste Trader",
    locationDistrict: "Tiruppur",
    postedAt: "2026-03-02",
  },
  {
    id: "7",
    category: "Fiber",
    materialType: "Polyester Fiber",
    pricePerKg: 130,
    quantity: 6000,
    specs: { color: "White", trashPercent: 0.5 },
    status: "Active",
    sellerName: "Velan Fiber Mills",
    sellerPhone: "+91 32109 87654",
    sellerRole: "Recycling Mill",
    locationDistrict: "Namakkal",
    postedAt: "2026-03-01",
  },
  {
    id: "8",
    category: "Yarn",
    materialType: "Blended Yarn",
    pricePerKg: 175,
    quantity: 1500,
    specs: { color: "Melange Grey", count: "20s" },
    status: "Sold",
    sellerName: "Dharani Textiles",
    sellerPhone: "+91 21098 76543",
    sellerRole: "Job Worker",
    locationDistrict: "Dindigul",
    postedAt: "2026-02-28",
  },
];

export const mockPriceHistory = {
  Waste: [
    { month: "Oct", avg: 58 },
    { month: "Nov", avg: 62 },
    { month: "Dec", avg: 59 },
    { month: "Jan", avg: 65 },
    { month: "Feb", avg: 68 },
    { month: "Mar", avg: 64 },
  ],
  Fiber: [
    { month: "Oct", avg: 105 },
    { month: "Nov", avg: 112 },
    { month: "Dec", avg: 108 },
    { month: "Jan", avg: 118 },
    { month: "Feb", avg: 125 },
    { month: "Mar", avg: 120 },
  ],
  Yarn: [
    { month: "Oct", avg: 170 },
    { month: "Nov", avg: 178 },
    { month: "Dec", avg: 172 },
    { month: "Jan", avg: 185 },
    { month: "Feb", avg: 190 },
    { month: "Mar", avg: 185 },
  ],
};

export const mockUser: UserProfile = {
  id: "u1",
  phone: "+91 99887 76655",
  businessName: "HiTex Demo Traders",
  gstNumber: "33AABCU9603R1ZM",
  locationDistrict: "Coimbatore",
  roles: ["Waste Trader", "Recycling Mill"],
  isVerified: true,
  isSubscribed: false,
  subscriptionExpiry: undefined,
  ebConsumerNumber: "",
};
