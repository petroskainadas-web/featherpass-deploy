/**
 * Cookie Consent Context Provider
 * Manages consent state and provides hooks for components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CookieConsent, CookieCategory } from "@/types/cookies";
import {
  getStoredConsent,
  storeConsent,
  clearConsent,
  hasConsent as checkConsent,
  getDefaultConsent,
  getFullConsent,
} from "@/lib/cookieManager";
import { initializeGA, updateConsent } from "@/lib/analytics";

interface CookieConsentContextValue {
  consent: CookieConsent | null;
  showBanner: boolean;
  hasConsent: (category: keyof CookieCategory) => boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updateCategories: (categories: CookieCategory) => void;
  clearAllConsent: () => void;
  dismissBanner: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load consent on mount
  useEffect(() => {
    const stored = getStoredConsent();
    setConsent(stored);
    setShowBanner(!stored);
    setInitialized(true);
    
    // Initialize GA if consent already exists
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (stored && measurementId) {
      initializeGA(measurementId);
      updateConsent(stored.categories.analytics);
    }
  }, []);

  const hasConsentForCategory = useCallback((category: keyof CookieCategory): boolean => {
    return checkConsent(category);
  }, []);

  const acceptAll = useCallback(() => {
    const newConsent = storeConsent(getFullConsent());
    setConsent(newConsent);
    setShowBanner(false);
    
    // Initialize GA with consent
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId) {
      initializeGA(measurementId);
      updateConsent(true);
    }
  }, []);

  const rejectAll = useCallback(() => {
    const newConsent = storeConsent(getDefaultConsent());
    setConsent(newConsent);
    setShowBanner(false);
    
    // Update GA consent to denied
    updateConsent(false);
  }, []);

  const updateCategories = useCallback((categories: CookieCategory) => {
    const newConsent = storeConsent(categories);
    setConsent(newConsent);
    setShowBanner(false);
    
    // Initialize or update GA based on analytics consent
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (categories.analytics && measurementId) {
      initializeGA(measurementId);
      updateConsent(true);
    } else {
      updateConsent(false);
    }
  }, []);

  const clearAllConsent = useCallback(() => {
    clearConsent();
    setConsent(null);
    setShowBanner(true);
    updateConsent(false);
  }, []);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  // Don't render children until initialized to prevent flash
  if (!initialized) {
    return null;
  }

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        showBanner,
        hasConsent: hasConsentForCategory,
        acceptAll,
        rejectAll,
        updateCategories,
        clearAllConsent,
        dismissBanner,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return context;
}
