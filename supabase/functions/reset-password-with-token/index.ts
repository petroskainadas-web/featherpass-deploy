import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { verifyTurnstileToken, createTurnstileErrorResponse } from "../_shared/turnstileVerifier.ts";
import { enforceIpLimit, enforceValueLimit, limiters } from "../_shared/ratelimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  token: string;
  password: string;
  turnstileToken?: string;
}

// Helper: extract IP (best-effort)
function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Stateless guard: block non-POST and non-JSON requests before req.json()
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return new Response(
      JSON.stringify({ error: "Unsupported content type" }),
      {
        status: 415,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
   
try {
    const { token, password, turnstileToken }: ResetPasswordRequest = await req.json();

    // Verify Turnstile token BEFORE any business logic
    const turnstileResult = await verifyTurnstileToken(turnstileToken, getClientIp(req));
    if (!turnstileResult.success) {
      console.warn(`Turnstile verification failed for reset-password-with-token: ${turnstileResult.error}`);
      return createTurnstileErrorResponse(corsHeaders);
    }

  // Rate Limit---------------------------------------------
  const limitedIp = await enforceIpLimit({
   req,
   limiter: limiters.pwResetIp,
   key: "reset-password-with-token",
   corsHeaders,
   mode: "json",
 });
 if (limitedIp) return limitedIp;



    if (!token || !password) {
      return new Response(
        JSON.stringify({ error: "Token and password are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Rate Limit---------------------------------------------
    const limitedToken = await enforceValueLimit({
     limiter: limiters.pwResetToken,
     key: "reset-password-with-token",
     label: "token",
     value: token,
     corsHeaders,
     mode: "json",
   });
   if (limitedToken) return limitedToken;

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate and get token data
    const { data: tokenData, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("user_id, expires_at, used")
      .eq("token", token)
      .maybeSingle();

    if (tokenError) {
      console.error("Token lookup error:", tokenError);
      throw new Error("Failed to validate reset token");
    }

    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: "Invalid reset token" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (tokenData.used) {
      return new Response(
        JSON.stringify({ error: "This reset link has already been used" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "This reset link has expired" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark token as used
    const { error: updateTokenError } = await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("token", token);

    if (updateTokenError) {
      console.error("Error marking token as used:", updateTokenError);
      throw updateTokenError;
    }

    // Update user password using admin API
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      tokenData.user_id,
      { password: password }
    );

    if (passwordError) {
      console.error("Error updating password:", passwordError);
      throw new Error("Failed to update password");
    }

    console.log(`Password successfully reset for user: ${tokenData.user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password has been successfully reset" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in reset-password-with-token function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
