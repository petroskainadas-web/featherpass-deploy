// Bot detection patterns for common crawlers and bots
const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /slurp/i, /googlebot/i,
  /bingbot/i, /yandex/i, /duckduckbot/i, /baiduspider/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  /whatsapp/i, /telegrambot/i, /discordbot/i, /pinterest/i,
  /lighthouse/i, /pagespeed/i, /headless/i, /phantom/i,
  /selenium/i, /puppeteer/i, /playwright/i
];

/**
 * Check if the current user agent is a bot or crawler
 */
export const isBot = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  const ua = navigator.userAgent;
  return BOT_PATTERNS.some(pattern => pattern.test(ua));
};

/**
 * Generate a unique session storage key for tracking views
 */
const getViewKey = (contentType: string, contentId: string): string =>
  `viewed_${contentType}_${contentId}`;

/**
 * Check if content was already viewed in this session
 */
export const hasViewedInSession = (contentType: string, contentId: string): boolean => {
  try {
    const key = getViewKey(contentType, contentId);
    return sessionStorage.getItem(key) === 'true';
  } catch {
    // sessionStorage may be unavailable in some contexts
    return false;
  }
};

/**
 * Mark content as viewed in this session
 */
export const markAsViewed = (contentType: string, contentId: string): void => {
  try {
    const key = getViewKey(contentType, contentId);
    sessionStorage.setItem(key, 'true');
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
};

/**
 * Main function to check if we should increment the view count
 * Returns false if:
 * - User agent is a bot/crawler
 * - Content was already viewed in this session (handles refresh, back/forward)
 */
export const shouldIncrementView = (contentType: string, contentId: string): boolean => {
  // Don't count bots
  if (isBot()) return false;

  // Don't count if already viewed in this session
  if (hasViewedInSession(contentType, contentId)) return false;

  return true;
};
