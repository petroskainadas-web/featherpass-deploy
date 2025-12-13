import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is an editor or admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has editor or admin role
    const { data: roleCheck } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['editor', 'admin']);

    if (!roleCheck || roleCheck.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Editor or Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all newsletter subscribers
    const { data: subscribers, error: fetchError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

    // Generate CSV
    const csvRows = [];
    csvRows.push(['Email', 'Confirmed', 'Subscribed At', 'Unsubscribed', 'Unsubscribed At', 'Source', 'Unsubscribe Reason', 'ConvertKit Synced', 'Resubscribed Count'].join(','));

    for (const subscriber of subscribers) {
      csvRows.push([
        subscriber.email,
        subscriber.confirmed ? 'Yes' : 'No',
        new Date(subscriber.subscribed_at).toISOString(),
        subscriber.unsubscribed ? 'Yes' : 'No',
        subscriber.unsubscribed_at ? new Date(subscriber.unsubscribed_at).toISOString() : '',
        subscriber.source || '',
        subscriber.unsubscribe_reason ? `"${subscriber.unsubscribe_reason.replace(/"/g, '""')}"` : '',
        subscriber.convertkit_synced ? 'Yes' : 'No',
        subscriber.resubscribed_count.toString()
      ].join(','));
    }

    const csv = csvRows.join('\n');

    console.log(`Exported ${subscribers.length} newsletter subscribers`);

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error in export-newsletter-subscribers:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
