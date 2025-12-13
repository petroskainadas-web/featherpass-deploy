import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { validateEnvVar, validateAuthHeader, getErrorMessage } from '../_shared/utils.ts';
import { RateLimiter, getClientIdentifier, createRateLimitResponse } from '../_shared/rateLimiter.ts';
import { validateFile, validateImageMagicBytes } from '../_shared/validation.ts';
import { processAndCleanupImage } from '../_shared/imageProcessor.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

// Rate limiter: 30 uploads per hour per user
const rateLimiter = new RateLimiter({
  maxRequests: 30,
  windowMs: 60 * 60 * 1000, // 1 hour
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment
    const supabaseUrl = validateEnvVar('SUPABASE_URL');
    const supabaseKey = validateEnvVar('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user first
    const token = validateAuthHeader(req.headers.get('Authorization'));
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Rate limiting
    const clientId = getClientIdentifier(req, user.id);
    const rateLimit = rateLimiter.isAllowed(clientId);
    
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetTime);
    }

    // Parse and validate form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const oldImageFileId = formData.get('oldImageFileId') as string;

    // Validate file
    const fileValidation = validateFile(file, {
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSizeBytes: 10 * 1024 * 1024, // 10MB for gallery
      requireMagicBytes: true,
    });

    if (!fileValidation.valid) {
      throw new Error(fileValidation.error);
    }

    // Validate magic bytes
    const magicValidation = await validateImageMagicBytes(file);
    if (!magicValidation.valid) {
      throw new Error(magicValidation.error);
    }

    console.log('Processing gallery image with multi-version generation...');

    // Process image: generate thumbnail, medium, large JPEGs + WebP
    const result = await processAndCleanupImage(
      file,
      user.id,
      'gallery-images',
      supabaseUrl,
      supabaseKey
    );

    console.log('Gallery image processing complete:', result);

    // Get public URLs for all versions
    const { data: { publicUrl: thumbnailUrl } } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(result.thumbnail.path);

    const { data: { publicUrl: largeUrl } } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(result.large.path);

    // Create metadata record in gallery_image_files with all paths
    const { data: imageFileData, error: insertError } = await supabase
      .from('gallery_image_files')
      .insert({
        thumbnail_path: result.thumbnail.path,
        medium_path: result.medium.path,
        large_path: result.large.path,
        webp_path: result.webp.path,
        file_size: result.thumbnail.size + result.medium.size + result.large.size + result.webp.size,
        width: result.dimensions.width,
        height: result.dimensions.height,
        mime_type: 'image/jpeg',
        created_by: user.id,
        archived: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      // Clean up uploaded files
      await supabase.storage.from('gallery-images').remove([
        result.thumbnail.path,
        result.medium.path,
        result.large.path,
        result.webp.path,
      ]);
      throw new Error(`Failed to create image file record: ${insertError.message}`);
    }

    console.log('Gallery image file metadata created:', imageFileData);

    // If replacing an old image, mark it as archived
    if (oldImageFileId) {
      console.log('Archiving old image file:', oldImageFileId);
      await supabase
        .from('gallery_image_files')
        .update({
          archived: true,
          replaced_by: imageFileData.id,
        })
        .eq('id', oldImageFileId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageFileId: imageFileData.id,
        thumbnailUrl,
        largeUrl,
        metadata: imageFileData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error in process-gallery-image function:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
