import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Recycle,
  TrendingUp,
  MessageCircle,
  Shield,
  BarChart3,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Recycle,
    title: "Trade Waste & Materials",
    desc: "Buy and sell textile waste, fiber, yarn across Tamil Nadu's industrial network.",
    color: "hsl(160, 84%, 39%)",
    bg: "bg-emerald/10",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Market Pulse",
    desc: "Live pricing trends and demand heatmaps powered by actual trade data.",
    color: "hsl(217, 91%, 60%)",
    bg: "bg-primary/10",
  },
  {
    icon: MessageCircle,
    title: "Direct Chat & Negotiate",
    desc: "Connect instantly with verified traders. No middlemen, no delays.",
    color: "hsl(45, 93%, 47%)",
    bg: "bg-gold/10",
  },
  {
    icon: Shield,
    title: "Verified Businesses",
    desc: "GST-verified profiles with trust scores. Trade with confidence.",
    color: "hsl(160, 84%, 39%)",
    bg: "bg-emerald/10",
  },
  {
    icon: BarChart3,
    title: "Smart Billing & Invoicing",
    desc: "GST-compliant billing with product catalog and tax management.",
    color: "hsl(217, 91%, 60%)",
    bg: "bg-primary/10",
  },
  {
    icon: Globe,
    title: "Share Your Catalog",
    desc: "Public storefront link to showcase your materials to anyone, anywhere.",
    color: "hsl(45, 93%, 47%)",
    bg: "bg-gold/10",
  },
];

type AuthMode = "landing" | "login" | "signup" | "otp-verify";

