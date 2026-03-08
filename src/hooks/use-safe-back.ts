import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

/**
 * Safe back navigation hook. Falls back to a specified route
 * if there's no browser history (e.g. direct URL access).
 */
export function useSafeBack(fallback = "/billing") {
  const navigate = useNavigate();
  return useCallback(() => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [navigate, fallback]);
}
