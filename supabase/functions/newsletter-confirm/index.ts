import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { enforceIpLimit, enforceValueLimit, limiters } from "../_shared/ratelimiter.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Kit V4 Configuration
const KIT_BASE_URL = "https://api.kit.com/v4";
const KIT_TAG_ACTIVE_ID = Deno.env.get("KIT_TAG_ACTIVE_ID")!;
const KIT_TAG_WEBSITE_SIGNUP_ID = Deno.env.get("KIT_TAG_WEBSITE_SIGNUP_ID")!;

const createWelcomeEmail = (email: string, unsubscribeUrl: string) => {
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
                    <h1 style="font-family: 'Cinzel', serif; color: #d4af37; font-size: 36px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                      Welcome to Featherpass
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px; color: #e5dcc8;">
                    <p style="font-size: 20px; line-height: 1.6; margin: 0 0 20px; font-weight: 600;">
                      Greetings, Fellow Adventurer!
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Your subscription is now confirmed. Welcome to the Featherpass community—a place where fantasy comes alive through unique homebrew content, inspiring artwork, and stories that breathe life into your tabletop adventures.
                    </p>
                    
                    <div style="background-color: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 20px; margin: 30px 0;">
                      <h2 style="font-family: 'Cinzel', serif; color: #d4af37; font-size: 20px; margin: 0 0 15px;">
                        What to Expect
                      </h2>
                      <ul style="margin: 0; padding-left: 20px; font-size: 16px; line-height: 1.8;">
                        <li style="margin-bottom: 10px;">Exclusive homebrew content for your campaigns</li>
                        <li style="margin-bottom: 10px;">Original fantasy artwork and world-building resources</li>
                        <li style="margin-bottom: 10px;">Behind-the-scenes insights from our creators</li>
                        <li style="margin-bottom: 10px;">Early access to new releases and special offers</li>
                      </ul>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin: 30px 0 0;">
                      Thank you for joining us on this journey. May your adventures be legendary!
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin: 20px 0 0; color: #d4af37; font-style: italic;">
                      — The Featherpass Team
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: rgba(0,0,0,0.3); border-top: 2px solid #d4af37; border-radius: 0 0 6px 6px;">
                    <p style="font-size: 12px; line-height: 1.6; color: #8b7355; margin: 0; text-align: center;">
                      <strong>This is an automated message. Please do not reply to this email.</strong><br><br>
                      You're receiving this because you subscribed to the Featherpass newsletter.<br>
                      <a href="${unsubscribeUrl}" style="color: #d4af37; text-decoration: underline;">Unsubscribe</a>
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
   limiter: limiters.newsletterConfirmIp,
   key: "newsletter-confirm",
   corsHeaders,
   mode: "html",
  });
  if (limitedIp) return limitedIp;

  try {
    // Get token from query params
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        "Missing confirmation token",
        {
          status: 400,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Validate token format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return new Response(
        "Invalid confirmation token",
        {
          status: 400,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }
    
    // Rate Limit---------------------------------------------
    const limitedToken = await enforceValueLimit({
     limiter: limiters.newsletterConfirmToken,
     key: "newsletter-confirm",
     label: "token",
     value: token,
     corsHeaders,
     mode: "html",
    });
    if (limitedToken) return limitedToken;

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabaseClient
      .from("newsletter_subscribers")
      .select("id, email, confirmed, unsubscribed, convertkit_subscriber_id, unsubscribe_token")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (findError) {
      console.error("Error finding subscriber:", findError);
      throw new Error("Database error");
    }

    if (!subscriber) {
      return new Response(
        "Subscription not found",
        {
          status: 404,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    if (subscriber.unsubscribed) {
      return new Response(
        "This subscription has been cancelled",
        {
          status: 400,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    if (subscriber.confirmed) {
      return new Response(
        `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Already Confirmed</h1>
          <p>Your subscription is already confirmed!</p>
        </body></html>`,
        {
          status: 200,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Update subscriber as confirmed
    const { error: updateError } = await supabaseClient
      .from("newsletter_subscribers")
      .update({
        confirmed: true,
        convertkit_synced: false, // Will be synced next
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error confirming subscription:", updateError);
      throw new Error("Failed to confirm subscription");
    }

    console.log(`Newsletter confirmed: ${subscriber.email}`);

    // Sync to Kit V4 (Golden Plan implementation)
    const kitApiKey = Deno.env.get("KIT_API_KEY");
    const kitFormId = Deno.env.get("KIT_FORM_ID");

    if (kitApiKey && kitFormId) {
      try {
        // Step 1: Create or upsert subscriber
        const createRes = await fetch(`${KIT_BASE_URL}/subscribers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Kit-Api-Key": kitApiKey,
          },
          body: JSON.stringify({
            email_address: subscriber.email,
            // NOTE: state field is ignored by Kit's create endpoint; actual state is controlled by forms/unsubscribe
            fields: {
              unsubscribe_token: subscriber.unsubscribe_token,
            },
          }),
        });

        const createJson = await createRes.json();
        
        if (!createRes.ok || !createJson.subscriber) {
          console.error("Kit v4 create subscriber failed", createRes.status, createJson);
          // Don't fail confirmation if Kit sync fails
        } else {
          const kitId = createJson.subscriber.id;
          console.log(`Kit subscriber created/updated: ${kitId}`);

          // Step 2: Attach to form by ID
          const attachRes = await fetch(
            `${KIT_BASE_URL}/forms/${kitFormId}/subscribers/${kitId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Kit-Api-Key": kitApiKey,
              },
              body: JSON.stringify({
                referrer: "https://news.featherpass.com/newsletter",
              }),
            }
          );

          const attachJson = await attachRes.json();
          
          if (!attachRes.ok || !attachJson.subscriber) {
            console.error("Kit v4 attach to form failed", attachRes.status, attachJson);
          } else {
            console.log(`Kit subscriber attached to form: ${kitId}`);

            // Step 3: Apply tags (parallel requests)
            const tagRequests = [
              fetch(`${KIT_BASE_URL}/tags/${KIT_TAG_ACTIVE_ID}/subscribers/${kitId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Kit-Api-Key": kitApiKey,
                },
                body: "{}",
              }),
              fetch(`${KIT_BASE_URL}/tags/${KIT_TAG_WEBSITE_SIGNUP_ID}/subscribers/${kitId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Kit-Api-Key": kitApiKey,
                },
                body: "{}",
              }),
            ];

            await Promise.all(tagRequests);
            console.log(`Kit tags applied to subscriber: ${kitId}`);

            // Step 4: Update Supabase - only if ALL Kit calls succeeded
            await supabaseClient
              .from("newsletter_subscribers")
              .update({
                convertkit_subscriber_id: kitId.toString(),
                convertkit_synced: true,
              })
              .eq("id", subscriber.id);

            console.log(`Kit sync complete for: ${subscriber.email} (ID: ${kitId})`);
          }
        }
      } catch (convertkitError) {
        console.error("Error syncing to Kit V4:", convertkitError);
        // Don't fail confirmation if Kit sync fails - local state is authoritative
      }
    }

    // Send welcome email
    const unsubscribeUrl = `https://featherpass.com/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`;
    
    try {
      await resend.emails.send({
        from: "Featherpass Newsletter <newsletter@system.featherpass.com>",
        to: [subscriber.email],
        replyTo: "noreply@system.featherpass.com",
        subject: "Welcome to Featherpass!",
        html: createWelcomeEmail(subscriber.email, unsubscribeUrl),
      });
      console.log(`Welcome email sent to ${subscriber.email}`);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail confirmation if email fails
    }

    // Redirect to success page or show success message
    return new Response(
      `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="3;url=https://featherpass.com/newsletter"></head><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #d4af37;">Subscription Confirmed!</h1>
        <p>Thank you for confirming your subscription. Welcome to Featherpass!</p>
        <p>Redirecting you back to the newsletter page...</p>
      </body></html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Newsletter confirmation error:", error);
    return new Response(
      `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>Error</h1>
        <p>An error occurred while confirming your subscription. Please try again or contact support.</p>
      </body></html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  }
});