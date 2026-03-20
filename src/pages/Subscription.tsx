import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Shield, CheckCircle2, Zap, Star, MessageCircle, Phone, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const BENEFITS = [
  { icon: Zap, text: "Unlimited Posting & Contacts" },
  { icon: Shield, text: "Gold Badge — Mills prefer Verified Traders" },
  { icon: Star, text: "Instant Approval — Skip the Admin queue" },
  { icon: TrendingUp, text: "Priority Listing in Search Results" },
  { icon: MessageCircle, text: "Direct Chat with All Traders" },
  { icon: Phone, text: "Unlock Contact Numbers" },
];

export default function Subscription() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "quarterly">("annual");

  const handlePayment = () => {
    toast.success("Redirecting to payment...");
    // In a real app, integrate Razorpay/Stripe here
    setTimeout(() => navigate("/subscription-success"), 1500);
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-navy text-navy-foreground px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <span className="text-lg font-bold">Hi<span className="text-emerald">Tex</span></span>
        <span className="text-xs opacity-80">Trusted Partner</span>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-2">
            <Crown className="h-8 w-8 text-gold" />
          </div>
          <h1 className="text-xl font-bold">Become a Trusted Partner 🛡️</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Choose the plan that fits your trade volume.<br />
            Both include the <strong className="text-gold">Trusted Badge</strong> and <strong>Unlimited Leads</strong>.
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-3">
          {/* Annual Plan */}
          <Card
            className={`cursor-pointer transition-all relative overflow-hidden ${
              selectedPlan === "annual"
                ? "border-gold ring-2 ring-gold/30 shadow-lg"
                : "border-border hover:border-gold/40"
            }`}
            onClick={() => setSelectedPlan("annual")}
          >
            <div className="absolute top-0 right-0">
              <Badge className="bg-gold text-gold-foreground rounded-none rounded-bl-lg text-[10px] font-bold px-2 py-1">
                SAVE 20%+
              </Badge>
            </div>
            <CardContent className="p-4 pt-5">
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedPlan === "annual" ? "border-gold bg-gold" : "border-muted-foreground/30"
                }`}>
                  {selectedPlan === "annual" && <CheckCircle2 className="h-3 w-3 text-gold-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👑</span>
                    <h3 className="font-bold text-sm">The Annual Leader</h3>
                  </div>
                  <div className="mt-1">
                    <span className="text-2xl font-bold">₹9,999</span>
                    <span className="text-sm text-muted-foreground"> / 1 Year</span>
                    <span className="text-[10px] text-muted-foreground block">(Incl. GST)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best for <strong>Big Mills & High-Volume Traders</strong>
                  </p>
                  <Badge variant="outline" className="mt-2 text-[10px] border-emerald/30 text-emerald">
                    Effective: only ₹833/month
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quarterly Plan */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedPlan === "quarterly"
                ? "border-primary ring-2 ring-primary/30 shadow-lg"
                : "border-border hover:border-primary/40"
            }`}
            onClick={() => setSelectedPlan("quarterly")}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedPlan === "quarterly" ? "border-primary bg-primary" : "border-muted-foreground/30"
                }`}>
                  {selectedPlan === "quarterly" && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💳</span>
                    <h3 className="font-bold text-sm">The Quarterly Pro</h3>
                  </div>
                  <div className="mt-1">
                    <span className="text-2xl font-bold">₹3,600</span>
                    <span className="text-sm text-muted-foreground"> / 3 Months</span>
                    <span className="text-[10px] text-muted-foreground block">(Incl. GST)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best for <strong>testing the platform</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-center">Why Upgrade?</h2>
          <div className="grid grid-cols-1 gap-2">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 px-3 py-2.5 bg-secondary/50 rounded-lg">
                <Icon className="h-4 w-4 text-emerald shrink-0" />
                <span className="text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-2 pt-2 pb-4">
          <Button
            onClick={handlePayment}
            className={`w-full font-semibold text-base h-12 ${
              selectedPlan === "annual"
                ? "bg-gold hover:bg-gold/90 text-gold-foreground"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            <Crown className="h-4 w-4 mr-1.5" />
            Pay {selectedPlan === "annual" ? "₹9,999 (Best Value)" : "₹3,600"}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground">
            Secure payment via Razorpay. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
