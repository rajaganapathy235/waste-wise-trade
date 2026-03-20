import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  Mail,
  MapPin,
  Info,
  FileText,
  Shield,
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Flame,
} from "lucide-react";

type Section = "menu" | "contact" | "about" | "terms" | "privacy";

export default function More() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [section, setSection] = useState<Section>("menu");

  if (section === "contact") {
    return (
      <div className="px-4 pt-4 pb-8">
        <button onClick={() => setSection("menu")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 active:scale-95">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-lg font-bold mb-4">Contact Us</h1>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">support@hitex.in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald/10 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-emerald" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald/10 flex items-center justify-center shrink-0">
                <MessageCircle className="h-4 w-4 text-emerald" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="text-sm font-medium">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">Tiruppur, Tamil Nadu, India</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md mt-4">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-2">Business Hours</h3>
            <p className="text-xs text-muted-foreground">Monday – Saturday: 9:00 AM – 6:00 PM IST</p>
            <p className="text-xs text-muted-foreground">Sunday: Closed</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (section === "about") {
    return (
      <div className="px-4 pt-4 pb-8">
        <button onClick={() => setSection("menu")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 active:scale-95">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-lg font-bold mb-4">About HiTex</h1>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">HiTex</span> is Tamil Nadu's leading B2B textile marketplace connecting waste traders, recycling mills, fiber producers, and manufacturers on a single platform.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our mission is to make textile waste trading transparent, efficient, and accessible to every business — from small-scale recyclers in Tiruppur to large manufacturers across South India.
            </p>
            <div className="pt-2 space-y-2">
              <h3 className="text-sm font-semibold">What We Offer</h3>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                <li>Real-time lead marketplace for textile waste, fiber, and yarn</li>
                <li>Direct chat and negotiation — no middlemen</li>
                <li>GST-verified business profiles with trust scores</li>
                <li>Market analytics and demand heatmaps</li>
                <li>Public catalog storefronts for every seller</li>
              </ul>
            </div>
            <div className="pt-2">
              <h3 className="text-sm font-semibold mb-1">Our Vision</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To build India's most trusted digital ecosystem for the textile recycling industry — empowering businesses to trade smarter and grow faster.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (section === "terms") {
    return (
      <div className="px-4 pt-4 pb-8">
        <button onClick={() => setSection("menu")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 active:scale-95">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-lg font-bold mb-4">Terms of Service</h1>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5 space-y-4 text-xs text-muted-foreground leading-relaxed">
            <p className="text-sm font-semibold text-foreground">Last updated: March 2026</p>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">1. Acceptance of Terms</h3>
              <p>By accessing and using HiTex, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">2. User Accounts</h3>
              <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials and all activities under your account.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">3. Marketplace Conduct</h3>
              <p>Users must not post misleading leads, manipulate pricing, or engage in fraudulent activities. All trade listings must accurately represent the materials offered.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">4. Payments & Transactions</h3>
              <p>HiTex facilitates connections between buyers and sellers. All payment transactions occur directly between parties. HiTex is not responsible for disputes arising from such transactions.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">5. Intellectual Property</h3>
              <p>All content, branding, and technology on HiTex is the property of HiTex and may not be reproduced without written consent.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">6. Limitation of Liability</h3>
              <p>HiTex shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">7. Governing Law</h3>
              <p>These terms shall be governed by the laws of India, with jurisdiction in Tiruppur, Tamil Nadu.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (section === "privacy") {
    return (
      <div className="px-4 pt-4 pb-8">
        <button onClick={() => setSection("menu")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 active:scale-95">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-lg font-bold mb-4">Privacy Policy</h1>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5 space-y-4 text-xs text-muted-foreground leading-relaxed">
            <p className="text-sm font-semibold text-foreground">Last updated: March 2026</p>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">1. Information We Collect</h3>
              <p>We collect information you provide directly: name, phone number, email, business details, GSTIN, and location. We also collect usage data such as pages visited and features used.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">2. How We Use Your Information</h3>
              <p>Your data is used to provide marketplace services, verify business profiles, facilitate communication between traders, send notifications, and improve our platform.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">3. Data Sharing</h3>
              <p>We do not sell your personal data. Business information (name, location, materials) may be visible to other users as part of the marketplace. We may share data with law enforcement if required by law.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">4. Data Security</h3>
              <p>We use industry-standard encryption and security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">5. Your Rights</h3>
              <p>You may request access to, correction of, or deletion of your personal data by contacting us at support@hitex.in.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">6. Cookies</h3>
              <p>We use essential cookies to maintain your session and preferences. No third-party tracking cookies are used.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">7. Contact</h3>
              <p>For privacy-related inquiries, contact us at support@hitex.in or call +91 98765 43210.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const FEATURES = [
    { label: "Market Pulse", icon: TrendingUp, color: "text-emerald", path: "/market-pulse" },
    { label: "Analytics", icon: BarChart3, color: "text-primary", path: "/analytics" },
    { label: "Demand Heatmap", icon: Flame, color: "text-gold", path: "/demand-heatmap" },
  ];

  const INFO_ITEMS = [
    { key: "contact", label: "Contact Us", icon: Phone, color: "text-emerald" },
    { key: "about", label: "About HiTex", icon: Info, color: "text-primary" },
    { key: "terms", label: "Terms of Service", icon: FileText, color: "text-gold" },
    { key: "privacy", label: "Privacy Policy", icon: Shield, color: "text-emerald" },
  ];

  return (
    <div className="px-4 pt-4 pb-8">
      <h1 className="text-lg font-bold mb-4">{t("nav.more")}</h1>

      {/* Features grid */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tools</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {FEATURES.map(({ label, icon: Icon, color, path }) => (
          <Card
            key={path}
            className="cursor-pointer transition-all hover:shadow-md active:scale-[0.97]"
            onClick={() => navigate(path)}
          >
            <CardContent className="p-3 flex flex-col items-center gap-1.5 text-center">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <span className="text-[11px] font-medium leading-tight">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info & Legal */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Information</p>
      <div className="space-y-2">
        {INFO_ITEMS.map(({ key, label, icon: Icon, color }) => (
          <Card
            key={key}
            className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
            onClick={() => setSection(key as Section)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <span className="text-sm font-medium flex-1">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
