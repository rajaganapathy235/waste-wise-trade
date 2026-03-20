import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { UserRole, DISTRICTS } from "@/lib/mockData";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Phone, Briefcase, Building2, Upload, Crown, Shield, Sparkles, Handshake, Rocket } from "lucide-react";
import { toast } from "sonner";

const ALL_ROLES: UserRole[] = ["Waste Trader", "Recycling Mill", "OE Mill", "Job Worker"];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1 px-6 py-4">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= current ? "bg-primary" : "bg-secondary"}`} />
      ))}
    </div>
  );
}

export default function Onboarding() {
  const { setUser, setIsLoggedIn } = useApp();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [district, setDistrict] = useState("");

  const totalSteps = 5;

  const handleSendOtp = () => {
    if (phone.length < 10) { toast.error(t("onboarding.validPhone")); return; }
    setOtpSent(true);
    toast.success(t("onboarding.otpSent"));
  };
  const handleVerifyOtp = () => {
    if (otp.length < 6) { toast.error(t("onboarding.validOtp")); return; }
    setStep(2);
  };
  const handleRolesNext = () => {
    if (roles.length === 0) { toast.error(t("onboarding.selectRole")); return; }
    setStep(3);
  };
  const handleBusinessNext = () => {
    if (!businessName || !gstNumber || !district) { toast.error(t("onboarding.fillAll")); return; }
    setStep(4);
  };
  const handleComplete = () => {
    setUser((u) => ({ ...u, phone: `+91 ${phone}`, businessName, gstNumber, locationDistrict: district, roles, isVerified: false, verificationStatus: "none" }));
    setIsLoggedIn(true);
    toast.success("Welcome to the Network! 🤝");
  };
  const toggleRole = (role: UserRole) => {
    setRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="bg-navy text-navy-foreground px-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold">Hi<span className="text-emerald">Tex</span></h1>
        <p className="text-sm text-navy-foreground/70 mt-1">India's #1 Textile Recycling Network</p>
      </div>

      <StepIndicator current={step} total={totalSteps} />

      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* Step 1: Phone OTP */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">{t("onboarding.loginOtp")}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">{t("onboarding.enterPhone")}</p>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">{t("onboarding.phone")}</Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-secondary rounded-md text-sm font-medium">+91</span>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="98765 43210" className="font-mono" />
                </div>
              </div>
              {!otpSent ? (
                <Button onClick={handleSendOtp} className="w-full bg-primary">{t("onboarding.sendOtp")} <ArrowRight className="h-4 w-4 ml-1" /></Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">{t("onboarding.enterOtp")}</Label>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (<InputOTPSlot key={i} index={i} />))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button onClick={handleVerifyOtp} className="w-full bg-primary">{t("onboarding.verifyOtp")} <ArrowRight className="h-4 w-4 ml-1" /></Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Role Selection */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">{t("onboarding.businessRole")}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">{t("onboarding.selectAll")}</p>
            <div className="space-y-3 mb-6">
              {ALL_ROLES.map((role) => (
                <Card key={role} className={`cursor-pointer transition-all ${roles.includes(role) ? "border-primary ring-1 ring-primary" : ""}`} onClick={() => toggleRole(role)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Checkbox checked={roles.includes(role)} />
                    <span className="text-sm font-medium">{role}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button onClick={handleRolesNext} className="w-full bg-primary">{t("onboarding.continue")} <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        )}

        {/* Step 3: Business Details + KYC */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">{t("onboarding.businessDetails")}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">{t("onboarding.businessSetup")}</p>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">{t("onboarding.businessName")}</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="ABC Textiles" />
              </div>
              <div>
                <Label className="text-xs">{t("onboarding.gstNumber")}</Label>
                <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="33AABCU9603R1ZM" className="font-mono uppercase" />
              </div>
              <div>
                <Label className="text-xs">{t("onboarding.district")}</Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger><SelectValue placeholder={t("onboarding.selectDistrict")} /></SelectTrigger>
                  <SelectContent>{DISTRICTS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs">Upload GST / Trade License</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary transition-colors active:scale-[0.97]">
                    <Upload className="h-5 w-5" /><span className="text-[10px]">{t("onboarding.gstCert")}</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary transition-colors active:scale-[0.97]">
                    <Upload className="h-5 w-5" /><span className="text-[10px]">{t("onboarding.selfie")}</span>
                  </button>
                </div>
              </div>
              <Button onClick={handleBusinessNext} className="w-full bg-primary">{t("onboarding.continue")} <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {/* Step 4: Welcome to the Network */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Handshake className="h-5 w-5 text-emerald" />
              <h2 className="text-lg font-bold">Welcome to the Network! 🤝</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              We connect the biggest <strong>Recycling Mills</strong> and <strong>Waste Traders</strong> across India.
              To maintain a <strong>100% Fraud-Free</strong> marketplace, all members undergo a quick Admin Verification.
            </p>

            <Card className="mb-4 border-emerald/30 bg-emerald/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-emerald" />
                  <h3 className="font-semibold text-sm">Admin Verification</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your GST / Trade License is being reviewed. You'll be verified within 24 hours.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-4 border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm">3 Free Credits to Explore</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  While you wait, you have <strong>3 free credits</strong> to explore the market, post leads,
                  and connect with traders. Let's get your first load moved!
                </p>
              </CardContent>
            </Card>

            <div className="bg-secondary rounded-lg p-3 mb-6">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Pro Tip:</strong> Verified posts get 5x more inquiries than standard ones.
                Post your current stock as soon as you're in!
              </p>
            </div>

            <Button onClick={() => setStep(5)} className="w-full bg-primary">
              Got It — Let's Go! <Rocket className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 5: Premium Upgrade Pitch */}
        {step === 5 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-bold">Become a Trusted Partner 🛡️</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              Unlock <strong>unlimited access</strong> and the <strong className="text-gold">Gold Verification Badge</strong>.
            </p>

            <div className="space-y-3 mb-6">
              {/* Annual */}
              <Card className="border-gold/40 bg-gold/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gold text-gold-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">BEST VALUE</div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">👑</span>
                    <h3 className="font-bold text-sm">Annual Leader</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">₹9,999</span>
                    <span className="text-xs text-muted-foreground">/ year (Incl. GST)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Effective: only ₹833/month · For Big Mills & High-Volume Traders</p>
                </CardContent>
              </Card>

              {/* Quarterly */}
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">💳</span>
                    <h3 className="font-bold text-sm">Quarterly Pro</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">₹3,600</span>
                    <span className="text-xs text-muted-foreground">/ 3 months (Incl. GST)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Best for testing the platform</p>
                </CardContent>
              </Card>
            </div>

            {/* Benefits */}
            <div className="space-y-2 mb-6">
              {["Unlimited Posting & Contacts", "Gold Badge — Mills prefer Verified Traders", "Instant Approval — Skip the Admin queue"].map((b) => (
                <div key={b} className="flex items-center gap-2 text-xs">
                  <span className="text-emerald">✅</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-gold hover:bg-gold/90 text-gold-foreground font-semibold mb-3" onClick={() => { toast.success("Redirecting to payment..."); }}>
              <Crown className="h-4 w-4 mr-1" /> Subscribe — ₹9,999/year
            </Button>
            <Button variant="ghost" onClick={handleComplete} className="w-full text-muted-foreground text-xs">
              Start with 3 Free Credits →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
