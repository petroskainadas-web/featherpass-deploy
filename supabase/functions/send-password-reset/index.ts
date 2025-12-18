import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";
import { enforceIpLimit, enforceValueLimit, limiters } from "../_shared/ratelimiter.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetRequest {
  email: string;
}

const createResetEmail = (email: string, resetUrl: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 700;">Featherpass</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Password Reset Request</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0; font-size: 24px;">Reset Your Password</h2>
          
          <p style="color: #555; font-size: 16px; margin: 20px 0;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #c9a332 100%); color: #1a1a1a; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin: 20px 0;">
            Or copy and paste this link into your browser:
          </p>
          <p style="color: #d4af37; font-size: 14px; word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">
            ${resetUrl}
          </p>
          
          <p style="color: #999; font-size: 13px; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eee;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2025 Feather Pass. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Rate Limit---------------------------------------------
  const limitedIp = await enforceIpLimit({
   req,
   limiter: limiters.pwSendIp,
   key: "send-password-reset",
   corsHeaders,
   mode: "json",
  });
  if (limitedIp) return limitedIp;

  try {
    const { email }: ResetRequest = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    
    // Rate Limit---------------------------------------------
    const limitedEmail = await enforceValueLimit({
     limiter: limiters.pwSendEmail,
     key: "send-password-reset",
     label: "email",
     value: sanitizedEmail,
     corsHeaders,
     mode: "json",
   });
   if (limitedEmail) return limitedEmail;

    // Initialize Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists in auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error("Error listing users:", userError);
      throw userError;
    }

    const user = userData.users.find((u) => u.email?.toLowerCase() === sanitizedEmail);

    if (!user) {
      // For security, always return success even if user doesn't exist
      console.log(`Password reset requested for non-existent email: ${sanitizedEmail}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "If an account exists with this email, a reset link has been sent.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    // Generate secure random token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Store token in database
    const { error: insertError } = await supabase.from("password_reset_tokens").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error("Error storing reset token:", insertError);
      throw insertError;
    }

    // Create reset URL  (`https://featherpass.com/reset-password?token=${token}`; when published)
    const resetUrl = `https://featherpass.com/reset-password?token=${token}`;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Feather Pass <system@system.featherpass.com>",
      to: [sanitizedEmail],
      subject: "Reset Your Password - Feather Pass",
      html: createResetEmail(sanitizedEmail, resetUrl),
    });

    if (emailResponse.error) {
      console.error("Error sending reset email:", emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log(`Password reset email sent to ${sanitizedEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "If an account exists with this email, a reset link has been sent.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
