import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCredits() {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkAndUseCredit = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please log in first"); return false; }

      // Check if user is subscribed (unlimited)
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_subscribed, free_credits_used, max_free_credits")
        .eq("user_id", user.id)
        .single();

      if (!profile) { toast.error("Profile not found"); return false; }

      // Subscribed users have unlimited credits
      if (profile.is_subscribed) return true;

      // Check free credits
      const used = profile.free_credits_used ?? 0;
      const max = profile.max_free_credits ?? 3;

      if (used >= max) {
        setShowLimitModal(true);
        return false;
      }

      // Use a credit
      const { error } = await supabase
        .from("profiles")
        .update({ free_credits_used: used + 1 })
        .eq("user_id", user.id);

      if (error) { toast.error("Failed to update credits"); return false; }

      const remaining = max - used - 1;
      if (remaining > 0) {
        toast.info(`${remaining} free credit${remaining > 1 ? "s" : ""} remaining`);
      }

      return true;
    } catch {
      toast.error("Something went wrong");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkAndUseCredit, showLimitModal, setShowLimitModal, loading };
}
