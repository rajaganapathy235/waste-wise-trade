export type UserRole = "Waste Trader" | "Recycling Mill" | "OE Mill" | "Job Worker";
export type LeadCategory = "Waste" | "Fiber" | "Yarn";
export type LeadStatus = "Active" | "Sold";
export type LeadType = "Buy" | "Sell";

export interface Lead {
  id: string;
  leadType: LeadType;
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
  posterName: string;
  posterPhone: string;
  posterRole: UserRole;
  posterId: string;
  locationDistrict: string;
  postedAt: string;
  views: number;
  inquiries: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  leadId: string;
  leadTitle: string;
  participants: { id: string; name: string }[];
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  leadId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface TransportRequest {
  id: string;
  leadId: string;
  materialType: string;
  quantity: number;
  fromDistrict: string;
  toDistrict: string;
  requestedDate: string;
  vehicleType: "Tempo" | "Mini Truck" | "Full Truck";
  status: "Pending" | "Accepted" | "In Transit" | "Delivered" | "Cancelled";
  estimatedCost?: number;
  providerName?: string;
  providerPhone?: string;
  createdAt: string;
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
  blockedUsers: string[];
  verificationDocuments?: { selfie?: string; gstCert?: string; incorpCert?: string };
  verificationStatus: "none" | "pending" | "verified" | "rejected";
  trustScore: number;
  totalReviews: number;
  companyLogo?: string; // base64 data URL
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
    id: "1", leadType: "Sell", category: "Waste", materialType: "Comber Noil",
    pricePerKg: 85, quantity: 5000,
    specs: { color: "White", trashPercent: 2.5, count: "40s" },
    status: "Active", posterName: "Balaji Textiles", posterPhone: "+91 98765 43210",
    posterRole: "Waste Trader", posterId: "u2", locationDistrict: "Tiruppur", postedAt: "2026-03-07",
    views: 142, inquiries: 8,
  },
  {
    id: "2", leadType: "Sell", category: "Waste", materialType: "Hosiery Clips",
    pricePerKg: 62, quantity: 3000,
    specs: { color: "Mixed", trashPercent: 5, count: "30s" },
    status: "Active", posterName: "Sri Ganesh Recyclers", posterPhone: "+91 87654 32109",
    posterRole: "Recycling Mill", posterId: "u3", locationDistrict: "Coimbatore", postedAt: "2026-03-06",
    views: 98, inquiries: 5,
  },
  {
    id: "3", leadType: "Buy", category: "Fiber", materialType: "Recycled Fiber",
    pricePerKg: 110, quantity: 10000,
    specs: { color: "Grey", trashPercent: 1.5 },
    status: "Active", posterName: "Murugan Fibers", posterPhone: "+91 76543 21098",
    posterRole: "OE Mill", posterId: "u4", locationDistrict: "Erode", postedAt: "2026-03-05",
    views: 210, inquiries: 12,
  },
  {
    id: "4", leadType: "Sell", category: "Yarn", materialType: "OE Yarn",
    pricePerKg: 195, quantity: 2000,
    specs: { color: "Black", count: "10s" },
    status: "Sold", posterName: "Lakshmi Yarns", posterPhone: "+91 65432 10987",
    posterRole: "OE Mill", posterId: "u5", locationDistrict: "Salem", postedAt: "2026-03-04",
    views: 320, inquiries: 18,
  },
  {
    id: "5", leadType: "Sell", category: "Waste", materialType: "Denim Clips",
    pricePerKg: 48, quantity: 8000,
    specs: { color: "Indigo", trashPercent: 8 },
    status: "Active", posterName: "Annamalai Waste Co.", posterPhone: "+91 54321 09876",
    posterRole: "Waste Trader", posterId: "u6", locationDistrict: "Karur", postedAt: "2026-03-03",
    views: 75, inquiries: 3,
  },
  {
    id: "6", leadType: "Buy", category: "Waste", materialType: "Knitting Waste",
    pricePerKg: 55, quantity: 4500,
    specs: { color: "Assorted", trashPercent: 6, count: "24s" },
    status: "Active", posterName: "KPR Waste Traders", posterPhone: "+91 43210 98765",
    posterRole: "Waste Trader", posterId: "u7", locationDistrict: "Tiruppur", postedAt: "2026-03-02",
    views: 63, inquiries: 2,
  },
  {
    id: "7", leadType: "Sell", category: "Fiber", materialType: "Polyester Fiber",
    pricePerKg: 130, quantity: 6000,
    specs: { color: "White", trashPercent: 0.5 },
    status: "Active", posterName: "Velan Fiber Mills", posterPhone: "+91 32109 87654",
    posterRole: "Recycling Mill", posterId: "u8", locationDistrict: "Namakkal", postedAt: "2026-03-01",
    views: 189, inquiries: 9,
  },
  {
    id: "8", leadType: "Buy", category: "Yarn", materialType: "Blended Yarn",
    pricePerKg: 175, quantity: 1500,
    specs: { color: "Melange Grey", count: "20s" },
    status: "Sold", posterName: "Dharani Textiles", posterPhone: "+91 21098 76543",
    posterRole: "Job Worker", posterId: "u9", locationDistrict: "Dindigul", postedAt: "2026-02-28",
    views: 256, inquiries: 14,
  },
];

