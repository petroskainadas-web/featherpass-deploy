import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

// Cloudflare test key - always passes (for development/staging)
const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

export interface TurnstileWidgetRef {
  reset: () => void;
  getToken: () => string | null;
}

interface TurnstileWidgetProps {
  onSuccess?: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

/**
 * Reusable Turnstile widget component with imperative handle.
 * Falls back to Cloudflare test key if VITE_TURNSTILE_SITE_KEY is not set.
 */
const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  ({ onSuccess, onError, onExpire, className }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const [token, setToken] = useState<string | null>(null);
    
    // Use environment variable or fall back to test key
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY;
    
    useImperativeHandle(ref, () => ({
      reset: () => {
        turnstileRef.current?.reset();
        setToken(null);
      },
      getToken: () => token,
    }));

    return (
      <div className={className}>
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          options={{
            theme: 'dark',
            size: 'normal',
          }}
          onSuccess={(newToken) => {
            setToken(newToken);
            onSuccess?.(newToken);
          }}
          onError={() => {
            setToken(null);
            onError?.();
          }}
          onExpire={() => {
            setToken(null);
            onExpire?.();
          }}
        />
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';
export default TurnstileWidget;
