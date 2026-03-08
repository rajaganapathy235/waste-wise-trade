import { Lead } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categoryColors: Record<string, string> = {
  Waste: "bg-destructive/10 text-destructive border-destructive/20",
  Fiber: "bg-primary/10 text-primary border-primary/20",
  Yarn: "bg-emerald/10 text-emerald border-emerald/20",
};

export default function LeadCard({ lead }: { lead: Lead }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/lead/${lead.id}`)}
      className="w-full text-left bg-card rounded-lg border border-border p-4 hover:shadow-md transition-all animate-fade-in"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-sm text-foreground">{lead.materialType}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{lead.sellerRole}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0.5 ${categoryColors[lead.category] || ""}`}
          >
            {lead.category}
          </Badge>
          {lead.status === "Sold" && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              Sold
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <IndianRupee className="h-3.5 w-3.5 text-emerald" />
          <span className="font-bold text-foreground text-sm">₹{lead.pricePerKg}</span>
          <span>/kg</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          <span>{lead.quantity.toLocaleString()} kg</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
          <MapPin className="h-3.5 w-3.5" />
          <span>{lead.locationDistrict}</span>
        </div>
      </div>
    </button>
  );
}