// Per-material price history for Market Pulse
export const mockMaterialPriceHistory: Record<string, { month: string; avg: number }[]> = {
  // Waste
  "Comber Noil": [{ month: "Oct", avg: 78 }, { month: "Nov", avg: 82 }, { month: "Dec", avg: 80 }, { month: "Jan", avg: 84 }, { month: "Feb", avg: 88 }, { month: "Mar", avg: 85 }],
  "Hosiery Clips": [{ month: "Oct", avg: 55 }, { month: "Nov", avg: 58 }, { month: "Dec", avg: 56 }, { month: "Jan", avg: 60 }, { month: "Feb", avg: 64 }, { month: "Mar", avg: 62 }],
  "Denim Clips": [{ month: "Oct", avg: 42 }, { month: "Nov", avg: 45 }, { month: "Dec", avg: 44 }, { month: "Jan", avg: 46 }, { month: "Feb", avg: 50 }, { month: "Mar", avg: 48 }],
  "Knitting Waste": [{ month: "Oct", avg: 48 }, { month: "Nov", avg: 52 }, { month: "Dec", avg: 50 }, { month: "Jan", avg: 53 }, { month: "Feb", avg: 57 }, { month: "Mar", avg: 55 }],
  "Lycra Waste": [{ month: "Oct", avg: 35 }, { month: "Nov", avg: 38 }, { month: "Dec", avg: 36 }, { month: "Jan", avg: 40 }, { month: "Feb", avg: 42 }, { month: "Mar", avg: 40 }],
  "Card Fly": [{ month: "Oct", avg: 22 }, { month: "Nov", avg: 24 }, { month: "Dec", avg: 23 }, { month: "Jan", avg: 25 }, { month: "Feb", avg: 28 }, { month: "Mar", avg: 26 }],
  "Lickerin Waste": [{ month: "Oct", avg: 18 }, { month: "Nov", avg: 20 }, { month: "Dec", avg: 19 }, { month: "Jan", avg: 21 }, { month: "Feb", avg: 23 }, { month: "Mar", avg: 22 }],
  "Hard Waste": [{ month: "Oct", avg: 30 }, { month: "Nov", avg: 32 }, { month: "Dec", avg: 31 }, { month: "Jan", avg: 34 }, { month: "Feb", avg: 36 }, { month: "Mar", avg: 35 }],
  "Sweeping Waste": [{ month: "Oct", avg: 12 }, { month: "Nov", avg: 14 }, { month: "Dec", avg: 13 }, { month: "Jan", avg: 15 }, { month: "Feb", avg: 16 }, { month: "Mar", avg: 15 }],
  // Fiber
  "Polyester Fiber": [{ month: "Oct", avg: 120 }, { month: "Nov", avg: 125 }, { month: "Dec", avg: 122 }, { month: "Jan", avg: 128 }, { month: "Feb", avg: 132 }, { month: "Mar", avg: 130 }],
  "Viscose Fiber": [{ month: "Oct", avg: 140 }, { month: "Nov", avg: 145 }, { month: "Dec", avg: 142 }, { month: "Jan", avg: 148 }, { month: "Feb", avg: 152 }, { month: "Mar", avg: 150 }],
  "Cotton Fiber": [{ month: "Oct", avg: 160 }, { month: "Nov", avg: 165 }, { month: "Dec", avg: 162 }, { month: "Jan", avg: 168 }, { month: "Feb", avg: 172 }, { month: "Mar", avg: 170 }],
  "Recycled Fiber": [{ month: "Oct", avg: 100 }, { month: "Nov", avg: 105 }, { month: "Dec", avg: 102 }, { month: "Jan", avg: 108 }, { month: "Feb", avg: 112 }, { month: "Mar", avg: 110 }],
  "Blended Fiber": [{ month: "Oct", avg: 115 }, { month: "Nov", avg: 118 }, { month: "Dec", avg: 116 }, { month: "Jan", avg: 120 }, { month: "Feb", avg: 124 }, { month: "Mar", avg: 122 }],
  // Yarn
  "OE Yarn": [{ month: "Oct", avg: 185 }, { month: "Nov", avg: 190 }, { month: "Dec", avg: 188 }, { month: "Jan", avg: 194 }, { month: "Feb", avg: 198 }, { month: "Mar", avg: 195 }],
  "Ring Spun Yarn": [{ month: "Oct", avg: 220 }, { month: "Nov", avg: 225 }, { month: "Dec", avg: 222 }, { month: "Jan", avg: 228 }, { month: "Feb", avg: 232 }, { month: "Mar", avg: 230 }],
  "Blended Yarn": [{ month: "Oct", avg: 168 }, { month: "Nov", avg: 172 }, { month: "Dec", avg: 170 }, { month: "Jan", avg: 175 }, { month: "Feb", avg: 178 }, { month: "Mar", avg: 175 }],
  "Polyester Yarn": [{ month: "Oct", avg: 155 }, { month: "Nov", avg: 158 }, { month: "Dec", avg: 156 }, { month: "Jan", avg: 160 }, { month: "Feb", avg: 164 }, { month: "Mar", avg: 162 }],
  "Recycled Yarn": [{ month: "Oct", avg: 145 }, { month: "Nov", avg: 148 }, { month: "Dec", avg: 146 }, { month: "Jan", avg: 150 }, { month: "Feb", avg: 154 }, { month: "Mar", avg: 152 }],
};

