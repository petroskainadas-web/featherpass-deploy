/**
 * Cookie Consent Type Definitions
 */

export interface CookieCategory {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsent {
  version: string;
  timestamp: number;
  expiresAt: number;
  categories: CookieCategory;
}

export interface CookieInfo {
  name: string;
  category: keyof CookieCategory;
  purpose: string;
  duration: string;
  required: boolean;
}

export const CONSENT_VERSION = "1.0";
export const CONSENT_DURATION_DAYS = 365; // 12 months
export const CONSENT_STORAGE_KEY = "cookie_consent";
