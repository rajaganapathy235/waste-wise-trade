import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Package, Lock, MessageCircle, Phone, Crown } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, user, setUser } = useApp();
  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Lead not found.
        <Button variant="link" onClick={() => navigate("/")}>Go back</Button>
      </div>
    );
  }

  const isSubscribed = user.isSubscribed;

  return (
    <div className="px-4 pt-3 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Title */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-foreground">{lead.materialType}</h1>
          <Badge variant="outline" className="text-[10px]">{lead.category}</Badge>
          {lead.status === "Sold" && <Badge variant="secondary" className="text-[10px]">Sold</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">Posted {lead.postedAt} · {lead.sellerRole}</p>
      </div>

      {/* Price & Quantity */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Price</p>
            <p className="text-2xl font-bold text-emerald">₹{lead.pricePerKg}<span className="text-xs font-normal text-muted-foreground">/kg</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Quantity</p>
            <div className="flex items-center justify-center gap-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{lead.quantity.toLocaleString()}<span className="text-xs font-normal text-muted-foreground"> kg</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specs */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3">Specifications</h2>
          <div className="grid grid-cols-3 gap-3">
            {lead.specs.color && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Color</p>
                <p className="text-sm font-medium">{lead.specs.color}</p>
              </div>
            )}
            {lead.specs.trashPercent !== undefined && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trash %</p>
                <p className="text-sm font-medium">{lead.specs.trashPercent}%</p>
              </div>
            )}
            {lead.specs.count && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Count</p>
                <p className="text-sm font-medium">{lead.specs.count}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="mb-4">
        <CardContent className="p-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm">{lead.locationDistrict}, Tamil Nadu</span>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card className="mb-4 overflow-hidden">
        <CardContent className="p-0">
          {isSubscribed ? (
            <div className="p-4 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-gold" /> Seller Contact
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{lead.sellerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {lead.sellerPhone}
                </div>
              </div>
              <Button className="w-full bg-emerald hover:bg-emerald/90 text-emerald-foreground">
                <MessageCircle className="h-4 w-4 mr-1" /> Open Chat
              </Button>
            </div>
          ) : (
            <div className="relative">
              {/* Blurred content */}
              <div className="p-4 space-y-3 blur-sm select-none pointer-events-none" aria-hidden>
                <h2 className="text-sm font-semibold">Seller Contact</h2>
                <div className="space-y-2">
                  <p className="text-sm font-medium">██████ Textiles</p>
                  <p className="text-sm text-muted-foreground">+91 █████ █████</p>
                </div>
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                <Lock className="h-6 w-6 text-gold mb-2" />
                <p className="text-sm font-semibold text-foreground mb-1">Contact Hidden</p>
                <p className="text-xs text-muted-foreground text-center mb-3">Unlock seller details with a Premium subscription</p>
                <Button className="bg-gold hover:bg-gold/90 text-gold-foreground font-semibold px-6">
                  <Crown className="h-4 w-4 mr-1" /> Premium Unlock — ₹10,000/yr
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo toggle */}
      <div className="flex items-center justify-between bg-secondary rounded-lg p-3">
        <span className="text-xs text-muted-foreground">Demo: Toggle subscription</span>
        <Switch
          checked={isSubscribed}
          onCheckedChange={(v) => setUser((u) => ({ ...u, isSubscribed: v }))}
        />
      </div>
    </div>
  );
}
