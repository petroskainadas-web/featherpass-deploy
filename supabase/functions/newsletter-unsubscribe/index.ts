import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Kit V4 Configuration
const KIT_BASE_URL = "https://api.kit.com/v4";
const KIT_TAG_ACTIVE_ID = Deno.env.get("KIT_TAG_ACTIVE_ID")!;
const KIT_TAG_UNSUBSCRIBED_ID = Deno.env.get("KIT_TAG_UNSUBSCRIBED_ID")!;

interface UnsubscribeRequest {
  token: string;
  reason?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, reason }: UnsubscribeRequest = await req.json();

    // Validate token
    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ error: "Unsubscribe token is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate token is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return new Response(
        JSON.stringify({ error: "Invalid unsubscribe token format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize reason if provided
    const sanitizedReason = reason?.trim().substring(0, 500) || null;

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find subscriber by unsubscribe token
    const { data: subscriber, error: findError } = await supabaseClient
      .from("newsletter_subscribers")
      .select("id, email, unsubscribed, convertkit_subscriber_id")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (findError) {
      console.error("Error finding subscriber:", findError);
      throw new Error("Database error while processing unsubscribe request");
    }

    if (!subscriber) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid or expired unsubscribe link" 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if already unsubscribed
    if (subscriber.unsubscribed) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "You have already been unsubscribed from our newsletter.",
          email: subscriber.email
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update subscriber to unsubscribed - LOCAL STATE IS AUTHORITATIVE
    const { error: updateError } = await supabaseClient
      .from("newsletter_subscribers")
      .update({
        unsubscribed: true,
        unsubscribed_at: new Date().toISOString(),
        unsubscribe_reason: sanitizedReason,
        convertkit_synced: false, // Will be synced next
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      throw new Error("Failed to process unsubscribe request");
    }

    console.log(`Newsletter unsubscribe: ${subscriber.email}${sanitizedReason ? ` (Reason: ${sanitizedReason})` : ''}`);

    // Sync to Kit V4 (Golden Plan implementation)
    const kitApiKey = Deno.env.get("KIT_API_KEY");
    
    if (kitApiKey && subscriber.convertkit_subscriber_id) {
      try {
        const kitId = subscriber.convertkit_subscriber_id;

        // Step 1: Call official unsubscribe endpoint
        const unsubRes = await fetch(
          `${KIT_BASE_URL}/subscribers/${kitId}/unsubscribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Kit-Api-Key": kitApiKey,
            },
            body: "{}",
          }
        );

        if (!unsubRes.ok) {
          let errorJson: any = null;
          try { 
            errorJson = await unsubRes.json(); 
          } catch {}
          console.error("Kit v4 unsubscribe failed", unsubRes.status, errorJson);
          // Don't throw - local unsubscribe is authoritative
        } else {
          console.log(`Kit subscriber unsubscribed: ${kitId}`);

          // Step 2: Adjust tags (parallel requests)
          const tagRequests = [
            // Remove Active tag
            fetch(`${KIT_BASE_URL}/tags/${KIT_TAG_ACTIVE_ID}/subscribers/${kitId}`, {
              method: "DELETE",
              headers: { "X-Kit-Api-Key": kitApiKey },
            }),
            // Add Unsubscribed tag
            fetch(`${KIT_BASE_URL}/tags/${KIT_TAG_UNSUBSCRIBED_ID}/subscribers/${kitId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Kit-Api-Key": kitApiKey,
              },
              body: "{}",
            }),
          ];

          await Promise.all(tagRequests);
          console.log(`Kit tags adjusted for unsubscribed: ${kitId}`);

          // Step 3: Mark as synced only on success
          await supabaseClient
            .from("newsletter_subscribers")
            .update({ convertkit_synced: true })
            .eq("id", subscriber.id);

          console.log(`Kit sync complete for unsubscribe: ${subscriber.email}`);
        }
      } catch (convertkitError) {
        console.error("Error syncing to Kit V4:", convertkitError);
        // Don't fail unsubscribe if Kit sync fails - local state is authoritative
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "You have been successfully unsubscribed from our newsletter.",
        email: subscriber.email
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Newsletter unsubscribe error:", error);
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