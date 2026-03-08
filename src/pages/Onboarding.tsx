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
import { ArrowRight, Phone, Briefcase, Building2, Upload } from "lucide-react";
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

  const handleComplete = () => {
    if (!businessName || !gstNumber || !district) { toast.error("Fill all fields"); return; }
    setUser((u) => ({
      ...u,
      phone: `+91 ${phone}`,
      businessName,
      gstNumber,
      locationDistrict: district,
      roles,
      isVerified: false,
    }));
    setIsLoggedIn(true);
    toast.success("Registration complete! Verification pending.");
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
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>

      <div className="flex-1 px-6 pb-8">
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
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    className="font-mono"
                  />
                </div>
              </div>

              {!otpSent ? (
                <Button onClick={handleSendOtp} className="w-full bg-primary">
                  Send OTP <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">Enter OTP</Label>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button onClick={handleVerifyOtp} className="w-full bg-primary">
                    Verify & Continue <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
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
                <Card
                  key={role}
                  className={`cursor-pointer transition-all ${roles.includes(role) ? "border-primary ring-1 ring-primary" : ""}`}
                  onClick={() => toggleRole(role)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Checkbox checked={roles.includes(role)} />
                    <span className="text-sm font-medium">{role}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={handleRolesNext} className="w-full bg-primary">
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 3: Business Details */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Business Details</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Complete your business profile</p>

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
                  <SelectContent>
                    {DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Document uploads placeholder */}
              <div className="space-y-3">
                <Label className="text-xs">Documents</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary transition-colors">
                    <Upload className="h-5 w-5" />
                    <span className="text-[10px]">Selfie / Photo</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary transition-colors">
                    <Upload className="h-5 w-5" />
                    <span className="text-[10px]">GST Certificate</span>
                  </button>
                </div>
              </div>

              <Button onClick={handleComplete} className="w-full bg-emerald hover:bg-emerald/90 text-emerald-foreground font-semibold">
                Complete Registration
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
