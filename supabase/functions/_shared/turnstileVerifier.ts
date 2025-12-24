/**
 * Cloudflare Turnstile verification utility for Edge Functions.
 * 
 * Features:
 * - Server-side token verification via Cloudflare siteverify API
 * - Fail-closed in production (500 error if secret missing)
 * - JSON and HTML response modes
 * - Logging for debugging
 */

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileVerifyResult {
  success: boolean;
  error?: string;
  challenge_ts?: string;
  hostname?: string;
  bypassed?: boolean;
}

/**
 * Verify a Turnstile token against Cloudflare's API
 * @param token - The Turnstile token from the frontend
 * @param clientIp - Optional client IP for additional validation
 * @returns Verification result
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  clientIp?: string
): Promise<TurnstileVerifyResult> {
  const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY");
  
  // Fail-closed: If secret not configured, reject in production
  if (!secretKey) {
    console.error("CRITICAL: TURNSTILE_SECRET_KEY not configured");
    return { 
      success: false, 
      error: "Security configuration error - Turnstile not configured" 
    };
  }

  // Missing token
  if (!token) {
    console.warn("Turnstile verification failed: No token provided");
    return { success: false, error: "Missing verification token" };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp && clientIp !== "unknown") {
      formData.append("remoteip", clientIp);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      console.error(`Turnstile API error: ${response.status} ${response.statusText}`);
      return { success: false, error: "Verification service unavailable" };
    }

    const result = await response.json();
    
    if (!result.success) {
      const errorCodes = result["error-codes"] || [];
      console.warn(`Turnstile verification failed: ${errorCodes.join(", ")}`);
      return {
        success: false,
        error: "Bot verification failed",
      };
    }
    
    return {
      success: true,
      challenge_ts: result.challenge_ts,
      hostname: result.hostname,
    };
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return { success: false, error: "Verification error" };
  }
}

/**
 * Create a standardized error response for failed Turnstile verification
 * @param corsHeaders - CORS headers to include in response
 * @param mode - Response format: "json" or "html"
 * @returns Response object
 */
export function createTurnstileErrorResponse(
  corsHeaders: Record<string, string>,
  mode: "json" | "html" = "json"
): Response {
  if (mode === "html") {
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Failed</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1410;
      color: #e5dcc8;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .container {
      max-width: 400px;
      padding: 40px;
      background: linear-gradient(135deg, #2d1f0f 0%, #1a1410 100%);
      border: 2px solid #d4af37;
      border-radius: 8px;
    }
    h1 { color: #d4af37; font-size: 24px; margin: 0 0 16px; }
    p { color: #b8a88e; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Verification Failed</h1>
    <p>We couldn't verify you're not a bot. Please go back and try again.</p>
  </div>
</body>
</html>`,
      { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } 
      }
    );
  }
  
  return new Response(
    JSON.stringify({ 
      error: "Bot verification failed. Please complete the security check and try again." 
    }),
    { 
      status: 403, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}
