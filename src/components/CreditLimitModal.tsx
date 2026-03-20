import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, Crown, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CreditLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeLeadCount?: number;
}

export default function CreditLimitModal({ open, onOpenChange, activeLeadCount = 47 }: CreditLimitModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg">Business is Booming! 📈</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You've used your <strong className="text-foreground">3 free credits</strong> for this month.
            There are currently <strong className="text-primary">{activeLeadCount} high-volume requirements</strong> waiting
            for a trusted partner like you.
          </p>

          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
            <p className="text-xs text-destructive font-medium">
              ⚡ Don't let your competitors get there first.
            </p>
          </div>

          <p className="text-sm font-medium">
            Upgrade to <span className="text-gold">Trusted Partner</span> status to unlock
            unlimited access and get the Gold Verification Badge.
          </p>

          <div className="space-y-2 pt-2">
            <Button
              onClick={() => { onOpenChange(false); navigate("/subscription"); }}
              className="w-full bg-gold hover:bg-gold/90 text-gold-foreground font-semibold"
            >
              <Crown className="h-4 w-4 mr-1" /> View Plans & Upgrade
            </Button>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full text-muted-foreground text-xs"
            >
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
