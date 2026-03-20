import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Mail, Lock, Eye, EyeOff, User } from "lucide-react";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  initialMode?: AuthMode;
  compact?: boolean;
}

export default function AuthForm({ initialMode = "login", compact = false }: AuthFormProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { toast.error("Please fill all fields"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back!");
  };

  const handleSignup = async () => {
    if (!email || !password || !fullName) { toast.error("Please fill all fields"); return; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Check your email to verify your account!"); setAuthMode("login"); }
  };

  const resetForm = () => { setEmail(""); setPassword(""); setConfirmPassword(""); setFullName(""); setShowPassword(false); };

  return (
    <Card className={`border-0 ${compact ? "shadow-lg" : "shadow-xl"}`}>
      <CardContent className={compact ? "p-5 space-y-4" : "p-5 sm:p-8 space-y-5"}>
        <h2 className="text-lg font-bold text-foreground">
          {authMode === "login" ? "Log In" : "Sign Up"}
        </h2>

        {authMode === "signup" && (
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
            <div className="relative mt-1">
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="pl-10" />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Email</Label>
          <div className="relative mt-1">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="pl-10" />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Password</Label>
          <div className="relative mt-1">
            <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10" />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {authMode === "signup" && (
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Confirm Password</Label>
            <div className="relative mt-1">
              <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="pl-10" />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        <Button onClick={authMode === "login" ? handleLogin : handleSignup} disabled={loading} className="w-full bg-primary hover:bg-primary/90 h-11 font-semibold">
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
              <button onClick={() => { resetForm(); setAuthMode("signup"); }} className="text-primary font-semibold hover:underline">Sign Up</button>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => { resetForm(); setAuthMode("login"); }} className="text-primary font-semibold hover:underline">Log In</button>
            </p>
          )}
        </div>

        {authMode === "login" && (
          <div className="p-2.5 rounded-lg bg-gold/10 border border-gold/20">
            <p className="text-xs text-center text-muted-foreground">
              <span className="font-semibold text-gold">Demo:</span> admin@admin.com / admin
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
