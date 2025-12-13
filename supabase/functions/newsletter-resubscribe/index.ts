import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Kit V4 Configuration
const KIT_BASE_URL = "https://api.kit.com/v4";
const KIT_TAG_ACTIVE_ID = Deno.env.get("KIT_TAG_ACTIVE_ID")!;
const KIT_TAG_UNSUBSCRIBED_ID = Deno.env.get("KIT_TAG_UNSUBSCRIBED_ID")!;

interface ResubscribeRequest {
  token?: string;
  email?: string;
}

const createWelcomeBackEmail = (email: string, unsubscribeUrl: string) => {
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
                      Welcome Back, Adventurer!
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px; color: #e5dcc8;">
                    <p style="font-size: 20px; line-height: 1.6; margin: 0 0 20px; font-weight: 600;">
                      The Journey Continues!
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      We're thrilled to have you back in the Featherpass community. You've been resubscribed to our newsletter and will once again receive:
                    </p>
                    
                    <div style="background-color: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 20px; margin: 30px 0;">
                      <ul style="margin: 0; padding-left: 20px; font-size: 16px; line-height: 1.8;">
                        <li style="margin-bottom: 10px;">Exclusive homebrew content for your campaigns</li>
                        <li style="margin-bottom: 10px;">Original fantasy artwork and world-building resources</li>
                        <li style="margin-bottom: 10px;">Behind-the-scenes insights from our creators</li>
                        <li style="margin-bottom: 10px;">Early access to new releases and special offers</li>
                      </ul>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin: 30px 0 0;">
                      While you were away, we've been crafting new adventures and expanding our collection. Check out what's new on our site!
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin: 20px 0 0; color: #d4af37; font-style: italic;">
                      Welcome back to the fold!<br>— The Featherpass Team
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: rgba(0,0,0,0.3); border-top: 2px solid #d4af37; border-radius: 0 0 6px 6px;">
                    <p style="font-size: 12px; line-height: 1.6; color: #8b7355; margin: 0; text-align: center;">
                      <strong>This is an automated message. Please do not reply to this email.</strong><br><br>
                      You're receiving this because you resubscribed to the Featherpass newsletter.<br>
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

  try {
    const { token, email }: ResubscribeRequest = await req.json();

    // Validate that at least one identifier is provided
    if ((!token || typeof token !== 'string') && (!email || typeof email !== 'string')) {
      return new Response(
        JSON.stringify({ error: "Either token or email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let query = supabaseClient
      .from("newsletter_subscribers")
      .select("id, email, unsubscribed, resubscribed_count, convertkit_subscriber_id, unsubscribe_token");

    // Find subscriber by token or email
    if (token) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(token)) {
        return new Response(
          JSON.stringify({ error: "Invalid token format" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      query = query.eq("unsubscribe_token", token);
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const sanitizedEmail = email!.trim().toLowerCase();
      if (!emailRegex.test(sanitizedEmail)) {
        return new Response(
          JSON.stringify({ error: "Invalid email format" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      query = query.eq("email", sanitizedEmail);
    }

    const { data: subscriber, error: findError } = await query.maybeSingle();

    if (findError) {
      console.error("Error finding subscriber:", findError);
      throw new Error("Database error while processing resubscribe request");
    }

    if (!subscriber) {
      return new Response(
        JSON.stringify({ 
          error: "Subscriber not found. Please use the newsletter form to subscribe." 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if not unsubscribed
    if (!subscriber.unsubscribed) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "You are already subscribed to our newsletter!",
          email: subscriber.email
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update subscriber to resubscribe
    const { error: updateError } = await supabaseClient
      .from("newsletter_subscribers")
      .update({
        unsubscribed: false,
        unsubscribed_at: null,
        unsubscribe_reason: null,
        resubscribed_count: subscriber.resubscribed_count + 1,
        convertkit_synced: false, // Will sync next
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      throw new Error("Failed to process resubscribe request");
    }

    console.log(`Newsletter resubscribe: ${subscriber.email} (count: ${subscriber.resubscribed_count + 1})`);

    // Sync to Kit V4 (Golden Plan - same 3-step as confirm)
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
            // NOTE: state field is ignored by Kit's create endpoint
          }),
        });

        const createJson = await createRes.json();
        
        if (!createRes.ok || !createJson.subscriber) {
          console.error("Kit v4 create subscriber failed", createRes.status, createJson);
        } else {
          const kitId = createJson.subscriber.id;
          console.log(`Kit subscriber created/updated for resubscribe: ${kitId}`);

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
            console.log(`Kit subscriber attached to form for resubscribe: ${kitId}`);

            // Step 3: Adjust tags (parallel requests)
            const tagRequests = [
              // Remove Unsubscribed tag
              fetch(`${KIT_BASE_URL}/tags/${KIT_TAG_UNSUBSCRIBED_ID}/subscribers/${kitId}`, {
                method: "DELETE",
                headers: { "X-Kit-Api-Key": kitApiKey },
              }),
              // Add Active tag
              fetch(`${KIT_BASE_URL}/tags/${KIT_TAG_ACTIVE_ID}/subscribers/${kitId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Kit-Api-Key": kitApiKey,
                },
                body: "{}",
              }),
            ];

            await Promise.all(tagRequests);
            console.log(`Kit tags adjusted for resubscribe: ${kitId}`);

            // Update Supabase - store Kit ID and mark as synced
            await supabaseClient
              .from("newsletter_subscribers")
              .update({
                convertkit_subscriber_id: kitId.toString(),
                convertkit_synced: true,
              })
              .eq("id", subscriber.id);

            console.log(`Kit sync complete for resubscribe: ${subscriber.email} (ID: ${kitId})`);
          }
        }
      } catch (convertkitError) {
        console.error("Error syncing to Kit V4:", convertkitError);
        // Don't fail resubscribe if Kit sync fails
      }
    }

    // Send welcome back email
    const unsubscribeUrl = `https://featherpass.com/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`;
    
    try {
      await resend.emails.send({
        from: "Featherpass Newsletter <newsletter@system.featherpass.com>",
        to: [subscriber.email],
        replyTo: "noreply@system.featherpass.com",
        subject: "Welcome Back to Featherpass!",
        html: createWelcomeBackEmail(subscriber.email, unsubscribeUrl),
      });
      console.log(`Welcome back email sent to ${subscriber.email}`);
    } catch (emailError) {
      console.error("Error sending welcome back email:", emailError);
      // Don't fail resubscribe if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Welcome back! You have been resubscribed to our newsletter.",
        email: subscriber.email
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Newsletter resubscribe error:", error);
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