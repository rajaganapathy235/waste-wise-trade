import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Phone, Loader2, Mail, Lock } from "lucide-react";

type AuthMode = "email" | "phone" | "otp";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState<AuthMode>("email");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) toast.error(error.message);
      else toast.success("Account created! You are now logged in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) toast.error(error.message);
    }
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }
    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    setLoading(false);
    if (error) toast.error(error.message);
    else { setMode("otp"); toast.success("OTP sent to your phone"); }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    const { error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: "sms" });
    setLoading(false);
    if (error) toast.error(error.message);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setLoading(false);
    if (error) toast.error(error instanceof Error ? error.message : "Google sign-in failed");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Branding */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
              <span className="text-2xl font-extrabold text-primary-foreground">W</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">WasteWise Trade</h1>
            <p className="text-sm text-muted-foreground">India's #1 Waste Trading Marketplace</p>
          </div>

          {mode === "email" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleEmailAuth} disabled={loading} className="w-full h-12 text-base font-bold">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    {isSignUp ? "Sign Up" : "Login"}
                  </>
                )}
              </Button>
              <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-sm text-primary hover:underline">
                {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMode("phone")} className="flex-1 h-12">
                  <Phone className="h-4 w-4 mr-2" /> Phone OTP
                </Button>
                <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="flex-1 h-12">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
              </div>
            </div>
          )}

          {mode === "phone" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground bg-secondary rounded-lg px-3 py-2.5">+91</span>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="flex-1"
                    maxLength={10}
                  />
                </div>
              </div>
              <Button onClick={handleSendOTP} disabled={loading} className="w-full h-12 text-base font-bold">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <><Phone className="h-4 w-4 mr-2" /> Send OTP</>
                )}
              </Button>
              <button onClick={() => setMode("email")} className="w-full text-sm text-primary hover:underline">
                ← Back to email login
              </button>
            </div>
          )}

          {mode === "otp" && (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Enter the 6-digit code sent to <span className="font-bold text-foreground">+91{phone}</span>
              </p>
              <Input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-xl tracking-widest font-bold"
                maxLength={6}
              />
              <Button onClick={handleVerifyOTP} disabled={loading} className="w-full h-12 text-base font-bold">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Login"}
              </Button>
              <button onClick={() => setMode("phone")} className="w-full text-sm text-primary hover:underline">
                Change phone number
              </button>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
