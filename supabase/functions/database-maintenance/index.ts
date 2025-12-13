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

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'list-tables': {
        const tables = [
          { name: 'article_content', count: 0 },
          { name: 'library_content', count: 0 },
          { name: 'gallery_images', count: 0 },
          { name: 'images', count: 0 },
          { name: 'gallery_image_files', count: 0 },
          { name: 'content_pdfs', count: 0 },
          { name: 'newsletter_subscribers', count: 0 },
          { name: 'profiles', count: 0 },
          { name: 'user_roles', count: 0 }
        ];

        for (const table of tables) {
          const { count } = await supabase
            .from(table.name)
            .select('*', { count: 'exact', head: true });
          table.count = count || 0;
        }

        return new Response(JSON.stringify({ tables }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'find-orphaned': {
        // Find images not linked to any content
        const { data: allImages } = await supabase
          .from('images')
          .select('id')
          .eq('archived', false);

        const { data: usedImages } = await supabase
          .from('library_content')
          .select('image_id')
          .not('image_id', 'is', null);

        const usedImageIds = new Set(usedImages?.map(i => i.image_id) || []);
        const orphanedImages = allImages?.filter(img => !usedImageIds.has(img.id)) || [];

        // Find PDFs not linked to any content
        const { data: allPdfs } = await supabase
          .from('content_pdfs')
          .select('id')
          .eq('archived', false);

        const { data: usedPdfs } = await supabase
          .from('library_content')
          .select('pdf_id')
          .not('pdf_id', 'is', null);

        const usedPdfIds = new Set(usedPdfs?.map(p => p.pdf_id) || []);
        const orphanedPdfs = allPdfs?.filter(pdf => !usedPdfIds.has(pdf.id)) || [];

        // Find gallery image files not linked to gallery images
        const { data: allGalleryFiles } = await supabase
          .from('gallery_image_files')
          .select('id')
          .eq('archived', false);

        const { data: usedGalleryFiles } = await supabase
          .from('gallery_images')
          .select('image_file_id')
          .not('image_file_id', 'is', null);

        const usedGalleryFileIds = new Set(usedGalleryFiles?.map(g => g.image_file_id) || []);
        const orphanedGalleryFiles = allGalleryFiles?.filter(file => !usedGalleryFileIds.has(file.id)) || [];

        return new Response(JSON.stringify({
          orphanedImages: orphanedImages.length,
          orphanedPdfs: orphanedPdfs.length,
          orphanedGalleryFiles: orphanedGalleryFiles.length,
          details: {
            images: orphanedImages.map(i => i.id),
            pdfs: orphanedPdfs.map(p => p.id),
            galleryFiles: orphanedGalleryFiles.map(g => g.id)
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'cleanup-archived': {
        const { deleteAll } = body;
        let totalDeleted = 0;
        let filesDeleted = 0;

        // Determine the time filter
        const timeFilter = deleteAll 
          ? '1970-01-01' 
          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Clean up archived images
        const { data: archivedImages } = await supabase
          .from('images')
          .select('id, thumbnail_path, medium_path, large_path, webp_path')
          .eq('archived', true)
          .lt('created_at', timeFilter);

        if (archivedImages) {
          for (const image of archivedImages) {
            const paths = [image.thumbnail_path, image.medium_path, image.large_path, image.webp_path].filter(p => p);
            for (const path of paths) {
              const { error } = await supabase.storage.from('content-images').remove([path]);
              if (!error) filesDeleted++;
            }
            await supabase.from('images').delete().eq('id', image.id);
            totalDeleted++;
          }
        }

        // Clean up archived gallery image files
        const { data: archivedGalleryFiles } = await supabase
          .from('gallery_image_files')
          .select('id, thumbnail_path, medium_path, large_path, webp_path')
          .eq('archived', true)
          .lt('created_at', timeFilter);

        if (archivedGalleryFiles) {
          for (const file of archivedGalleryFiles) {
            const paths = [file.thumbnail_path, file.medium_path, file.large_path, file.webp_path].filter(p => p);
            for (const path of paths) {
              const { error } = await supabase.storage.from('gallery-images').remove([path]);
              if (!error) filesDeleted++;
            }
            await supabase.from('gallery_image_files').delete().eq('id', file.id);
            totalDeleted++;
          }
        }

        // Clean up archived PDFs
        const { data: archivedPdfs } = await supabase
          .from('content_pdfs')
          .select('id, file_path')
          .eq('archived', true)
          .lt('created_at', timeFilter);

        if (archivedPdfs) {
          for (const pdf of archivedPdfs) {
            if (pdf.file_path) {
              const { error } = await supabase.storage.from('content-pdfs').remove([pdf.file_path]);
              if (!error) filesDeleted++;
            }
            await supabase.from('content_pdfs').delete().eq('id', pdf.id);
            totalDeleted++;
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: `Cleaned up ${totalDeleted} archived items and ${filesDeleted} files`,
          deleted: totalDeleted,
          filesDeleted
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'cleanup-orphaned': {
        const { imageIds, pdfIds, galleryFileIds } = body;

        let deleted = 0;
        let filesDeleted = 0;

        // Delete orphaned images with storage files
        if (imageIds?.length > 0) {
          for (const imageId of imageIds) {
            const result = await deleteImage(supabase, imageId);
            if (result.success) {
              deleted += result.recordsDeleted;
              filesDeleted += result.filesDeleted;
            }
          }
        }

        // Delete orphaned PDFs with storage files
        if (pdfIds?.length > 0) {
          for (const pdfId of pdfIds) {
            const result = await deleteContentPdf(supabase, pdfId);
            if (result.success) {
              deleted += result.recordsDeleted;
              filesDeleted += result.filesDeleted;
            }
          }
        }

        // Delete orphaned gallery files with storage files
        if (galleryFileIds?.length > 0) {
          for (const fileId of galleryFileIds) {
            const result = await deleteGalleryImageFile(supabase, fileId);
            if (result.success) {
              deleted += result.recordsDeleted;
              filesDeleted += result.filesDeleted;
            }
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Deleted ${deleted} orphaned items and ${filesDeleted} files`,
          deleted,
          filesDeleted
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'recount-statistics': {
        // Recount article views and likes
        const { data: articles } = await supabase.from('article_content').select('id');
        
        for (const article of articles || []) {
          const { count: likeCount } = await supabase
            .from('article_likes')
            .select('*', { count: 'exact', head: true })
            .eq('article_id', article.id);

          await supabase
            .from('article_content')
            .update({ like_count: likeCount || 0 })
            .eq('id', article.id);
        }

        return new Response(JSON.stringify({ success: true, message: 'Statistics recounted successfully' }), {
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
    console.error('Database maintenance error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
