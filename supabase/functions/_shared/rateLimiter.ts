import { Redis } from "npm:@upstash/redis@1.35.8";
import { Ratelimit } from "npm:@upstash/ratelimit@2.0.7";

/**
 * Redis-backed rate limiting for Supabase Edge Functions (Upstash).
 *
 * Design goals:
 * - Minimal changes required in each function
 * - Early-exit (429) before DB/Storage/Resend/Kit calls
 * - IP limiting everywhere
 * - Secondary limiting (email/token/contentId) where it materially matters
 *
 * Required secrets:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

const redis = Redis.fromEnv();

type Mode = "json" | "text" | "html";

// Helper: extract IP (best-effort)
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

// Helper: SHA-256 hash for email/token/content keys (avoids storing raw PII in Redis keys)
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

function retryAfterSeconds(resetMs: number): number {
  return Math.max(0, Math.ceil((resetMs - Date.now()) / 1000));
}

function build429Response(args: {
  mode: Mode;
  corsHeaders: Record<string, string>;
  retryAfter: number;
  resetMs: number;
}): Response {
  const headers = new Headers({
    ...args.corsHeaders,
    "Retry-After": String(args.retryAfter),
    "X-RateLimit-Reset": new Date(args.resetMs).toISOString(),
  });

  if (args.mode === "json") {
    headers.set("Content-Type", "application/json");
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: args.retryAfter,
      }),
      { status: 429, headers },
    );
  }

  if (args.mode === "html") {
    headers.set("Content-Type", "text/html");
    return new Response(
      `<!doctype html><html><body style="font-family: Arial, sans-serif; text-align:center; padding:40px;">
        <h1>Too Many Requests</h1>
        <p>Please try again in ${args.retryAfter} seconds.</p>
      </body></html>`,
      { status: 429, headers },
    );
  }

  headers.set("Content-Type", "text/plain");
  return new Response(`Too many requests. Try again in ${args.retryAfter} seconds.`, {
    status: 429,
    headers,
  });
}

/**
 * Limiters (initial policy)
 * - Password reset is strict
 * - Newsletter flows moderate
 * - Downloads higher
 */
export const limiters = {
  // 1) contact-form
  contactIp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, "30 m"),
    prefix: "fp:contact:ip",
  }),
  contactEmail: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, "1 d"),
    prefix: "fp:contact:email",
  }),

  // 2) download-content-pdf
  downloadIp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "3 m"),
    prefix: "fp:download:ip",
  }),
  downloadIpDaily: new Ratelimit({
   redis,
   limiter: Ratelimit.slidingWindow(25, "1 d"),
   prefix: "fp:download:ip_daily",
  }),
  downloadContent: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 d"),
    prefix: "fp:download:content",
  }),

  // 3) newsletter-subscribe
  newsletterSubscribeIp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "5 m"),
    prefix: "fp:nl_subscribe:ip",
  }),
  newsletterSubscribeEmail: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 d"),
    prefix: "fp:nl_subscribe:email",
  }),

  // 4) newsletter-confirm
  newsletterConfirmIp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "5 m"),
    prefix: "fp:nl_confirm:ip",
  }),
  newsletterConfirmToken: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 d"),
    prefix: "fp:nl_confirm:token",
  }),

  // 5) newsletter-unsubscribe
  newsletterUnsubIp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "5 m"),
    prefix: "fp:nl_unsub:ip",
  }),
  newsletterUnsubToken: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 d"),
    prefix: "fp:nl_unsub:token",
  }),

  // 6) newsletter-resubscribe
  newsletterResubIp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "5 m"),
    prefix: "fp:nl_resub:ip",
  }),
  newsletterResubToken: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 d"),
    prefix: "fp:nl_resub:token",
  }),
  newsletterResubEmail: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 d"),
    prefix: "fp:nl_resub:email",
  }),

  // 7) send-password-reset (strict)
  pwSendIp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "15 m"),
    prefix: "fp:pw_send:ip",
  }),
  pwSendEmail: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "12 h"),
    prefix: "fp:pw_send:email",
  }),

  // 8) reset-password-with-token (strict)
  pwResetIp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "15 m"),
    prefix: "fp:pw_reset:ip",
  }),
  pwResetToken: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "fp:pw_reset:token",
  }),
};

// Minimal guard: IP-based
export async function enforceIpLimit(args: {
  req: Request;
  limiter: Ratelimit;
  key: string; // function name, for debugging only
  corsHeaders: Record<string, string>;
  mode: Mode;
}): Promise<Response | null> {
  const ip = getClientIp(args.req);
  const identifier = `${args.key}:ip:${ip}`;
  const res = await args.limiter.limit(identifier);

  if (res.success) return null;

  const retryAfter = retryAfterSeconds(res.reset);
  return build429Response({
    mode: args.mode,
    corsHeaders: args.corsHeaders,
    retryAfter,
    resetMs: res.reset,
  });
}

// Minimal guard: value-based (email/token/contentId), hashed
export async function enforceValueLimit(args: {
  limiter: Ratelimit;
  key: string; // function name
  label: "email" | "token" | "content";
  value: string;
  corsHeaders: Record<string, string>;
  mode: Mode;
}): Promise<Response | null> {
  const hashed = await sha256Hex(args.value);
  const identifier = `${args.key}:${args.label}:${hashed}`;
  const res = await args.limiter.limit(identifier);

  if (res.success) return null;

  const retryAfter = retryAfterSeconds(res.reset);
  return build429Response({
    mode: args.mode,
    corsHeaders: args.corsHeaders,
    retryAfter,
    resetMs: res.reset,
  });
}
