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
 * Initialize Google Analytics
 */
export function initializeGA(measurementId: string): void {
  if (!measurementId || typeof window === "undefined") return;
  
  // Check if already initialized
  if (window.gtag) {
    console.log("GA already initialized");
    return;
  }
  
  // Create dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer?.push(arguments);
  };
  
  // Initialize with consent mode
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false, // We'll handle page views manually
    anonymize_ip: true,
  });
  
  // Load the script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  
  console.log("GA initialized:", measurementId);
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
