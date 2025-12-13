import { supabase } from "@/integrations/supabase/client";

export const handlePdfDownload = async (
  contentId: string, 
  onProgress?: (progress: number) => void
) => {
  try {
    onProgress?.(25);
    
    const { data, error } = await supabase.functions.invoke('download-content-pdf', {
      body: { contentId }
    });

    onProgress?.(50);
    
    if (error) throw error;
    if (!data?.signedUrl) throw new Error('No download URL received');

    onProgress?.(75);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = data.signedUrl;
    link.download = data.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onProgress?.(100);

    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};