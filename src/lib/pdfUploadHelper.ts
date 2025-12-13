import { supabase } from "@/integrations/supabase/client";

export interface PdfUploadData {
  file: File;
  description: string;
}

export const uploadPdf = async (
  pdfData: PdfUploadData | null,
  userId: string,
  existingPdfId?: string | null
): Promise<string | null> => {
  if (!pdfData) return existingPdfId || null;

  try {
    // Generate unique file path with sanitized name
    const fileExt = 'pdf';
    const fileName = pdfData.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('content-pdfs')
      .upload(filePath, pdfData.file, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // If there's an existing PDF, mark it as archived
    if (existingPdfId) {
      await supabase
        .from('content_pdfs')
        .update({ archived: true })
        .eq('id', existingPdfId);
    }

    // Create metadata record
    const { data: pdfRecord, error: dbError } = await supabase
      .from('content_pdfs')
      .insert({
        file_path: filePath,
        file_name: fileName,
        file_size: pdfData.file.size,
        description: pdfData.description || null,
        created_by: userId,
      })
      .select('id')
      .single();

    if (dbError) {
      // If database insert fails, clean up the uploaded file
      await supabase.storage.from('content-pdfs').remove([filePath]);
      throw dbError;
    }

    return pdfRecord.id;
  } catch (error) {
    console.error('PDF upload error:', error);
    throw error;
  }
};

export const fetchPdfMetadata = async (pdfId: string) => {
  const { data, error } = await supabase
    .from('content_pdfs')
    .select('file_name, file_size, description')
    .eq('id', pdfId)
    .eq('archived', false)
    .single();

  if (error) {
    console.error('Error fetching PDF metadata:', error);
    return null;
  }

  return data;
};