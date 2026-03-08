import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PartyFilter>("Customers");
  const [search, setSearch] = useState("");
  const filters: PartyFilter[] = ["Customers", "Suppliers"];

  const filtered = MOCK_PARTIES.filter(
    (p) => p.type === filter && (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search parties..."
          className="pl-9 h-10 text-sm bg-secondary border-0"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Party cards */}
      <div className="space-y-2">
        {filtered.map((party) => (
          <Card key={party.id} className="border-border shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{party.initials}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{party.name}</p>
                {(party.gstin || party.location) && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {party.gstin}{party.location ? `, ${party.location}` : ""}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">
                    {party.billCount} Bills
                  </span>
                  <button
                    onClick={() => toast.info(`${party.name} statement`)}
                    className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold"
                  >
                    Statement
                  </button>
                  <button
                    onClick={() => toast.info(`${party.name} ledger`)}
                    className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[10px] font-bold hover:bg-secondary/80"
                  >
                    Ledger
                  </button>
                </div>
              </div>

              {/* Phone */}
              {party.phone && (
                <a href={`tel:${party.phone}`} className="shrink-0 h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-accent" />
                </a>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No parties found</div>
        )}
      </div>

      {/* FAB */}
      <button className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg flex items-center justify-center z-20">
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
}
