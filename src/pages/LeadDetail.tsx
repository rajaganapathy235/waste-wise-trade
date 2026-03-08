import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { DbLead } from "@/hooks/useLeads";
import { useReviews } from "@/hooks/useReviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Package, Lock, MessageCircle, Phone, Crown, ShoppingCart, Tag, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { ReviewsList } from "./Reviews";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { t } = useI18n();
  const [lead, setLead] = useState<DbLead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("leads").select("*").eq("id", id).single();
      setLead(data);
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  const { reviews } = useReviews(lead?.user_id);
  const isSubscribed = profile?.is_subscribed || false;
  const isOwnLead = lead?.user_id === user?.id;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const specs = (lead?.specs as any) || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t("lead.notFound")}
        <Button variant="link" onClick={() => navigate("/")}>{t("lead.goBack")}</Button>
      </div>
    );
  }

  const handleChat = () => {
    if (!isSubscribed) { toast.error(t("lead.premiumRequired")); return; }
    navigate(`/chat/${lead.id}`);
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> {t("lead.back")}
      </button>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          {lead.lead_type === "Buy" ? <ShoppingCart className="h-4 w-4 text-primary" /> : <Tag className="h-4 w-4 text-emerald" />}
          <h1 className="text-xl font-bold text-foreground">{lead.material_type}</h1>
          <Badge variant="outline" className="text-[10px]">{lead.category}</Badge>
          {lead.status === "Sold" && <Badge variant="secondary" className="text-[10px]">{t("lead.sold")}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          {lead.lead_type === "Buy" ? t("lead.buyer") : t("lead.seller")} · {t("lead.posted")} {new Date(lead.created_at).toLocaleDateString()} · {lead.poster_role}
        </p>
      </div>

      <div className={`rounded-lg p-3 mb-4 ${lead.lead_type === "Buy" ? "bg-primary/10" : "bg-emerald/10"}`}>
        <p className={`text-xs font-semibold ${lead.lead_type === "Buy" ? "text-primary" : "text-emerald"}`}>
          {lead.lead_type === "Buy" ? t("lead.wantsBuy") : t("lead.wantsSell")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{lead.lead_type === "Buy" ? t("lead.offeringPrice") : t("lead.askingPrice")}</p>
            <p className="text-2xl font-bold text-emerald">₹{lead.price_per_kg}<span className="text-xs font-normal text-muted-foreground">{t("lead.perKg")}</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t("lead.quantity")}</p>
            <div className="flex items-center justify-center gap-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{lead.quantity.toLocaleString()}<span className="text-xs font-normal text-muted-foreground"> kg</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {(specs.color || specs.trashPercent !== undefined || specs.count) && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-3">{t("lead.specs")}</h2>
            <div className="grid grid-cols-3 gap-3">
              {specs.color && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("lead.color")}</p>
                  <p className="text-sm font-medium">{specs.color}</p>
                </div>
              )}
              {specs.trashPercent !== undefined && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("lead.trash")}</p>
                  <p className="text-sm font-medium">{specs.trashPercent}%</p>
                </div>
              )}
              {specs.count && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("lead.count")}</p>
                  <p className="text-sm font-medium">{specs.count}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">{lead.location_district}, Tamil Nadu</span>
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/transport")}>
              <Truck className="h-3.5 w-3.5 mr-1" /> {t("lead.bookTransport")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {avgRating && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="text-sm font-semibold">{avgRating}</span>
                <span className="text-xs text-muted-foreground">({reviews.length} {t("profile.reviews")})</span>
              </div>
              {!isOwnLead && lead.status === "Sold" && (
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate(`/review/${lead.id}`)}>
                  <Star className="h-3.5 w-3.5 mr-1" /> {t("lead.rateDeal")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4 overflow-hidden">
        <CardContent className="p-0">
          {isSubscribed ? (
            <div className="p-4 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-gold" /> {lead.lead_type === "Buy" ? t("lead.buyerContact") : t("lead.sellerContact")}
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{lead.poster_name}</span>
                  {lead.poster_role && <Badge variant="outline" className="text-[10px]">{lead.poster_role}</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {lead.poster_phone}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleChat} className="flex-1 bg-emerald hover:bg-emerald/90 text-emerald-foreground">
                  <MessageCircle className="h-4 w-4 mr-1" /> {t("lead.chat")}
                </Button>
                {!isOwnLead && (
                  <Button variant="outline" className="flex-1" onClick={() => navigate(`/review/${lead.id}`)}>
                    <Star className="h-4 w-4 mr-1" /> {t("lead.review")}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="p-4 space-y-3 blur-sm select-none pointer-events-none" aria-hidden>
                <h2 className="text-sm font-semibold">Contact</h2>
                <div className="space-y-2">
                  <p className="text-sm font-medium">██████ Textiles</p>
                  <p className="text-sm text-muted-foreground">+91 █████ █████</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                <Lock className="h-6 w-6 text-gold mb-2" />
                <p className="text-sm font-semibold text-foreground mb-1">{t("lead.contactHidden")}</p>
                <p className="text-xs text-muted-foreground text-center mb-3">{t("lead.unlockContact")}</p>
                <Button className="bg-gold hover:bg-gold/90 text-gold-foreground font-semibold px-6">
                  <Crown className="h-4 w-4 mr-1" /> {t("lead.premiumUnlock")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-sm font-semibold mb-2">{t("lead.reviewsFor")} {lead.poster_name}</h2>
        <ReviewsList userId={lead.user_id} />
      </div>
    </div>
  );
}
