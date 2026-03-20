import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import AuthForm from "@/components/AuthForm";
import {
  ArrowRight,
  ArrowLeft,
  Recycle,
  TrendingUp,
  MessageCircle,
  Shield,
  BarChart3,
  Globe,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
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

const STATS = [
  { value: "2,400+", label: "Active Traders" },
  { value: "₹12Cr+", label: "Monthly Volume" },
  { value: "38", label: "Districts Covered" },
];

type ViewMode = "landing" | "auth";

export default function Landing() {
  const { t } = useI18n();
  const [activeSlide, setActiveSlide] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("landing");
  const [authInitial, setAuthInitial] = useState<"login" | "signup">("login");
  const slideInterval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (viewMode !== "landing") return;
    slideInterval.current = setInterval(() => {
      setActiveSlide((p) => (p + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(slideInterval.current);
  }, [viewMode]);

  const goSlide = (dir: number) => {
    clearInterval(slideInterval.current);
    setActiveSlide((p) => (p + dir + FEATURES.length) % FEATURES.length);
  };

  const openAuth = (mode: "login" | "signup") => {
    setAuthInitial(mode);
    setViewMode("auth");
  };

  // ─── MOBILE AUTH VIEW ───
  if (viewMode === "auth") {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:hidden">
        <div className="bg-navy text-navy-foreground px-4 pt-6 pb-8">
          <div className="max-w-md mx-auto">
            <button onClick={() => setViewMode("landing")} className="flex items-center gap-1 text-navy-foreground/60 hover:text-navy-foreground text-sm mb-6 transition-colors active:scale-95">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Hi<span className="text-emerald">Tex</span>
            </h1>
            <p className="text-navy-foreground/60 text-sm mt-1">
              {authInitial === "login" ? "Welcome back! Sign in to continue." : "Create your free account."}
            </p>
          </div>
        </div>
        <div className="flex-1 px-4 py-6">
          <div className="max-w-md mx-auto">
            <AuthForm initialMode={authInitial} />
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN LANDING ───
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ============ DESKTOP LAYOUT (lg+) ============ */}
      <div className="hidden lg:flex lg:flex-col lg:min-h-screen">
        {/* Desktop Nav */}
        <header className="bg-navy text-navy-foreground">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Hi<span className="text-emerald">Tex</span>
            </h1>
            <nav className="flex items-center gap-6">
              <a href="#features" className="text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors">Features</a>
              <a href="#stats" className="text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors">Why HiTex</a>
              <Button variant="ghost" size="sm" className="text-navy-foreground/80 hover:text-navy-foreground hover:bg-white/10" onClick={() => openAuth("login")}>
                Log in
              </Button>
              <Button size="sm" className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={() => openAuth("signup")}>
                Sign up free
              </Button>
            </nav>
          </div>
        </header>

        {/* Desktop Hero: side-by-side text + auth form */}
        <section className="bg-navy text-navy-foreground">
          <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div>
              <p className="text-emerald font-semibold text-xs uppercase tracking-widest mb-3">
                Tamil Nadu's #1 Textile Marketplace
              </p>
              <h2 className="text-5xl font-extrabold leading-[1.08] mb-6">
                Trade Smarter.<br />
                <span className="text-emerald">Grow Faster.</span>
              </h2>
              <p className="text-navy-foreground/70 text-base leading-relaxed mb-8 max-w-lg">
                Connect with verified waste traders, recycling mills, and manufacturers. Post leads, negotiate directly, and manage your entire textile business — all in one platform.
              </p>
              <div className="flex items-center gap-6 mb-10">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold text-emerald">{s.value}</p>
                    <p className="text-xs text-navy-foreground/50">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {["No middlemen — trade directly", "GST-verified profiles", "Free to join, no credit card"].map((text) => (
                  <div key={text} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald shrink-0" />
                    <span className="text-sm text-navy-foreground/70">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: auth form */}
            <div className="max-w-md ml-auto w-full">
              <AuthForm initialMode="signup" compact />
            </div>
          </div>
        </section>

        {/* Desktop Features */}
        <section id="features" className="bg-background py-20">
          <div className="max-w-7xl mx-auto px-8">
            <p className="text-center text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              Everything you need
            </p>
            <h3 className="text-center text-3xl font-extrabold text-foreground mb-12">
              One Platform, Full Control
            </h3>
            <div className="grid grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <Card key={i} className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <f.icon className="h-5 w-5" style={{ color: f.color }} />
                    </div>
                    <h4 className="font-bold text-sm mb-1.5 text-foreground">{f.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Desktop Stats Bar */}
        <section id="stats" className="bg-navy text-navy-foreground py-12">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-3 gap-8 text-center">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-4xl font-extrabold text-emerald mb-1">{s.value}</p>
                  <p className="text-sm text-navy-foreground/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Desktop CTA */}
        <section className="bg-background py-16">
          <div className="max-w-2xl mx-auto text-center px-8">
            <h3 className="text-2xl font-extrabold text-foreground mb-4">Ready to grow your textile business?</h3>
            <p className="text-sm text-muted-foreground mb-8">Join thousands of traders already using HiTex to find better deals, faster.</p>
            <div className="flex justify-center gap-3">
              <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground px-8 h-12 text-sm font-semibold" onClick={() => openAuth("signup")}>
                Get Started Free <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button variant="outline" className="h-12 px-6" onClick={() => openAuth("login")}>
                I have an account
              </Button>
            </div>
          </div>
        </section>

        {/* Desktop Footer */}
        <footer className="bg-navy text-navy-foreground/60 py-6 px-8 text-center text-xs mt-auto">
          <p>© {new Date().getFullYear()} Hi<span className="text-emerald">Tex</span> — Tamil Nadu Textile Marketplace</p>
        </footer>
      </div>

      {/* ============ MOBILE LAYOUT (<lg) ============ */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* Mobile Hero */}
        <div className="bg-navy text-navy-foreground relative overflow-hidden">
          <div className="px-4 pt-8 pb-12">
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-2xl font-extrabold tracking-tight">
                Hi<span className="text-emerald">Tex</span>
              </h1>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-navy-foreground/80 hover:text-navy-foreground hover:bg-white/10" onClick={() => openAuth("login")}>
                  Log in
                </Button>
                <Button size="sm" className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={() => openAuth("signup")}>
                  Sign up
                </Button>
              </div>
            </div>

            <div>
              <p className="text-emerald font-semibold text-xs uppercase tracking-widest mb-3">
                Tamil Nadu's #1 Textile Marketplace
              </p>
              <h2 className="text-3xl font-extrabold leading-[1.1] mb-4">
                Trade Smarter.<br />
                <span className="text-emerald">Grow Faster.</span>
              </h2>
              <p className="text-navy-foreground/70 text-sm leading-relaxed mb-6 max-w-md">
                Connect with verified waste traders, recycling mills, and manufacturers — all in one app.
              </p>

              {/* Mobile stats row */}
              <div className="flex gap-5 mb-6">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="text-lg font-extrabold text-emerald">{s.value}</p>
                    <p className="text-[10px] text-navy-foreground/50">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground px-6 h-11 text-sm font-semibold" onClick={() => openAuth("signup")}>
                  Get Started Free <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button variant="outline" className="border-navy-foreground/20 text-navy-foreground hover:bg-white/10 h-11 px-5" onClick={() => openAuth("login")}>
                  Log in
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        </div>

        {/* Mobile Feature Slides */}
        <div className="flex-1 bg-background">
          <div className="px-4 py-10">
            <p className="text-center text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              Everything you need
            </p>
            <h3 className="text-center text-xl font-extrabold text-foreground mb-8">
              One Platform, Full Control
            </h3>

            <div className="relative">
              <div className="overflow-hidden">
                <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                  {FEATURES.map((f, i) => (
                    <div key={i} className="min-w-full px-2">
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6 text-center">
                          <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mx-auto mb-4`}>
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

              <div className="flex items-center justify-center gap-4 mt-6">
                <button onClick={() => goSlide(-1)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex gap-1.5">
                  {FEATURES.map((_, i) => (
                    <button key={i} onClick={() => { clearInterval(slideInterval.current); setActiveSlide(i); }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === activeSlide ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
                    />
                  ))}
                </div>
                <button onClick={() => goSlide(1)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile bottom CTA */}
            <div className="text-center mt-10">
              <Button className="bg-navy hover:bg-navy/90 text-navy-foreground px-8 h-12 text-sm font-semibold" onClick={() => openAuth("signup")}>
                Join HiTex Today <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <p className="text-xs text-muted-foreground mt-3">Free to join · No credit card required</p>
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <footer className="bg-navy text-navy-foreground/60 py-6 px-4 text-center text-xs">
          <p>© {new Date().getFullYear()} Hi<span className="text-emerald">Tex</span> — Tamil Nadu Textile Marketplace</p>
        </footer>
      </div>
    </div>
  );
}