export default function Landing() {
  const { t } = useI18n();
  const [activeSlide, setActiveSlide] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const slideInterval = useRef<ReturnType<typeof setInterval>>();

  // Auto-slide
  useEffect(() => {
    if (authMode !== "landing") return;
    slideInterval.current = setInterval(() => {
      setActiveSlide((p) => (p + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(slideInterval.current);
  }, [authMode]);

  const goSlide = (dir: number) => {
    clearInterval(slideInterval.current);
    setActiveSlide((p) => (p + dir + FEATURES.length) % FEATURES.length);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      toast.error("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to verify your account!");
      setAuthMode("login");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setShowPassword(false);
  };

  // ─── Landing / Hero ───
  if (authMode === "landing") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Hero Section */}
        <div className="bg-navy text-navy-foreground relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-12 sm:pb-20">
            {/* Nav */}
            <div className="flex items-center justify-between mb-10 sm:mb-16">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Hi<span className="text-emerald">Tex</span>
              </h1>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-navy-foreground/80 hover:text-navy-foreground hover:bg-white/10"
                  onClick={() => { resetForm(); setAuthMode("login"); }}
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald hover:bg-emerald/90 text-emerald-foreground"
                  onClick={() => { resetForm(); setAuthMode("signup"); }}
                >
                  Sign up
                </Button>
              </div>
            </div>

            {/* Hero text */}
            <div className="max-w-xl">
              <p className="text-emerald font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">
                Tamil Nadu's #1 Textile Marketplace
              </p>
              <h2 className="text-3xl sm:text-5xl font-extrabold leading-[1.1] mb-4 sm:mb-6">
                Trade Smarter.<br />
                <span className="text-emerald">Grow Faster.</span>
              </h2>
              <p className="text-navy-foreground/70 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-md">
                Connect with verified waste traders, recycling mills, and manufacturers. Post leads, negotiate directly, and manage your entire textile business — all in one app.
              </p>
              <div className="flex gap-3">
                <Button
                  className="bg-emerald hover:bg-emerald/90 text-emerald-foreground px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-semibold"
                  onClick={() => { resetForm(); setAuthMode("signup"); }}
                >
                  Get Started Free <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  className="border-navy-foreground/20 text-navy-foreground hover:bg-white/10 h-11 sm:h-12 px-5 sm:px-6"
                  onClick={() => { resetForm(); setAuthMode("login"); }}
                >
                  I have an account
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-emerald/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 right-16 w-32 h-32 sm:w-48 sm:h-48 bg-primary/10 rounded-full translate-y-1/2" />
        </div>

        {/* Feature Slides */}
        <div className="flex-1 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
            <p className="text-center text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest mb-2">
              Everything you need
            </p>
            <h3 className="text-center text-xl sm:text-3xl font-extrabold text-foreground mb-8 sm:mb-12">
              One Platform, Full Control
            </h3>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <Card
                  key={i}
                  className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <f.icon className="h-5 w-5" style={{ color: f.color }} />
                    </div>
                    <h4 className="font-bold text-sm mb-1.5 text-foreground">{f.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile slider */}
            <div className="md:hidden relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                  {FEATURES.map((f, i) => (
                    <div key={i} className="min-w-full px-2">
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6 text-center">
                          <div
                            className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mx-auto mb-4`}
                          >
                            <f.icon className="h-7 w-7" style={{ color: f.color }} />
                          </div>
                          <h4 className="font-bold text-base mb-2 text-foreground">{f.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide controls */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => goSlide(-1)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex gap-1.5">
                  {FEATURES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { clearInterval(slideInterval.current); setActiveSlide(i); }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeSlide ? "w-6 bg-primary" : "w-1.5 bg-border"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => goSlide(1)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-10 sm:mt-14">
              <Button
                className="bg-navy hover:bg-navy/90 text-navy-foreground px-8 h-12 text-sm font-semibold"
                onClick={() => { resetForm(); setAuthMode("signup"); }}
              >
                Join HiTex Today <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Free to join · No credit card required
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-navy text-navy-foreground/60 py-6 px-4 text-center text-xs">
          <p>
            © {new Date().getFullYear()} Hi<span className="text-emerald">Tex</span> — Tamil Nadu Textile Marketplace
          </p>
        </footer>
      </div>
    );
  }

  // ─── Auth Forms (Login / Signup) ───
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Auth header */}
      <div className="bg-navy text-navy-foreground px-4 sm:px-8 pt-6 pb-8 sm:pt-10 sm:pb-12">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setAuthMode("landing")}
            className="flex items-center gap-1 text-navy-foreground/60 hover:text-navy-foreground text-sm mb-6 transition-colors active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hi<span className="text-emerald">Tex</span>
          </h1>
          <p className="text-navy-foreground/60 text-sm mt-1">
            {authMode === "login" ? "Welcome back! Sign in to continue." : "Create your free account."}
          </p>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 px-4 sm:px-8 py-6 sm:py-10">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-5 sm:p-8 space-y-5">
              <h2 className="text-lg font-bold text-foreground">
                {authMode === "login" ? "Log In" : "Sign Up"}
              </h2>

              {authMode === "signup" && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
                  <div className="relative mt-1">
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="pl-10"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                <div className="relative mt-1">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {authMode === "signup" && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}

              <Button
                onClick={authMode === "login" ? handleLogin : handleSignup}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 h-11 font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Please wait...
                  </span>
                ) : authMode === "login" ? (
                  <>Sign In <ArrowRight className="h-4 w-4 ml-1" /></>
                ) : (
                  <>Create Account <ArrowRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>

              <div className="text-center">
                {authMode === "login" ? (
                  <p className="text-xs text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      onClick={() => { resetForm(); setAuthMode("signup"); }}
                      className="text-primary font-semibold hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      onClick={() => { resetForm(); setAuthMode("login"); }}
                      className="text-primary font-semibold hover:underline"
                    >
                      Log In
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test account hint */}
          {authMode === "login" && (
            <div className="mt-4 p-3 rounded-xl bg-gold/10 border border-gold/20">
              <p className="text-xs text-center text-muted-foreground">
                <span className="font-semibold text-gold">Demo:</span> admin@admin.com / admin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
