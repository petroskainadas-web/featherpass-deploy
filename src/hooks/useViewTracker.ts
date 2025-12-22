import { useRef, useEffect } from 'react';
import { shouldIncrementView, markAsViewed } from '@/lib/viewTracker';

type ViewIncrementFn = () => Promise<void>;

/**
 * Custom hook for protected view tracking
 * 
 * Protects against:
 * - React 18 Strict Mode double execution (useRef flag)
 * - Browser back/forward navigation (sessionStorage)
 * - Page refreshes (sessionStorage persists)
 * - Multiple tabs (each tab has separate sessionStorage)
 * - Bots and crawlers (user-agent pattern matching)
 */
export const useViewTracker = (
  contentType: 'article' | 'gallery',
  contentId: string | undefined,
  incrementFn: ViewIncrementFn
) => {
  // Ref to prevent double execution in Strict Mode
  const hasIncrementedRef = useRef(false);
  // Track the current contentId to reset when it changes
  const currentIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Reset the flag when contentId changes
    if (contentId !== currentIdRef.current) {
      hasIncrementedRef.current = false;
      currentIdRef.current = contentId;
    }
  }, [contentId]);

  useEffect(() => {
    const trackView = async () => {
      // Guard: no ID
      if (!contentId) return;

      // Guard: already incremented in this render cycle (Strict Mode protection)
      if (hasIncrementedRef.current) return;

      // Guard: bot or already viewed in session
      if (!shouldIncrementView(contentType, contentId)) return;

      // Set flag immediately to prevent race conditions
      hasIncrementedRef.current = true;

      try {
        await incrementFn();
        // Only mark as viewed if increment succeeded
        markAsViewed(contentType, contentId);
      } catch (error) {
        // Reset flag on error so retry is possible on next navigation
        hasIncrementedRef.current = false;
        console.error(`Failed to increment ${contentType} views:`, error);
      }
    };

    trackView();
  }, [contentId, contentType, incrementFn]);
};
