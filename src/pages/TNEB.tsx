import { useState } from "react";
import { useApp } from "@/lib/appContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Zap, Calendar, IndianRupee, Info } from "lucide-react";
import { toast } from "sonner";

export default function TNEB() {
  const { user, setUser } = useApp();
  const [consumerNo, setConsumerNo] = useState(user.ebConsumerNumber || "");

  const handleSave = () => {
    if (consumerNo.length !== 12) {
      toast.error("Please enter a valid 12-digit EB Consumer Number");
      return;
    }
    setUser((u) => ({ ...u, ebConsumerNumber: consumerNo }));
    toast.success("Consumer number saved!");
  };

  return (
    <div className="px-4 pt-4 pb-8">
      <h1 className="text-lg font-bold mb-1">TNEB Dashboard</h1>
      <p className="text-xs text-muted-foreground mb-4">Track your electricity bills</p>

      {/* Consumer Number Input */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <Label className="text-xs flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-gold" /> EB Consumer Number
          </Label>
          <div className="flex gap-2">
            <Input
              value={consumerNo}
              onChange={(e) => setConsumerNo(e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="123456789012"
              maxLength={12}
              className="font-mono tracking-wider"
            />
            <Button onClick={handleSave} size="sm" className="bg-primary shrink-0">
              Save
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">{consumerNo.length}/12 digits</p>
        </CardContent>
      </Card>

      {/* Bill Info Placeholders */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Next Due Date</p>
            <p className="text-lg font-bold text-muted-foreground/50">--/--/----</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-5 w-5 text-emerald mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Amount Due</p>
            <p className="text-lg font-bold text-muted-foreground/50">₹ ---</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-2 bg-secondary rounded-lg p-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          TNEB bill data will be fetched automatically once the API integration is connected. Save your consumer number to get started.
        </p>
      </div>
    </div>
  );
}
