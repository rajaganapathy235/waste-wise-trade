import { useApp } from "@/lib/appContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Crown, MapPin, FileText, LogOut, Upload, Ban } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, setUser, setIsLoggedIn } = useApp();

  const handleSubmitVerification = () => {
    setUser((u) => ({ ...u, verificationStatus: "pending" }));
    toast.success("Verification documents submitted! We'll review within 24 hours.");
  };

  return (
    <div className="px-4 pt-4 pb-8">
      <h1 className="text-lg font-bold mb-4">Profile</h1>

      {/* Business Card */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-bold text-foreground">{user.businessName}</h2>
              <p className="text-xs text-muted-foreground">{user.phone}</p>
            </div>
            {user.verificationStatus === "verified" ? (
              <Badge className="bg-emerald/10 text-emerald border-emerald/20 text-[10px]">
                <Shield className="h-3 w-3 mr-0.5" /> Verified
              </Badge>
            ) : user.verificationStatus === "pending" ? (
              <Badge variant="secondary" className="text-[10px]">⏳ Pending</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">Unverified</Badge>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs">GST: {user.gstNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs">{user.locationDistrict}, Tamil Nadu</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {user.roles.map((role) => (
              <Badge key={role} variant="outline" className="text-[10px]">{role}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification Section */}
      {user.verificationStatus === "none" && (
        <Card className="mb-4 border-emerald/20">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <Shield className="h-4 w-4 text-emerald" /> Get Verified
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              Upload documents to earn a trust badge on your profile and listings.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button className="flex flex-col items-center gap-1 p-3 border-2 border-dashed rounded-lg text-muted-foreground hover:border-emerald transition-colors">
                <Upload className="h-4 w-4" /><span className="text-[8px]">GST Cert</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 border-2 border-dashed rounded-lg text-muted-foreground hover:border-emerald transition-colors">
                <Upload className="h-4 w-4" /><span className="text-[8px]">Incorp Cert</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 border-2 border-dashed rounded-lg text-muted-foreground hover:border-emerald transition-colors">
                <Upload className="h-4 w-4" /><span className="text-[8px]">Tax Docs</span>
              </button>
            </div>
            <Button onClick={handleSubmitVerification} size="sm" className="w-full bg-emerald hover:bg-emerald/90 text-emerald-foreground">
              Submit for Verification
            </Button>
          </CardContent>
        </Card>
      )}

      {user.verificationStatus === "pending" && (
        <Card className="mb-4 border-gold/20 bg-gold/5">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium">⏳ Verification Under Review</p>
            <p className="text-xs text-muted-foreground mt-1">We'll notify you once verified (usually within 24 hours).</p>
          </CardContent>
        </Card>
      )}

      {/* Subscription */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-gold" /> Subscription
            </h2>
            <Badge className={user.isSubscribed ? "bg-emerald/10 text-emerald border-emerald/20 text-[10px]" : "text-[10px]"} variant={user.isSubscribed ? "outline" : "secondary"}>
              {user.isSubscribed ? "Active" : "Free"}
            </Badge>
          </div>
          {!user.isSubscribed && (
            <Button className="w-full bg-gold hover:bg-gold/90 text-gold-foreground font-semibold mt-2">
              <Crown className="h-4 w-4 mr-1" /> Upgrade to Premium — ₹10,000/yr
            </Button>
          )}
          {user.isSubscribed && user.subscriptionExpiry && (
            <p className="text-xs text-muted-foreground">Expires: {user.subscriptionExpiry}</p>
          )}
        </CardContent>
      </Card>

      {/* Blocked Users */}
      {user.blockedUsers.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <Ban className="h-4 w-4 text-destructive" /> Blocked Users
            </h2>
            <p className="text-xs text-muted-foreground">{user.blockedUsers.length} user(s) blocked</p>
          </CardContent>
        </Card>
      )}

      {/* Demo toggle */}
      <div className="flex items-center justify-between bg-secondary rounded-lg p-3 mb-3">
        <span className="text-xs text-muted-foreground">Demo: Toggle subscription</span>
        <Switch checked={user.isSubscribed} onCheckedChange={(v) => setUser((u) => ({ ...u, isSubscribed: v }))} />
      </div>
      <div className="flex items-center justify-between bg-secondary rounded-lg p-3 mb-4">
        <span className="text-xs text-muted-foreground">Demo: Toggle verified</span>
        <Switch
          checked={user.verificationStatus === "verified"}
          onCheckedChange={(v) => setUser((u) => ({ ...u, verificationStatus: v ? "verified" : "none" }))}
        />
      </div>

      <Button variant="outline" className="w-full text-destructive" onClick={() => setIsLoggedIn(false)}>
        <LogOut className="h-4 w-4 mr-1" /> Logout
      </Button>
    </div>
  );
}
