/**
 * Google Analytics 4 Integration
 * Only loads and tracks when user has given consent
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const EXCLUDED_ROUTES = [
  /^\/editor/,
  /^\/admin/,
  /^\/dashboard/,
];

/**
 * Check if route should be excluded from tracking
 */
export function isInternalRoute(path: string): boolean {
  return EXCLUDED_ROUTES.some(pattern => pattern.test(path));
}

/**
* Check if GA is available (loaded via index.html)
 */
export function isGAAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/**
 * Update consent mode
 */
export function updateConsent(analyticsGranted: boolean): void {
  if (!window.gtag) return;
  
  window.gtag("consent", "update", {
    analytics_storage: analyticsGranted ? "granted" : "denied",
  });
  
  console.log("GA consent updated:", analyticsGranted ? "granted" : "denied");
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  if (!window.gtag) return;
  if (isInternalRoute(path)) return;
  
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title || document.title,
  });
  
  console.log("GA page view:", path);
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>
): void {
  if (!window.gtag) return;
  
  window.gtag("event", eventName, parameters);
  
  console.log("GA event:", eventName, parameters);
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (!window.gtag) return;
  
  window.gtag("set", "user_properties", properties);
}
