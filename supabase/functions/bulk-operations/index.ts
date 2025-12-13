import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';
import {
  deleteLibraryContent,
  deleteGalleryImage,
  deleteImage,
  deleteGalleryImageFile,
  deleteContentPdf
} from '../_shared/cascadingDelete.ts';

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

    const { action, table, ids, data } = await req.json();

    switch (action) {
      case 'bulk-archive': {
        const { error } = await supabase
          .from(table)
          .update({ archived: true })
          .in('id', ids);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, archived: ids.length }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'bulk-delete': {
        let deleted = 0;
        let filesDeleted = 0;
        const errors: string[] = [];

        // Handle cascading deletes for special tables
        if (table === 'library_content') {
          for (const id of ids) {
            const result = await deleteLibraryContent(supabase, id);
            deleted += result.recordsDeleted;
            filesDeleted += result.filesDeleted;
            errors.push(...result.errors);
          }
        } else if (table === 'gallery_images') {
          for (const id of ids) {
            const result = await deleteGalleryImage(supabase, id);
            deleted += result.recordsDeleted;
            filesDeleted += result.filesDeleted;
            errors.push(...result.errors);
          }
        } else if (table === 'images') {
          for (const id of ids) {
            const result = await deleteImage(supabase, id);
            deleted += result.recordsDeleted;
            filesDeleted += result.filesDeleted;
            errors.push(...result.errors);
          }
        } else if (table === 'gallery_image_files') {
          for (const id of ids) {
            const result = await deleteGalleryImageFile(supabase, id);
            deleted += result.recordsDeleted;
            filesDeleted += result.filesDeleted;
            errors.push(...result.errors);
          }
        } else if (table === 'content_pdfs') {
          for (const id of ids) {
            const result = await deleteContentPdf(supabase, id);
            deleted += result.recordsDeleted;
            filesDeleted += result.filesDeleted;
            errors.push(...result.errors);
          }
        } else {
          // Simple delete for other tables
          const { error } = await supabase
            .from(table)
            .delete()
            .in('id', ids);

          if (error) throw error;
          deleted = ids.length;
        }

        return new Response(JSON.stringify({ 
          success: errors.length === 0, 
          deleted,
          filesDeleted,
          errors: errors.length > 0 ? errors : undefined
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'bulk-export': {
        const { data: records, error } = await supabase
          .from(table)
          .select('*')
          .in('id', ids);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, data: records }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'bulk-import': {
        const { error } = await supabase
          .from(table)
          .insert(data);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, imported: data.length }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Bulk operations error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
