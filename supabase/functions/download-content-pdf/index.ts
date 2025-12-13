import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { validateEnvVar, getErrorMessage } from '../_shared/utils.ts';

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
    const supabaseUrl = validateEnvVar('SUPABASE_URL');
    const supabaseKey = validateEnvVar('SUPABASE_SERVICE_ROLE_KEY');
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { contentId } = await req.json();

    if (!contentId) {
      return new Response(
        JSON.stringify({ error: 'Content ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing download for content: ${contentId}`);

    // Get the content with its PDF reference
    const { data: content, error: contentError } = await supabaseClient
      .from('library_content')
      .select('pdf_id')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      console.error('Content not found:', contentError);
      return new Response(
        JSON.stringify({ error: 'Content not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!content.pdf_id) {
      console.error('No PDF attached to this content');
      return new Response(
        JSON.stringify({ error: 'No PDF available for this content' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the PDF metadata
    const { data: pdf, error: pdfError } = await supabaseClient
      .from('content_pdfs')
      .select('file_path, file_name')
      .eq('id', content.pdf_id)
      .eq('archived', false)
      .single();

    if (pdfError || !pdf) {
      console.error('PDF not found:', pdfError);
      return new Response(
        JSON.stringify({ error: 'PDF not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate signed URL with 5-minute expiry
    const { data: signedUrlData, error: signedUrlError } = await supabaseClient
      .storage
      .from('content-pdfs')
      .createSignedUrl(pdf.file_path, 300); // 5 minutes

    if (signedUrlError || !signedUrlData) {
      console.error('Failed to generate signed URL:', signedUrlError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate download link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generated signed URL for ${pdf.file_name}`);

    // Increment download counter atomically AFTER successful URL generation
    const { error: incrementError } = await supabaseClient
      .rpc('increment_library_download_count', { content_id: contentId });

    if (incrementError) {
      console.error('Failed to update download count:', incrementError);
      // Continue anyway - we don't want to fail the download
    } else {
      console.log(`Incremented download count for ${contentId}`);
    }

    // Return the signed URL and filename
    return new Response(
      JSON.stringify({
        signedUrl: signedUrlData.signedUrl,
        fileName: pdf.file_name,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error processing download:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});