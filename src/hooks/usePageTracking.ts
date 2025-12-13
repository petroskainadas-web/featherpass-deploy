/**
 * Page Tracking Hook
 * Automatically tracks route changes in Google Analytics
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { trackPageView, isInternalRoute } from "@/lib/analytics";

export function usePageTracking() {
  const location = useLocation();
  const { hasConsent } = useCookieConsent();
  const previousPath = useRef<string>("");

  useEffect(() => {
    // Don't track on initial mount
    if (previousPath.current === "" && location.pathname === "/") {
      previousPath.current = location.pathname;
      return;
    }

    // Don't track if same path
    if (previousPath.current === location.pathname) {
      return;
    }

    // Don't track internal routes
    if (isInternalRoute(location.pathname)) {
      previousPath.current = location.pathname;
      return;
    }

    // Only track if user has given analytics consent
    if (hasConsent("analytics")) {
      // Debounce to prevent duplicate tracking on rapid navigation
      const timeout = setTimeout(() => {
        trackPageView(location.pathname + location.search, document.title);
      }, 100);

      previousPath.current = location.pathname;

      return () => clearTimeout(timeout);
    }
  }, [location, hasConsent]);
}
