/**
 * Shared cascading delete utilities for proper deletion propagation
 * Handles deletion of database records and associated storage files
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface DeleteResult {
  success: boolean;
  filesDeleted: number;
  recordsDeleted: number;
  errors: string[];
}

/**
 * Delete files from storage bucket
 */
async function deleteStorageFiles(
  supabase: SupabaseClient,
  bucket: string,
  paths: (string | null)[]
): Promise<number> {
  const validPaths = paths.filter((p): p is string => p !== null && p !== undefined && p !== '');
  if (validPaths.length === 0) return 0;

  let deletedCount = 0;
  for (const path of validPaths) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (!error) deletedCount++;
  }
  
  return deletedCount;
}

/**
 * Delete library_content entry with cascading deletion
 */
export async function deleteLibraryContent(
  supabase: SupabaseClient,
  contentId: string
): Promise<DeleteResult> {
  const result: DeleteResult = { success: true, filesDeleted: 0, recordsDeleted: 0, errors: [] };

  try {
    // Get the library content record
    const { data: content, error: fetchError } = await supabase
      .from('library_content')
      .select('image_id, pdf_id')
      .eq('id', contentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete associated image
    if (content.image_id) {
      const { data: image } = await supabase
        .from('images')
        .select('thumbnail_path, medium_path, large_path, webp_path')
        .eq('id', content.image_id)
        .single();

      if (image) {
        const deleted = await deleteStorageFiles(supabase, 'content-images', [
          image.thumbnail_path, image.medium_path, image.large_path, image.webp_path
        ]);
        result.filesDeleted += deleted;

        await supabase.from('images').delete().eq('id', content.image_id);
        result.recordsDeleted++;
      }
    }

    // Delete associated PDF
    if (content.pdf_id) {
      const { data: pdf } = await supabase
        .from('content_pdfs')
        .select('file_path')
        .eq('id', content.pdf_id)
        .single();

      if (pdf) {
        const deleted = await deleteStorageFiles(supabase, 'content-pdfs', [pdf.file_path]);
        result.filesDeleted += deleted;

        await supabase.from('content_pdfs').delete().eq('id', content.pdf_id);
        result.recordsDeleted++;
      }
    }

    // Delete the library content record
    const { error: deleteError } = await supabase
      .from('library_content')
      .delete()
      .eq('id', contentId);

    if (deleteError) throw deleteError;
    result.recordsDeleted++;

  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

/**
 * Delete gallery_images entry with cascading deletion
 */
export async function deleteGalleryImage(
  supabase: SupabaseClient,
  imageId: string
): Promise<DeleteResult> {
  const result: DeleteResult = { success: true, filesDeleted: 0, recordsDeleted: 0, errors: [] };

  try {
    // Get the gallery image record
    const { data: galleryImage, error: fetchError } = await supabase
      .from('gallery_images')
      .select('image_file_id')
      .eq('id', imageId)
      .single();

    if (fetchError) throw fetchError;

    // Delete associated image file
    if (galleryImage.image_file_id) {
      const { data: imageFile } = await supabase
        .from('gallery_image_files')
        .select('thumbnail_path, medium_path, large_path, webp_path')
        .eq('id', galleryImage.image_file_id)
        .single();

      if (imageFile) {
        const deleted = await deleteStorageFiles(supabase, 'gallery-images', [
          imageFile.thumbnail_path, imageFile.medium_path, imageFile.large_path, imageFile.webp_path
        ]);
        result.filesDeleted += deleted;

        await supabase.from('gallery_image_files').delete().eq('id', galleryImage.image_file_id);
        result.recordsDeleted++;
      }
    }

    // Delete the gallery image record
    const { error: deleteError } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', imageId);

    if (deleteError) throw deleteError;
    result.recordsDeleted++;

  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

/**
 * Delete image with nullification of references
 */
export async function deleteImage(
  supabase: SupabaseClient,
  imageId: string
): Promise<DeleteResult> {
  const result: DeleteResult = { success: true, filesDeleted: 0, recordsDeleted: 0, errors: [] };

  try {
    // Nullify references in library_content
    await supabase
      .from('library_content')
      .update({ image_id: null })
      .eq('image_id', imageId);

    // Get image paths
    const { data: image } = await supabase
      .from('images')
      .select('thumbnail_path, medium_path, large_path, webp_path')
      .eq('id', imageId)
      .single();

    if (image) {
      const deleted = await deleteStorageFiles(supabase, 'content-images', [
        image.thumbnail_path, image.medium_path, image.large_path, image.webp_path
      ]);
      result.filesDeleted += deleted;
    }

    // Delete the image record
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (deleteError) throw deleteError;
    result.recordsDeleted++;

  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

/**
 * Delete gallery_image_file with nullification of references
 */
export async function deleteGalleryImageFile(
  supabase: SupabaseClient,
  fileId: string
): Promise<DeleteResult> {
  const result: DeleteResult = { success: true, filesDeleted: 0, recordsDeleted: 0, errors: [] };

  try {
    // Nullify references in gallery_images
    await supabase
      .from('gallery_images')
      .update({ image_file_id: null })
      .eq('image_file_id', fileId);

    // Get image file paths
    const { data: imageFile } = await supabase
      .from('gallery_image_files')
      .select('thumbnail_path, medium_path, large_path, webp_path')
      .eq('id', fileId)
      .single();

    if (imageFile) {
      const deleted = await deleteStorageFiles(supabase, 'gallery-images', [
        imageFile.thumbnail_path, imageFile.medium_path, imageFile.large_path, imageFile.webp_path
      ]);
      result.filesDeleted += deleted;
    }

    // Delete the image file record
    const { error: deleteError } = await supabase
      .from('gallery_image_files')
      .delete()
      .eq('id', fileId);

    if (deleteError) throw deleteError;
    result.recordsDeleted++;

  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

/**
 * Delete content_pdf with nullification of references
 */
export async function deleteContentPdf(
  supabase: SupabaseClient,
  pdfId: string
): Promise<DeleteResult> {
  const result: DeleteResult = { success: true, filesDeleted: 0, recordsDeleted: 0, errors: [] };

  try {
    // Nullify references in library_content
    await supabase
      .from('library_content')
      .update({ pdf_id: null })
      .eq('pdf_id', pdfId);

    // Get PDF path
    const { data: pdf } = await supabase
      .from('content_pdfs')
      .select('file_path')
      .eq('id', pdfId)
      .single();

    if (pdf) {
      const deleted = await deleteStorageFiles(supabase, 'content-pdfs', [pdf.file_path]);
      result.filesDeleted += deleted;
    }

    // Delete the PDF record
    const { error: deleteError } = await supabase
      .from('content_pdfs')
      .delete()
      .eq('id', pdfId);

    if (deleteError) throw deleteError;
    result.recordsDeleted++;

  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}
