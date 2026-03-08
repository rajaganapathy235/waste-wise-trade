import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Send } from "lucide-react";
import { toast } from "sonner";

function StarRating({ rating, onRate, size = "md" }: { rating: number; onRate?: (n: number) => void; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onRate?.(n)}
          disabled={!onRate}
          className={onRate ? "cursor-pointer" : "cursor-default"}
        >
          <Star className={`${s} ${n <= rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
}

// Reviews list for a user
export function ReviewsList({ userId }: { userId: string }) {
  const { reviews } = useApp();
  const userReviews = reviews.filter((r) => r.revieweeId === userId);

  if (userReviews.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-4">No reviews yet</p>;
  }

  return (
    <div className="space-y-2">
      {userReviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium">{review.reviewerName}</p>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground">{review.comment}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">{review.createdAt}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Write review page
export default function WriteReview() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { leads, user, reviews, setReviews } = useApp();
  const lead = leads.find((l) => l.id === leadId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!lead) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Lead not found.
        <Button variant="link" onClick={() => navigate("/")}>Go back</Button>
      </div>
    );
  }

  const existingReview = reviews.find((r) => r.reviewerId === user.id && r.leadId === leadId);

  const handleSubmit = () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    if (!comment.trim()) { toast.error("Please write a comment"); return; }

    const newReview = {
      id: `r-${Date.now()}`,
      reviewerId: user.id,
      reviewerName: user.businessName,
      revieweeId: lead.posterId,
      leadId: lead.id,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    setReviews((prev) => [newReview, ...prev]);
    toast.success("Review submitted! Thank you for your feedback.");
    navigate(-1);
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center gap-2 mb-1">
        <Star className="h-5 w-5 text-gold" />
        <h1 className="text-lg font-bold">Rate & Review</h1>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Rate your experience with <strong>{lead.posterName}</strong> for {lead.materialType}
      </p>

      {existingReview ? (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium mb-2">You already reviewed this deal</p>
            <StarRating rating={existingReview.rating} />
            <p className="text-xs text-muted-foreground mt-2">"{existingReview.comment}"</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Deal</p>
              <p className="text-sm font-medium">{lead.materialType} — {lead.quantity.toLocaleString()} kg @ ₹{lead.pricePerKg}/kg</p>
              <Badge variant="outline" className="text-[10px] mt-1">{lead.posterRole}</Badge>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm font-medium mb-2">Your Rating</p>
            <div className="flex justify-center">
              <StarRating rating={rating} onRate={setRating} />
            </div>
            {rating > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {rating === 1 ? "Poor" : rating === 2 ? "Below Average" : rating === 3 ? "Average" : rating === 4 ? "Good" : "Excellent"}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium mb-1">Your Review</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was your experience? Quality of material, communication, delivery…"
              className="text-sm min-h-[100px]"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full bg-gold hover:bg-gold/90 text-gold-foreground font-semibold">
            <Send className="h-4 w-4 mr-1" /> Submit Review
          </Button>
        </div>
      )}

      {/* Existing reviews for this user */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-2">Reviews for {lead.posterName}</h2>
        <ReviewsList userId={lead.posterId} />
      </div>
    </div>
  );
}
