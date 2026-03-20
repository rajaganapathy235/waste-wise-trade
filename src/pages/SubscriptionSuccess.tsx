import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Rocket, CheckCircle2, ArrowRight } from "lucide-react";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Celebration header */}
      <div className="bg-gold/10 px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/20 mb-4 animate-fade-in">
          <Crown className="h-10 w-10 text-gold" />
        </div>
        <h1 className="text-2xl font-bold animate-fade-in">
          🎊 Congratulations, Trusted Partner!
        </h1>
        <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
          Your <span className="text-gold font-semibold">Gold Badge</span> is now active.
        </p>
      </div>

      <div className="px-6 py-8 space-y-6 flex-1">
        {/* Status updates */}
        <div className="space-y-3">
          {[
            "Gold Verification Badge activated",
            "Unlimited posting & contacts enabled",
            "Profile highlighted to all major Mill Owners",
            "Instant Approval — no more Admin queue",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald shrink-0" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>

        {/* Pro Tip */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Rocket className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Pro Tip</p>
              <p className="text-xs text-muted-foreground mt-1">
                Post your current stock now. <strong>Verified posts get 5x more inquiries</strong> than standard ones.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => navigate("/post-lead")}
            className="w-full bg-emerald hover:bg-emerald/90 text-emerald-foreground font-semibold h-12"
          >
            <Rocket className="h-4 w-4 mr-1.5" /> Post a Lead Now
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Explore Marketplace <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