export const mockChatThreads: ChatThread[] = [
  {
    id: "chat1", leadId: "1", leadTitle: "Comber Noil — 5,000 kg",
    participants: [{ id: "u1", name: "HiTex Demo Traders" }, { id: "u2", name: "Balaji Textiles" }],
    messages: [
      { id: "m1", senderId: "u1", text: "Hi, I'm interested in your Comber Noil. Is the price negotiable?", timestamp: "2026-03-07T10:30:00" },
      { id: "m2", senderId: "u2", text: "Hello! Yes, for bulk orders above 3000 kg we can offer ₹82/kg.", timestamp: "2026-03-07T10:35:00" },
      { id: "m3", senderId: "u1", text: "That works. Can you share a sample first?", timestamp: "2026-03-07T10:40:00" },
      { id: "m4", senderId: "u2", text: "Sure, I can courier a 500g sample. Share your address.", timestamp: "2026-03-07T10:45:00" },
    ],
    lastMessage: "Sure, I can courier a 500g sample. Share your address.",
    lastMessageAt: "2026-03-07T10:45:00",
    unreadCount: 1,
  },
  {
    id: "chat2", leadId: "3", leadTitle: "Recycled Fiber — 10,000 kg",
    participants: [{ id: "u1", name: "HiTex Demo Traders" }, { id: "u4", name: "Murugan Fibers" }],
    messages: [
      { id: "m5", senderId: "u4", text: "We need 10,000 kg recycled fiber. Do you have stock?", timestamp: "2026-03-06T14:00:00" },
      { id: "m6", senderId: "u1", text: "Yes we have around 8,000 kg ready. Can arrange remaining in a week.", timestamp: "2026-03-06T14:10:00" },
    ],
    lastMessage: "Yes we have around 8,000 kg ready. Can arrange remaining in a week.",
    lastMessageAt: "2026-03-06T14:10:00",
    unreadCount: 0,
  },
];

