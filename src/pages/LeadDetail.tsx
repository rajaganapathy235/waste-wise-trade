import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, MapPin, Package, Lock, 
  MessageCircle, Phone, Crown, ShoppingCart, 
  Tag, Ban, Shield, Flag, Star, Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { ReviewsList } from "./Reviews";
import LeadImageCarousel from "@/components/LeadImageCarousel";
import { useLead } from "@/hooks/useLeads";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, reviews } = useApp();
  const { t } = useI18n();
  
  const { data: lead, isLoading, error } = useLead(id);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading lead details...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-red-50 text-red-500">
          <Flag className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("lead.notFound")}</h2>
          <p className="text-sm text-slate-500 mt-1">This lead may have been sold or removed.</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/")}>{t("lead.goBack")}</Button>
      </div>
    );
  }

  const isSubscribed = user.isSubscribed;
  const isOwnLead = lead.posterId === user.id;
  const isBlocked = user.blockedUsers.includes(lead.posterId);
  const posterReviews = reviews.filter((r) => r.revieweeId === lead.posterId);
  const avgRating = posterReviews.length > 0 ? (posterReviews.reduce((s, r) => s + r.rating, 0) / posterReviews.length).toFixed(1) : null;

  const handleChat = () => {
    if (!isSubscribed && !isOwnLead) { 
      toast.error(t("lead.premiumRequired")); 
      navigate("/subscribe");
      return; 
    }
    navigate(`/chat/${lead.id}`);
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-md mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors group">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t("lead.back")}
      </button>

      <LeadImageCarousel materialType={lead.materialType} images={lead.images} />

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {lead.leadType === "Buy" ? <ShoppingCart className="h-4 w-4 text-primary" /> : <Tag className="h-4 w-4 text-emerald" />}
          <h1 className="text-xl font-bold text-foreground">{lead.materialType}</h1>
          <Badge variant="outline" className="text-[10px]">{lead.category}</Badge>
          {lead.status === "Sold" && <Badge className="bg-slate-100 text-slate-500 text-[10px] border-none">{t("lead.sold")}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          {lead.leadType === "Buy" ? t("lead.buyer") : t("lead.seller")} · {lead.posterRole || "Trader"} · 
          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : t("lead.posted")} 
        </p>
      </div>

      {lead.description && (
        <Card className="mb-4 border-none bg-slate-50/50 shadow-none">
          <CardContent className="p-3">
            <p className="text-xs text-slate-600 leading-relaxed italic">"{lead.description}"</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {lead.leadType === "Buy" ? t("lead.offeringPrice") : t("lead.askingPrice")}
            </p>
            <p className="text-2xl font-black text-emerald">₹{lead.pricePerKg}<span className="text-xs font-normal text-slate-400">/{t("lead.perKg")}</span></p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t("lead.quantity")}</p>
            <div className="flex items-center justify-center gap-1">
              <p className="text-2xl font-black text-slate-900">{lead.quantity.toLocaleString()}<span className="text-xs font-normal text-slate-400"> kg</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {lead.specs && Object.keys(lead.specs).length > 0 && (
        <Card className="mb-4 border-none shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-tight">{t("lead.specs")}</h2>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(lead.specs).map(([key, value]) => (
                <div key={key}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{key}</p>
                  <p className="text-sm font-bold text-slate-700">{value as string}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4 border-none shadow-sm border-l-4 border-l-primary">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Location</p>
              <p className="text-sm font-bold text-slate-800">{lead.locationDistrict}, Tamil Nadu</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 overflow-hidden border-none shadow-lg">
        <CardContent className="p-0">
          {isSubscribed || isOwnLead ? (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald" /> {lead.leadType === "Buy" ? t("lead.buyerContact") : t("lead.sellerContact")}
                </h2>
                {isOwnLead && <Badge className="bg-primary/10 text-primary border-none text-[10px]">Your Listing</Badge>}
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-xl">
                  {lead.posterName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{lead.posterName}</span>
                    <Badge variant="outline" className="text-[10px]">{lead.posterRole || "Trader"}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                    <Phone className="h-3.5 w-3.5" /> {lead.posterPhone || "+91 XXXXX XXXXX"}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleChat} className="flex-1 bg-emerald hover:bg-emerald/90 text-white font-bold h-11 rounded-xl shadow-md transition-all active:scale-[0.98]">
                  <MessageCircle className="h-4 w-4 mr-2" /> {t("lead.chat")}
                </Button>
                {!isOwnLead && (
                  <Button variant="outline" className="flex-1 font-bold h-11 rounded-xl border-slate-200" onClick={() => navigate(`/review/${lead.id}`)}>
                    <Star className="h-4 w-4 mr-2 text-gold fill-gold" /> {t("lead.review")}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="p-5 space-y-4 blur-sm select-none pointer-events-none opacity-40">
                <h2 className="text-sm font-semibold">Contact Details</h2>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-200" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                <div className="p-3 rounded-2xl bg-gold/10 text-gold mb-3 ring-8 ring-gold/5">
                  <Lock className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">{t("lead.contactHidden")}</p>
                <p className="text-xs text-slate-500 mb-4 max-w-[200px] leading-relaxed">{t("lead.unlockContact")}</p>
                <Button onClick={() => navigate("/subscribe")} className="bg-gold hover:bg-gold/90 text-gold-foreground font-black px-8 h-11 rounded-xl shadow-lg transition-all active:scale-[0.98]">
                  <Crown className="h-4 w-4 mr-2" /> {t("lead.premiumUnlock")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">{t("lead.reviewsFor")} {lead.posterName}</h2>
        <ReviewsList userId={lead.posterId} />
      </div>

      {!isOwnLead && (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 text-[11px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => toast.success(t("lead.reportSubmitted"))}>
            <Flag className="h-3.5 w-3.5 mr-1" /> {t("lead.report")}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-[11px] font-bold text-slate-400 hover:text-slate-900" onClick={() => isBlocked ? toast.success("Unblocked") : toast.success("Blocked")}>
            <Ban className="h-3.5 w-3.5 mr-1" /> {isBlocked ? t("lead.unblock") : t("lead.block")}
          </Button>
        </div>
      )}
    </div>
  );
}
