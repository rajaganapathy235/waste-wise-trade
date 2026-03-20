import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isLoggedIn, loading, user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        navigate(requireAdmin ? "/admin/login" : "/onboarding");
      } else if (requireAdmin) {
        // Double check admin role
        const checkAdmin = async () => {
          const { data: { user: supabaseUser } } = await supabase.auth.getUser();
          if (supabaseUser) {
            const { data } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", supabaseUser.id)
              .eq("role", "admin")
              .single();
            
            if (!data) {
              navigate("/");
            }
          }
        };
        checkAdmin();
      }
    }
  }, [isLoggedIn, loading, requireAdmin, navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Securing your session...
        </p>
      </div>
    );
  }

  return isLoggedIn ? <>{children}</> : null;
}
