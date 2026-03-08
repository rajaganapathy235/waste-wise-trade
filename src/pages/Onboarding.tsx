import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { UserRole, DISTRICTS } from "@/lib/mockData";
import { useApp } from "@/lib/appContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Phone, Briefcase, Building2, Upload, ShoppingCart, Tag, Crown, MessageCircle, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";

const ALL_ROLES: UserRole[] = ["Waste Trader", "Recycling Mill", "OE Mill", "Job Worker"];

export default function Onboarding() {
  const { setUser, setIsLoggedIn } = useApp();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [district, setDistrict] = useState("");

  const totalSteps = 6;

  const handleSendOtp = () => {
    if (phone.length < 10) { toast.error("Enter a valid phone number"); return; }
    setOtpSent(true);
    toast.success("OTP sent! (Demo: use 123456)");
  };

  const handleVerifyOtp = () => {
    if (otp.length < 6) { toast.error("Enter 6-digit OTP"); return; }
    setStep(2);
  };

  const handleRolesNext = () => {
    if (roles.length === 0) { toast.error("Select at least one role"); return; }
    setStep(3);
  };

  const handleBusinessNext = () => {
    if (!businessName || !gstNumber || !district) { toast.error("Fill all fields"); return; }
    setStep(4);
  };

  const handleComplete = () => {
    setUser((u) => ({
      ...u,
      phone: `+91 ${phone}`,
      businessName,
      gstNumber,
      locationDistrict: district,
      roles,
      isVerified: false,
      verificationStatus: "none",
    }));
    setIsLoggedIn(true);
    toast.success("Welcome to HiTex! 🎉");
  };

  const toggleRole = (role: UserRole) => {
    setRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-navy text-navy-foreground px-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold">Hi<span className="text-emerald">Tex</span></h1>
        <p className="text-sm text-navy-foreground/70 mt-1">India's Textile Recycling Marketplace</p>
      </div>

      {/* Steps indicator */}
      <div className="flex gap-1 px-6 py-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>

      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* Step 1: OTP */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Login with OTP</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Enter your phone number to get started</p>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Phone Number</Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-secondary rounded-md text-sm font-medium">+91</span>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="98765 43210" className="font-mono" />
                </div>
              </div>
              {!otpSent ? (
                <Button onClick={handleSendOtp} className="w-full bg-primary">Send OTP <ArrowRight className="h-4 w-4 ml-1" /></Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">Enter OTP</Label>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (<InputOTPSlot key={i} index={i} />))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button onClick={handleVerifyOtp} className="w-full bg-primary">Verify & Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Roles */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Your Business Role</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Select all that apply</p>
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
            <Button onClick={handleRolesNext} className="w-full bg-primary">Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        )}

        {/* Step 3: Business Details */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Business Details</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Set up your business profile with location and details</p>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Business Name *</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="ABC Textiles" />
              </div>
              <div>
                <Label className="text-xs">GST Number *</Label>
                <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="33AABCU9603R1ZM" className="font-mono uppercase" />
              </div>
              <div>
                <Label className="text-xs">District *</Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>{DISTRICTS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs">Documents</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary transition-colors">
                    <Upload className="h-5 w-5" /><span className="text-[10px]">Selfie / Photo</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary transition-colors">
                    <Upload className="h-5 w-5" /><span className="text-[10px]">GST Certificate</span>
                  </button>
                </div>
              </div>
              <Button onClick={handleBusinessNext} className="w-full bg-primary">Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {/* Step 4: How Buy & Sell Works */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-bold">How HiTex Works</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Understand the two types of leads</p>

            <Card className="mb-4 border-emerald/30 bg-emerald/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-5 w-5 text-emerald" />
                  <h3 className="font-semibold text-sm">Sell Leads</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Post what you have to sell — textile waste, fiber, or yarn. Set your price and quantity. Buyers will find and contact you.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-4 border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm">Buy Leads</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Post what you need to buy. Specify the material, quantity and your target price. Sellers will reach out to you.
                </p>
              </CardContent>
            </Card>

            <div className="bg-secondary rounded-lg p-3 mb-6">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> You can post both Buy and Sell leads. Many traders do both — buy waste and sell processed fiber!
              </p>
            </div>

            <Button onClick={() => setStep(5)} className="w-full bg-primary">Got it! <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        )}

        {/* Step 5: Premium Benefits */}
        {step === 5 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-bold">Go Premium</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Unlock the full power of HiTex</p>

            <div className="space-y-3 mb-6">
              <Card className="border-gold/30 bg-gold/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">Direct Chat</h3>
                    <p className="text-xs text-muted-foreground">Message buyers and sellers directly. Negotiate prices, request samples, and close deals — all in-app.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gold/30 bg-gold/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">Unlock Contact Details</h3>
                    <p className="text-xs text-muted-foreground">See phone numbers and business names of all lead posters. Free users see masked info.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gold/30 bg-gold/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">Verified Badge</h3>
                    <p className="text-xs text-muted-foreground">Priority verification and a trust badge on your listings. Stand out from the crowd.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button className="w-full bg-gold hover:bg-gold/90 text-gold-foreground font-semibold mb-3">
              <Crown className="h-4 w-4 mr-1" /> Subscribe — ₹10,000/yr
            </Button>
            <Button variant="ghost" onClick={() => setStep(6)} className="w-full text-muted-foreground text-xs">
              Skip for now →
            </Button>
          </div>
        )}

        {/* Step 6: Verification intro */}
        {step === 6 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-emerald" />
              <h2 className="text-lg font-bold">Get Verified</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Build trust with a verified business badge</p>

            <Card className="mb-4">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Upload your business documents to get a <strong>Verified ✓</strong> badge on your profile and listings. This helps buyers and sellers trust you.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald/10 flex items-center justify-center text-emerald text-[10px]">1</div>
                    <span>GST Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald/10 flex items-center justify-center text-emerald text-[10px]">2</div>
                    <span>Business Incorporation / Registration</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald/10 flex items-center justify-center text-emerald text-[10px]">3</div>
                    <span>Tax Documents (optional)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:border-emerald transition-colors">
                <Upload className="h-5 w-5" /><span className="text-[10px]">Incorporation Cert</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:border-emerald transition-colors">
                <Upload className="h-5 w-5" /><span className="text-[10px]">Tax Documents</span>
              </button>
            </div>

            <Button onClick={handleComplete} className="w-full bg-emerald hover:bg-emerald/90 text-emerald-foreground font-semibold mb-3">
              Complete Setup 🎉
            </Button>
            <Button variant="ghost" onClick={handleComplete} className="w-full text-muted-foreground text-xs">
              Skip verification for now →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