// Demand heatmap mock data
export const mockDemandData: { material: string; category: LeadCategory; district: string; searchCount: number }[] = [
  { material: "Comber Noil", category: "Waste", district: "Tiruppur", searchCount: 340 },
  { material: "Hosiery Clips", category: "Waste", district: "Coimbatore", searchCount: 280 },
  { material: "Recycled Fiber", category: "Fiber", district: "Erode", searchCount: 220 },
  { material: "OE Yarn", category: "Yarn", district: "Salem", searchCount: 195 },
  { material: "Denim Clips", category: "Waste", district: "Karur", searchCount: 175 },
  { material: "Polyester Fiber", category: "Fiber", district: "Tiruppur", searchCount: 160 },
  { material: "Knitting Waste", category: "Waste", district: "Coimbatore", searchCount: 150 },
  { material: "Blended Yarn", category: "Yarn", district: "Dindigul", searchCount: 130 },
  { material: "Cotton Fiber", category: "Fiber", district: "Namakkal", searchCount: 120 },
  { material: "Comber Noil", category: "Waste", district: "Erode", searchCount: 115 },
  { material: "Lycra Waste", category: "Waste", district: "Tiruppur", searchCount: 105 },
  { material: "Ring Spun Yarn", category: "Yarn", district: "Coimbatore", searchCount: 95 },
  { material: "Viscose Fiber", category: "Fiber", district: "Madurai", searchCount: 88 },
  { material: "Card Fly", category: "Waste", district: "Salem", searchCount: 72 },
  { material: "Recycled Yarn", category: "Yarn", district: "Erode", searchCount: 65 },
];

export const mockReviews: Review[] = [
  { id: "r1", reviewerId: "u2", reviewerName: "Balaji Textiles", revieweeId: "u1", leadId: "1", rating: 5, comment: "Excellent buyer. Quick payment and smooth transaction.", createdAt: "2026-02-20" },
  { id: "r2", reviewerId: "u4", reviewerName: "Murugan Fibers", revieweeId: "u1", leadId: "3", rating: 4, comment: "Good quality material. Slightly delayed delivery but overall satisfied.", createdAt: "2026-02-15" },
  { id: "r3", reviewerId: "u1", reviewerName: "HiTex Demo Traders", revieweeId: "u2", leadId: "1", rating: 5, comment: "Top quality Comber Noil. Will buy again!", createdAt: "2026-02-21" },
  { id: "r4", reviewerId: "u3", reviewerName: "Sri Ganesh Recyclers", revieweeId: "u5", leadId: "4", rating: 3, comment: "Decent yarn quality. Communication could be better.", createdAt: "2026-01-30" },
  { id: "r5", reviewerId: "u7", reviewerName: "KPR Waste Traders", revieweeId: "u1", leadId: "6", rating: 5, comment: "Very professional. Fair pricing and honest quality description.", createdAt: "2026-01-25" },
];

export const mockTransportRequests: TransportRequest[] = [
  {
    id: "t1", leadId: "1", materialType: "Comber Noil", quantity: 5000,
    fromDistrict: "Tiruppur", toDistrict: "Coimbatore", requestedDate: "2026-03-10",
    vehicleType: "Full Truck", status: "Accepted", estimatedCost: 4500,
    providerName: "RKV Transport", providerPhone: "+91 99001 12233",
    createdAt: "2026-03-07",
  },
  {
    id: "t2", leadId: "3", materialType: "Recycled Fiber", quantity: 10000,
    fromDistrict: "Coimbatore", toDistrict: "Erode", requestedDate: "2026-03-12",
    vehicleType: "Full Truck", status: "Pending",
    createdAt: "2026-03-06",
  },
];

export const VEHICLE_TYPES: { type: TransportRequest["vehicleType"]; capacity: string; baseRate: number }[] = [
  { type: "Tempo", capacity: "Up to 2,000 kg", baseRate: 1500 },
  { type: "Mini Truck", capacity: "2,000 — 5,000 kg", baseRate: 3000 },
  { type: "Full Truck", capacity: "5,000 — 15,000 kg", baseRate: 5000 },
];

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
  blockedUsers: [],
  verificationStatus: "verified",
  trustScore: 4.7,
  totalReviews: 3,
};
