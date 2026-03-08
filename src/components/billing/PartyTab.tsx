import { useState } from "react";
import { Phone, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type PartyFilter = "Customers" | "Suppliers";

interface Party {
  id: string;
  name: string;
  initials: string;
  gstin?: string;
  location?: string;
  billCount: number;
  phone?: string;
  type: PartyFilter;
}

const MOCK_PARTIES: Party[] = [
  { id: "p1", name: "KMK TEXTILES", initials: "KM", gstin: "33BACPN9245H1ZN", location: "tamilnadu", billCount: 2, phone: "9876543210", type: "Customers" },
  { id: "p2", name: "Cgh", initials: "CG", billCount: 0, type: "Customers" },
  { id: "p3", name: "SR COTTON", initials: "SR", gstin: "33BWXPB1896D1ZC", location: "TAMILNADU", billCount: 62, phone: "9876543211", type: "Customers" },
  { id: "p4", name: "RAJA YARNS", initials: "RA", gstin: "33AABCR1234M1Z5", location: "tamilnadu", billCount: 5, phone: "9876543212", type: "Suppliers" },
];

export default function PartyTab() {
  const [filter, setFilter] = useState<PartyFilter>("Customers");
  const filters: PartyFilter[] = ["Customers", "Suppliers"];

  const filtered = MOCK_PARTIES.filter((p) => p.type === filter);

  return (
    <div className="relative min-h-[60vh]">
      <div className="divide-y divide-border">
        {filtered.map((party) => (
          <div key={party.id} className="py-4 flex gap-3">
            {/* Avatar + Bill Count */}
            <div className="flex flex-col items-center shrink-0">
              <div className="h-12 w-12 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{party.initials}</span>
              </div>
              <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-navy text-navy-foreground">
                {party.billCount} Bills
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground">{party.name}</p>
              {(party.gstin || party.location) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {party.gstin}{party.location ? `,${party.location}` : ""}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => toast.info(`${party.name} statement`)}
                  className="px-4 py-1.5 rounded text-xs font-bold bg-gold text-gold-foreground"
                >
                  Statement
                </button>
                <button
                  onClick={() => toast.info(`${party.name} ledger`)}
                  className="px-4 py-1.5 rounded text-xs font-bold bg-primary text-primary-foreground"
                >
                  Ledger
                </button>
              </div>
            </div>

            {/* Phone */}
            {party.phone && (
              <a href={`tel:${party.phone}`} className="shrink-0 flex items-center">
                <Phone className="h-7 w-7 text-emerald/60" />
              </a>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No parties found</p>
        )}
      </div>

      {/* Filter toggle */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20">
        <div className="flex border border-emerald rounded-full overflow-hidden">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 text-sm font-semibold transition-colors ${filter === f ? "bg-emerald text-emerald-foreground" : "bg-card text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-28 right-6 h-14 w-14 rounded-full bg-emerald hover:bg-emerald/90 text-emerald-foreground shadow-lg flex items-center justify-center z-20">
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
}
