import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Crown, MapPin, FileText, LogOut, Upload, Ban, Star, ArrowLeft, Loader2, Sparkles, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ReviewsList } from "./Reviews";
import { useReviews } from "@/hooks/useReviews";

export default function Profile() {
  const { user, setUser } = useApp();
  const { t } = useI18n();
  const navigate = useNavigate();

  const { data: reviews = [], isLoading: isReviewsLoading } = useReviews(user.id);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const handleSubmitVerification = async () => {
    const { error } = await supabase
        .from("profiles")
        .update({ verification_status: "pending" })
        .eq("id", user.id);
    
    if (error) {
        toast.error(`Error: ${error.message}`);
        return;
    }
    
    setUser((u) => ({ ...u, verificationStatus: "pending" }));
    toast.success(t("profile.verificationSubmitted"));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/onboarding");
  };

  return (
    <div className="px-6 pt-8 pb-12 max-w-md mx-auto animate-fade-in bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-black tracking-tight text-slate-900">{t("profile.title")}</h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Premium Business Card */}
      <Card className="mb-6 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <CardContent className="p-8">
          <div className="flex items-center gap-5 mb-8">
             <div className="h-16 w-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <UserCircle className="h-8 w-8" />
             </div>
             <div className="flex-1">
               <div className="flex items-center gap-2 flex-wrap">
                 <h2 className="text-xl font-black text-slate-900 leading-tight">{user.businessName}</h2>
                 {user.verificationStatus === "verified" ? (
                   <Shield className="h-4 w-4 text-emerald fill-emerald/10" title={t("profile.verified")} />
                 ) : user.verificationStatus === "pending" ? (
                   <Badge className="bg-amber-100 text-amber-600 border-none text-[8px] font-black uppercase tracking-widest">PENDING</Badge>
                 ) : null}
               </div>
               <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">{user.phone || user.email}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
             <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100/50">
                <div className="p-2 rounded-xl bg-white text-slate-400 shadow-sm">
                   <MapPin className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">District</p>
                   <p className="text-sm font-bold text-slate-700">{user.locationDistrict}, Tamil Nadu</p>
                </div>
             </div>
             {user.roles && user.roles.length > 0 && (
               <div className="flex items-center gap-2 flex-wrap mt-2">
                 {user.roles.map((role) => (
                   <Badge key={role} variant="secondary" className="bg-slate-200/50 text-slate-500 border-none text-[10px] px-3 py-1 font-bold">
                     {role.toUpperCase()}
                   </Badge>
                 ))}
               </div>
             )}
          </div>
        </CardContent>
      </Card>

      {/* Trust & Reputation */}
      <div className="mb-6">
        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 ml-1">REPUTATION</h3>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gold/10 text-gold">
                  <Star className="h-4 w-4 fill-gold" />
                </div>
                <h2 className="text-sm font-black text-slate-800 tracking-tight">{t("profile.trustScore")}</h2>
              </div>
              {avgRating ? (
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-2xl font-black text-slate-900">{avgRating}</span>
                    <span className="text-xs font-bold text-slate-300">/ 5.0</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Based on {reviews.length} reviews</p>
                </div>
              ) : (
                <Badge variant="outline" className="text-[10px] border-slate-100 text-slate-400">NEW TRADER</Badge>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-50">
               <h4 className="text-[11px] font-black text-slate-900 flex items-center gap-1.5 mb-4">
                  <MessageCircle className="h-3.5 w-3.5 text-primary" /> RECENT FEEDBACK
               </h4>
               <ReviewsList userId={user.id} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription & Verification */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <Card 
          onClick={() => navigate("/subscribe")}
          className={`border-none shadow-sm rounded-[2rem] p-6 cursor-pointer group active:scale-[0.98] transition-all overflow-hidden relative ${user.isSubscribed ? 'bg-navy text-white' : 'bg-white text-slate-900'}`}
        >
          {user.isSubscribed && (
            <div className="absolute top-0 right-0 h-32 w-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          )}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
               <div className={`p-2.5 rounded-2xl ${user.isSubscribed ? 'bg-white/10 text-gold' : 'bg-gold/10 text-gold'}`}>
                  <Crown className="h-5 w-5" />
               </div>
               <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${user.isSubscribed ? 'text-white/40' : 'text-slate-400'}`}>PLAN STATUS</p>
                  <p className="font-black tracking-tight">{user.isSubscribed ? 'PREMIUM ACCESS' : 'FREE BASICS'}</p>
               </div>
            </div>
            <ArrowLeft className={`h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1 ${user.isSubscribed ? 'text-white/20' : 'text-slate-200'}`} />
          </div>
        </Card>

        {user.verificationStatus === "none" && (
          <Card 
            onClick={handleSubmitVerification}
            className="border-none shadow-sm rounded-[2.5rem] p-8 cursor-pointer group hover:bg-emerald/5 transition-all text-center border-2 border-emerald/10"
          >
            <div className="p-4 rounded-[1.5rem] bg-emerald/10 text-emerald w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
               <Shield className="h-8 w-8" />
            </div>
            <h3 className="font-black text-slate-900 italic mb-1">{t("profile.getVerified")}</h3>
            <p className="text-xs text-slate-400 mb-6 px-4">{t("profile.uploadDocs")}</p>
            <Button className="w-full bg-emerald hover:bg-emerald/90 text-white font-black h-12 rounded-xl shadow-lg shadow-emerald/10">
               <Sparkles className="h-4 w-4 mr-2" /> SUBMIT FOR KYC
            </Button>
          </Card>
        )}
        
        {user.verificationStatus === "pending" && (
           <Card className="border-none shadow-sm rounded-[2rem] p-6 bg-amber-500/10 text-amber-600 text-center">
              <p className="text-xs font-black tracking-tight uppercase">{t("profile.verificationPending")}</p>
              <p className="text-[10px] font-bold mt-1 opacity-60">Estimation: 24-48 business hours</p>
           </Card>
        )}
      </div>

      {/* Utility Actions */}
      <div className="space-y-4 pt-4">
        {user.roles.includes('admin') && (
           <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-bold text-slate-900 group" onClick={() => navigate("/admin/dashboard")}>
              <Shield className="h-4 w-4 mr-2 text-primary transition-transform group-hover:scale-110" /> ADMIN PORTAL
           </Button>
        )}
        
        <Button 
          variant="outline" 
          className="w-full h-14 rounded-2xl border-slate-200 font-bold text-red-500 hover:bg-red-50 hover:border-red-100 group" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" /> {t("profile.logout")}
        </Button>
      </div>

      <p className="text-[9px] text-center text-slate-300 mt-12 font-bold uppercase tracking-[0.3em]">
        Hi<span className="text-emerald">Tex</span> Secure Protocol V5.2.0
      </p>
    </div>
  );
}
