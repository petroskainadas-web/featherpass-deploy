import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Kit V4 Configuration
const KIT_BASE_URL = "https://api.kit.com/v4";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Kit sync job...");

    const kitApiKey = Deno.env.get("KIT_API_KEY");
    
    if (!kitApiKey) {
      throw new Error("KIT_API_KEY not configured");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let unsubscribedCount = 0;
    let newSubscribersCount = 0;
    let totalChecked = 0;
    let after: string | null = null;

    // Implement cursor-based pagination (Golden Plan)
    do {
      // Build URL with pagination
      const url = new URL(`${KIT_BASE_URL}/subscribers`);
      if (after) {
        url.searchParams.set("after", after);
      }
      
      // Fetch page
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "X-Kit-Api-Key": kitApiKey },
      });

      if (!res.ok) {
        // Abort on API errors - don't mark any rows as synced for this page
        let errorJson: any = null;
        try { 
          errorJson = await res.json(); 
        } catch {}
        console.error(`Kit API error: ${res.status}`, errorJson);
        throw new Error(`Kit API request failed with status ${res.status}`);
      }

      const json = await res.json();
      const kitSubscribers = json.subscribers ?? [];
      const pagination = json.pagination ?? {};
      
      console.log(`Processing page with ${kitSubscribers.length} subscribers`);
      totalChecked += kitSubscribers.length;

      // Process this page
      for (const ks of kitSubscribers) {
        try {
          // Find subscriber in our database by email_address
          const { data: localSubscriber, error: findError } = await supabaseClient
            .from("newsletter_subscribers")
            .select("id, email, unsubscribed, confirmed, convertkit_subscriber_id")
            .eq("email", ks.email_address)
            .maybeSingle();

          if (findError) {
            console.error(`Error finding subscriber ${ks.email_address}:`, findError);
            continue;
          }

          // Case 1: Subscriber exists in Kit but NOT in our database
          if (!localSubscriber) {
            // Only import active subscribers (not cancelled)
            if (ks.state !== "cancelled") {
              const { error: insertError } = await supabaseClient
                .from("newsletter_subscribers")
                .insert({
                  email: ks.email_address,
                  confirmed: true, // Kit already confirmed them via double opt-in
                  convertkit_subscriber_id: ks.id.toString(),
                  convertkit_synced: true,
                  source: "kit_sync",
                  subscribed_at: ks.created_at ? new Date(ks.created_at).toISOString() : new Date().toISOString(),
                });

              if (insertError) {
                console.error(`Error inserting new subscriber ${ks.email_address}:`, insertError);
              } else {
                console.log(`Imported new subscriber from Kit: ${ks.email_address}`);
                newSubscribersCount++;
              }
            }
          }
          // Case 2: Subscriber exists locally and is cancelled in Kit
          else if (ks.state === "cancelled" && !localSubscriber.unsubscribed) {
            const { error: updateError } = await supabaseClient
              .from("newsletter_subscribers")
              .update({
                unsubscribed: true,
                unsubscribed_at: new Date().toISOString(),
                unsubscribe_reason: "Unsubscribed via Kit",
                convertkit_synced: true,
              })
              .eq("id", localSubscriber.id);

            if (updateError) {
              console.error(`Error updating subscriber ${ks.email_address}:`, updateError);
            } else {
              console.log(`Synced unsubscribe for: ${ks.email_address}`);
              unsubscribedCount++;
            }
          }
          // Case 3: Subscriber exists locally but doesn't have Kit ID yet
          else if (localSubscriber && !localSubscriber.convertkit_subscriber_id && ks.id) {
            const { error: updateError } = await supabaseClient
              .from("newsletter_subscribers")
              .update({
                convertkit_subscriber_id: ks.id.toString(),
                convertkit_synced: true,
              })
              .eq("id", localSubscriber.id);

            if (updateError) {
              console.error(`Error updating Kit ID for subscriber ${ks.email_address}:`, updateError);
            } else {
              console.log(`Updated Kit ID for: ${ks.email_address}`);
            }
          }
        } catch (subscriberError) {
          console.error(`Error processing subscriber ${ks.email_address}:`, subscriberError);
          // Continue with next subscriber
        }
      }

      // Get next cursor
      after = pagination.has_next_page ? pagination.end_cursor : null;
      
    } while (after);

    console.log(`Sync complete. Total checked: ${totalChecked}, Unsubscribed: ${unsubscribedCount}, New: ${newSubscribersCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sync complete. Unsubscribed ${unsubscribedCount}, imported ${newSubscribersCount} new subscribers.`,
        stats: {
          total_checked: totalChecked,
          unsubscribed: unsubscribedCount,
          new_subscribers: newSubscribersCount,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Kit sync error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Sync failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});