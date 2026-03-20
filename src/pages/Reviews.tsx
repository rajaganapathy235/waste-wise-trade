import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Send, Loader2, Award, Clock } from "lucide-react";
import { toast } from "sonner";
import { useReviews, useCreateReview } from "@/hooks/useReviews";
import { useLead } from "@/hooks/useLeads";

function StarRating({ rating, onRate, size = "md" }: { rating: number; onRate?: (n: number) => void; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-3.5 w-3.5" : "h-6 w-6";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onRate?.(n)} disabled={!onRate} className={`${onRate ? "cursor-pointer active:scale-95" : "cursor-default"} transition-transform`}>
          <Star className={`${s} ${n <= rating ? "fill-gold text-gold" : "text-slate-200"}`} />
        </button>
      ))}
    </div>
  );
}

export function ReviewsList({ userId }: { userId: string }) {
  const { t } = useI18n();
  const { data: reviews = [], isLoading } = useReviews(userId);

  if (isLoading) {
      return (
          <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-200" />
          </div>
      );
  }

  if (reviews.length === 0) {
    return (
        <div className="text-center py-8 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t("review.noReviews")}</p>
        </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review: any) => (
        <Card key={review.id} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-primary font-bold text-xs border border-slate-100">
                    {review.reviewer_name?.[0] || "?"}
                </div>
                <p className="text-sm font-black text-slate-800">{review.reviewer_name}</p>
              </div>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed italic">"{review.comment}"</p>
            <div className="flex items-center gap-1 text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-3">
                <Clock className="h-2.5 w-2.5" />
                {new Date(review.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function WriteReview() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const { t } = useI18n();
  const { data: lead, isLoading: isLeadLoading } = useLead(leadId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { mutate: createReview, isPending } = useCreateReview();

  if (isLeadLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl m-4 shadow-sm border border-slate-100">
        <h2 className="text-lg font-black text-slate-900 mb-2">{t("lead.notFound")}</h2>
        <Button variant="outline" className="rounded-xl px-8" onClick={() => navigate("/")}>{t("lead.goBack")}</Button>
      </div>
    );
  }

  const ratingLabels = [t("review.poor"), t("review.belowAvg"), t("review.average"), t("review.good"), t("review.excellent")];

  const handleSubmit = () => {
    if (rating === 0) { toast.error(t("review.selectRating")); return; }
    if (!comment.trim()) { toast.error(t("review.writeComment")); return; }
    
    createReview({
      reviewer_id: user.id,
      reviewer_name: user.businessName,
      reviewee_id: lead.posterId,
      lead_id: lead.id,
      rating,
      comment: comment.trim()
    }, {
      onSuccess: () => {
        toast.success(t("review.submitted"));
        navigate(-1);
      },
      onError: (err: any) => {
        toast.error(`Submission failed: ${err.message}`);
      }
    });
  };

  return (
    <div className="px-6 pt-8 pb-12 max-w-md mx-auto animate-fade-in bg-slate-50 min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 mb-8 group">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t("review.back")}
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-gold/10 text-gold shadow-sm">
                <Award className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">{t("review.rateReview")}</h1>
        </div>
        <p className="text-sm text-slate-400 font-medium">
          {t("review.rateExperience")} <span className="text-slate-900 font-bold">{lead.posterName}</span>
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden p-6 border-l-4 border-l-primary">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Verified Transaction</p>
            <h3 className="text-base font-bold text-slate-800 leading-tight">{lead.materialType}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                <span>{lead.quantity.toLocaleString()} kg</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>₹{lead.pricePerKg}/kg</span>
            </div>
        </Card>

        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{t("review.yourRating")}</p>
            <div className="flex justify-center mb-4">
                <StarRating rating={rating} onRate={setRating} />
            </div>
            <div className="h-6">
                {rating > 0 && (
                    <Badge className="bg-emerald/10 text-emerald border-none text-[10px] font-black px-4 py-1 animate-in zoom-in-95">
                        {ratingLabels[rating - 1].toUpperCase()}
                    </Badge>
                )}
            </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("review.yourReview")}</Label>
          <textarea 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            placeholder={t("review.placeholder")} 
            className="w-full min-h-[120px] p-5 rounded-3xl bg-white border border-slate-100 shadow-sm text-sm focus:ring-2 ring-primary/20 outline-none transition-all" 
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isPending}
          className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> SUBMIT REVIEW</>}
        </Button>
      </div>

      <div className="mt-12">
        <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="h-px bg-slate-200 flex-1" />
            LATEST FEEDBACK
            <span className="h-px bg-slate-200 flex-1" />
        </h2>
        <ReviewsList userId={lead.posterId} />
      </div>
    </div>
  );
}
