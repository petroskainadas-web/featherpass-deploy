/**
 * Cookie Management Utilities
 */

import { 
  CookieConsent, 
  CookieCategory, 
  CONSENT_VERSION, 
  CONSENT_DURATION_DAYS,
  CONSENT_STORAGE_KEY 
} from "@/types/cookies";

/**
 * Get stored cookie consent
 */
export function getStoredConsent(): CookieConsent | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;
    
    const consent: CookieConsent = JSON.parse(stored);
    
    // Check if consent has expired
    if (Date.now() > consent.expiresAt) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    
    // Check if consent version matches
    if (consent.version !== CONSENT_VERSION) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    
    return consent;
  } catch (error) {
    console.error("Error reading cookie consent:", error);
    return null;
  }
}

/**
 * Store cookie consent
 */
export function storeConsent(categories: CookieCategory): CookieConsent {
  const now = Date.now();
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    timestamp: now,
    expiresAt: now + (CONSENT_DURATION_DAYS * 24 * 60 * 60 * 1000),
    categories: {
      necessary: true, // Always true
      analytics: categories.analytics,
      marketing: categories.marketing,
      preferences: categories.preferences,
    },
  };
  
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch (error) {
    console.error("Error storing cookie consent:", error);
  }
  
  return consent;
}

/**
 * Clear stored consent
 */
export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing cookie consent:", error);
  }
}

/**
 * Check if user has consent for a specific category
 */
export function hasConsent(category: keyof CookieCategory): boolean {
  const consent = getStoredConsent();
  
  if (!consent) return false;
  
  // Necessary cookies are always allowed
  if (category === "necessary") return true;
  
  return consent.categories[category] === true;
}

/**
 * Get default consent (all optional categories denied)
 */
export function getDefaultConsent(): CookieCategory {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  };
}

/**
 * Get full consent (all categories accepted)
 */
export function getFullConsent(): CookieCategory {
  return {
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
  };
}
