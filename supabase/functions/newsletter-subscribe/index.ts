import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { enforceIpLimit, enforceValueLimit, limiters } from "../_shared/ratelimiter.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
}

const createConfirmationEmail = (email: string, confirmationUrl: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:wght@400;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; background-color: #1a1410; font-family: 'Crimson Pro', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1410;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #2d1f0f 0%, #1a1410 100%); border: 2px solid #d4af37; border-radius: 8px; box-shadow: 0 10px 40px rgba(212, 175, 55, 0.2);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 2px solid #d4af37;">
                    <h1 style="font-family: 'Cinzel', serif; color: #d4af37; font-size: 32px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                      Confirm Your Subscription
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px; color: #e5dcc8;">
                    <p style="font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                      Greetings, Traveler!
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      You've requested to join the Featherpass newsletter. To complete your subscription and begin receiving exclusive content, please confirm your email address by clicking the button below:
                    </p>
                    
                    <!-- Confirmation Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); color: #1a1410; font-family: 'Cinzel', serif; font-size: 18px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 4px; border: 2px solid #d4af37; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3); transition: all 0.3s ease;">
                            Confirm Subscription
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="font-size: 14px; line-height: 1.6; margin: 20px 0 0; color: #b8a88e;">
                      Or copy and paste this link into your browser:<br>
                      <a href="${confirmationUrl}" style="color: #d4af37; word-break: break-all;">${confirmationUrl}</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: rgba(0,0,0,0.3); border-top: 2px solid #d4af37; border-radius: 0 0 6px 6px;">
                    <p style="font-size: 12px; line-height: 1.6; color: #8b7355; margin: 0; text-align: center;">
                      <strong>This is an automated message. Please do not reply to this email.</strong><br><br>
                      If you didn't request this subscription, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return html;
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Rate Limit---------------------------------------------
  const limitedIp = await enforceIpLimit({
   req,
   limiter: limiters.newsletterSubscribeIp,
   key: "newsletter-subscribe",
   corsHeaders,
   mode: "json",
  });
  if (limitedIp) return limitedIp;

  try {
    const { email }: SubscribeRequest = await req.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Rate Limit---------------------------------------------
    const limitedEmail = await enforceValueLimit({
     limiter: limiters.newsletterSubscribeEmail,
     key: "newsletter-subscribe",
     label: "email",
     value: sanitizedEmail,
     corsHeaders,
     mode: "json",
    });
    if (limitedEmail) return limitedEmail;

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if email already exists
    const { data: existing, error: checkError } = await supabaseClient
      .from("newsletter_subscribers")
      .select("email, unsubscribed, resubscribed_count, confirmed, unsubscribe_token")
      .eq("email", sanitizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing subscription:", checkError);
      throw new Error("Database error while checking subscription");
    }

    // Handle resubscription if previously unsubscribed
    if (existing) {
      if (existing.unsubscribed) {
        // Resubscribe the user
        const { error: updateError } = await supabaseClient
          .from("newsletter_subscribers")
          .update({
            unsubscribed: false,
            unsubscribed_at: null,
            unsubscribe_reason: null,
            resubscribed_count: (existing.resubscribed_count || 0) + 1,
            confirmed: false, // Require confirmation again
            convertkit_synced: false,
          })
          .eq("email", sanitizedEmail);

        if (updateError) {
          console.error("Error resubscribing:", updateError);
          throw new Error("Failed to resubscribe. Please try again later.");
        }

        // Send confirmation email
        const confirmationUrl = `${Deno.env.get("SUPABASE_URL").replace('.supabase.co', '')}.supabase.co/functions/v1/newsletter-confirm?token=${existing.unsubscribe_token}`;
        
        try {
          await resend.emails.send({
            from: "Featherpass Newsletter <newsletter@system.featherpass.com>",
            to: [sanitizedEmail],
            replyTo: "noreply@system.featherpass.com",
            subject: "Confirm Your Newsletter Subscription",
            html: createConfirmationEmail(sanitizedEmail, confirmationUrl),
          });
          console.log(`Confirmation email sent to ${sanitizedEmail} (resubscribe)`);
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the subscription if email fails
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Please check your email to confirm your subscription.",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // If already subscribed but not confirmed, resend confirmation
      if (!existing.confirmed) {
        const confirmationUrl = `${Deno.env.get("SUPABASE_URL").replace('.supabase.co', '')}.supabase.co/functions/v1/newsletter-confirm?token=${existing.unsubscribe_token}`;
        
        try {
          await resend.emails.send({
            from: "Featherpass Newsletter <newsletter@system.featherpass.com>",
            to: [sanitizedEmail],
            replyTo: "noreply@system.featherpass.com",
            subject: "Confirm Your Newsletter Subscription",
            html: createConfirmationEmail(sanitizedEmail, confirmationUrl),
          });
          console.log(`Confirmation email resent to ${sanitizedEmail}`);
        } catch (emailError) {
          console.error("Error resending confirmation email:", emailError);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "A confirmation email has been sent. Please check your inbox.",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "You're already subscribed to our newsletter!" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Insert new subscription (unconfirmed)
    const { data: newSubscriber, error: insertError } = await supabaseClient
      .from("newsletter_subscribers")
      .insert({
        email: sanitizedEmail,
        confirmed: false, // Requires confirmation
        source: "website",
        convertkit_synced: false,
      })
      .select("unsubscribe_token")
      .single();

    if (insertError) {
      console.error("Error inserting subscription:", insertError);
      throw new Error("Failed to subscribe. Please try again later.");
    }

    console.log(`New newsletter subscription (pending confirmation): ${sanitizedEmail}`);

    // Send confirmation email
    const confirmationUrl = `${Deno.env.get("SUPABASE_URL").replace('.supabase.co', '')}.supabase.co/functions/v1/newsletter-confirm?token=${newSubscriber.unsubscribe_token}`;
    
    try {
      await resend.emails.send({
        from: "Featherpass Newsletter <newsletter@system.featherpass.com>",
        to: [sanitizedEmail],
        replyTo: "noreply@system.featherpass.com",
        subject: "Confirm Your Newsletter Subscription",
        html: createConfirmationEmail(sanitizedEmail, confirmationUrl),
      });
      console.log(`Confirmation email sent to ${sanitizedEmail}`);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the subscription if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Please check your email to confirm your subscription.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
