import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Package, Lock, MessageCircle, Phone, Crown, ShoppingCart, Tag, Ban, Shield, Flag, Star, Truck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ReviewsList } from "./Reviews";
import LeadImageCarousel from "@/components/LeadImageCarousel";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, user, setUser, reviews } = useApp();
  const { t } = useI18n();
  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t("lead.notFound")}
        <Button variant="link" onClick={() => navigate("/")}>{t("lead.goBack")}</Button>
      </div>
    );
  }

  const isSubscribed = user.isSubscribed;
  const isOwnLead = lead.posterId === user.id;
  const isBlocked = user.blockedUsers.includes(lead.posterId);
  const posterReviews = reviews.filter((r) => r.revieweeId === lead.posterId);
  const avgRating = posterReviews.length > 0 ? (posterReviews.reduce((s, r) => s + r.rating, 0) / posterReviews.length).toFixed(1) : null;

  const handleBlock = () => {
    setUser((u) => ({ ...u, blockedUsers: [...u.blockedUsers, lead.posterId] }));
    toast.success(t("lead.userBlocked"));
  };
  const handleUnblock = () => {
    setUser((u) => ({ ...u, blockedUsers: u.blockedUsers.filter((bid) => bid !== lead.posterId) }));
    toast.success(t("lead.userUnblocked"));
  };
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
          {lead.leadType === "Buy" ? <ShoppingCart className="h-4 w-4 text-primary" /> : <Tag className="h-4 w-4 text-emerald" />}
          <h1 className="text-xl font-bold text-foreground">{lead.materialType}</h1>
          <Badge variant="outline" className="text-[10px]">{lead.category}</Badge>
          {lead.status === "Sold" && <Badge variant="secondary" className="text-[10px]">{t("lead.sold")}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          {lead.leadType === "Buy" ? t("lead.buyer") : t("lead.seller")} · {t("lead.posted")} {lead.postedAt} · {lead.posterRole}
        </p>
      </div>

      <div className={`rounded-lg p-3 mb-4 ${lead.leadType === "Buy" ? "bg-primary/10" : "bg-emerald/10"}`}>
        <p className={`text-xs font-semibold ${lead.leadType === "Buy" ? "text-primary" : "text-emerald"}`}>
          {lead.leadType === "Buy" ? t("lead.wantsBuy") : t("lead.wantsSell")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{lead.leadType === "Buy" ? t("lead.offeringPrice") : t("lead.askingPrice")}</p>
            <p className="text-2xl font-bold text-emerald">₹{lead.pricePerKg}<span className="text-xs font-normal text-muted-foreground">{t("lead.perKg")}</span></p>
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

      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3">{t("lead.specs")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {lead.specs.color && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("lead.color")}</p>
                <p className="text-sm font-medium">{lead.specs.color}</p>
              </div>
            )}
            {lead.specs.trashPercent !== undefined && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("lead.trash")}</p>
                <p className="text-sm font-medium">{lead.specs.trashPercent}%</p>
              </div>
            )}
            {lead.specs.count && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("lead.count")}</p>
                <p className="text-sm font-medium">{lead.specs.count}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">{lead.locationDistrict}, Tamil Nadu</span>
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
                <span className="text-xs text-muted-foreground">({posterReviews.length} {t("profile.reviews")})</span>
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
                <Crown className="h-4 w-4 text-gold" /> {lead.leadType === "Buy" ? t("lead.buyerContact") : t("lead.sellerContact")}
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{lead.posterName}</span>
                  {lead.posterRole && <Badge variant="outline" className="text-[10px]">{lead.posterRole}</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {lead.posterPhone}
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

      {!isOwnLead && (
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => toast.success(t("lead.reportSubmitted"))}>
            <Flag className="h-3.5 w-3.5 mr-1" /> {t("lead.report")}
          </Button>
          {isBlocked ? (
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleUnblock}>
              <Shield className="h-3.5 w-3.5 mr-1" /> {t("lead.unblock")}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="flex-1 text-xs text-destructive" onClick={handleBlock}>
              <Ban className="h-3.5 w-3.5 mr-1" /> {t("lead.block")}
            </Button>
          )}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-sm font-semibold mb-2">{t("lead.reviewsFor")} {lead.posterName}</h2>
        <ReviewsList userId={lead.posterId} />
      </div>

      <div className="flex items-center justify-between bg-secondary rounded-lg p-3">
        <span className="text-xs text-muted-foreground">{t("lead.demoToggle")}</span>
        <Switch checked={isSubscribed} onCheckedChange={(v) => setUser((u) => ({ ...u, isSubscribed: v }))} />
      </div>
    </div>
  );
}
