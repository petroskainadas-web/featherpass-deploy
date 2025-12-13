import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, backupData, bucket } = await req.json();

    if (action === 'export') {
      const tables = [
        'article_content',
        'library_content',
        'gallery_images',
        'images',
        'gallery_image_files',
        'content_pdfs',
        'newsletter_subscribers',
        'article_likes'
      ];

      const backup: Record<string, any[]> = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.error(`Error exporting ${table}:`, error);
          continue;
        }
        backup[table] = data || [];
      }

      return new Response(JSON.stringify({
        success: true,
        backup: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          data: backup
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'export-storage') {
      const buckets = bucket ? [bucket] : ['content-images', 'gallery-images', 'content-pdfs'];
      const storageManifest: any = {};

      for (const bucketName of buckets) {
        const { data: files, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

        if (error) {
          console.error(`Error listing bucket ${bucketName}:`, error);
          continue;
        }

        storageManifest[bucketName] = files?.map(file => ({
          name: file.name,
          id: file.id,
          created_at: file.created_at,
          metadata: file.metadata
        })) || [];
      }

      return new Response(JSON.stringify({
        success: true,
        manifest: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          buckets: storageManifest
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'restore') {
      if (!backupData?.data) {
        return new Response(JSON.stringify({ error: 'Invalid backup data' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let restored = 0;

      for (const [table, records] of Object.entries(backupData.data)) {
        if (!Array.isArray(records) || records.length === 0) continue;

        const { error } = await supabase.from(table).upsert(records, {
          onConflict: 'id'
        });

        if (error) {
          console.error(`Error restoring ${table}:`, error);
          continue;
        }

        restored += records.length;
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Restored ${restored} records`,
        timestamp: backupData.timestamp
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database backup error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
