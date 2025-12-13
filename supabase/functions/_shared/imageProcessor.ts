/**
 * Shared image processing module for generating multiple image versions
 * Generates: thumbnail (300px), medium (800px), large (1600px) JPEGs + WebP
 * Deletes original after processing
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { Image } from 'https://deno.land/x/imagescript@1.3.0/mod.ts';

export interface ImageProcessingResult {
  thumbnail: { path: string; size: number };
  medium: { path: string; size: number };
  large: { path: string; size: number };
  webp: { path: string; size: number };
  dimensions: { width: number; height: number };
}

interface ResizeOptions {
  maxDimension: number;
  quality: number;
  format: 'jpeg' | 'webp';
}

/**
 * Resize image using ImageScript (Deno-compatible)
 * Returns resized data, size, and original dimensions
 */
async function resizeImage(
  imageData: ArrayBuffer,
  mimeType: string,
  options: ResizeOptions
): Promise<{ data: Uint8Array; size: number; originalWidth?: number; originalHeight?: number }> {
  try {
    console.log(`Decoding image (${mimeType})...`);
    
    // Decode the image using ImageScript
    const image = await Image.decode(new Uint8Array(imageData));
    const origWidth = image.width;
    const origHeight = image.height;
    
    console.log(`Original dimensions: ${origWidth}x${origHeight}`);
    
    // Calculate new dimensions maintaining aspect ratio
    const aspectRatio = origWidth / origHeight;
    let newWidth: number;
    let newHeight: number;

    if (origWidth > origHeight) {
      newWidth = Math.min(options.maxDimension, origWidth);
      newHeight = Math.round(newWidth / aspectRatio);
    } else {
      newHeight = Math.min(options.maxDimension, origHeight);
      newWidth = Math.round(newHeight * aspectRatio);
    }

    console.log(`Resizing to ${newWidth}x${newHeight}`);

    // Resize the image
    const resized = image.resize(newWidth, newHeight);
    
    // Encode to desired format
    let encodedData: Uint8Array;
    if (options.format === 'webp') {
      // ImageScript supports PNG, JPEG - use JPEG for WebP as closest alternative
      encodedData = await resized.encodeJPEG(options.quality);
    } else {
      encodedData = await resized.encodeJPEG(options.quality);
    }

    return {
      data: encodedData,
      size: encodedData.length,
      originalWidth: origWidth,
      originalHeight: origHeight,
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Process image: generate 4 versions (thumb, medium, large JPEGs + WebP)
 * Deletes original after successful processing
 */
export async function processAndCleanupImage(
  file: File,
  userId: string,
  bucket: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<ImageProcessingResult> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('Starting image processing for bucket:', bucket);
  
  // Read original image
  const originalData = await file.arrayBuffer();
  const mimeType = file.type || 'image/jpeg'; // Fallback to jpeg if type is missing
  
  // Generate base filename
  const baseFileName = crypto.randomUUID();
  const tempOriginalPath = `${userId}/${baseFileName}_temp_original.${file.name.split('.').pop()}`;
  
  // Upload original temporarily (needed for processing)
  console.log('Uploading temporary original:', tempOriginalPath);
  const { error: tempUploadError } = await supabase.storage
    .from(bucket)
    .upload(tempOriginalPath, originalData, {
      contentType: file.type,
      upsert: false,
    });
  
  if (tempUploadError) {
    throw new Error(`Failed to upload temporary original: ${tempUploadError.message}`);
  }
  
  try {
    // Generate thumbnail (300px, JPEG quality 80) - this will also give us original dimensions
    console.log('Generating thumbnail...');
    const thumbnail = await resizeImage(originalData, mimeType, {
      maxDimension: 300,
      quality: 80,
      format: 'jpeg',
    });
    const thumbnailPath = `${userId}/${baseFileName}_thumb.jpg`;
    
    // Store dimensions from first resize
    const dimensions = {
      width: thumbnail.originalWidth!,
      height: thumbnail.originalHeight!,
    };
    
    console.log('Original dimensions:', dimensions);
    
    // Generate medium (800px, JPEG quality 85)
    console.log('Generating medium...');
    const medium = await resizeImage(originalData, mimeType, {
      maxDimension: 800,
      quality: 85,
      format: 'jpeg',
    });
    const mediumPath = `${userId}/${baseFileName}_medium.jpg`;
    
    // Generate large (1600px, JPEG quality 90)
    console.log('Generating large...');
    const large = await resizeImage(originalData, mimeType, {
      maxDimension: 1600,
      quality: 90,
      format: 'jpeg',
    });
    const largePath = `${userId}/${baseFileName}_large.jpg`;
    
    // Generate WebP version of large (quality 85)
    console.log('Generating WebP...');
    const webp = await resizeImage(originalData, mimeType, {
      maxDimension: 1600,
      quality: 85,
      format: 'webp',
    });
    const webpPath = `${userId}/${baseFileName}_large.webp`;
    
    // Upload all versions in parallel
    console.log('Uploading all versions...');
    const [thumbResult, mediumResult, largeResult, webpResult] = await Promise.all([
      supabase.storage.from(bucket).upload(thumbnailPath, thumbnail.data, {
        contentType: 'image/jpeg',
        upsert: false,
      }),
      supabase.storage.from(bucket).upload(mediumPath, medium.data, {
        contentType: 'image/jpeg',
        upsert: false,
      }),
      supabase.storage.from(bucket).upload(largePath, large.data, {
        contentType: 'image/jpeg',
        upsert: false,
      }),
      supabase.storage.from(bucket).upload(webpPath, webp.data, {
        contentType: 'image/webp',
        upsert: false,
      }),
    ]);
    
    // Check for upload errors
    if (thumbResult.error) throw new Error(`Thumbnail upload failed: ${thumbResult.error.message}`);
    if (mediumResult.error) throw new Error(`Medium upload failed: ${mediumResult.error.message}`);
    if (largeResult.error) throw new Error(`Large upload failed: ${largeResult.error.message}`);
    if (webpResult.error) throw new Error(`WebP upload failed: ${webpResult.error.message}`);
    
    console.log('All versions uploaded successfully');
    
    // Delete temporary original
    console.log('Deleting temporary original:', tempOriginalPath);
    await supabase.storage.from(bucket).remove([tempOriginalPath]);
    
    return {
      thumbnail: { path: thumbnailPath, size: thumbnail.size },
      medium: { path: mediumPath, size: medium.size },
      large: { path: largePath, size: large.size },
      webp: { path: webpPath, size: webp.size },
      dimensions,
    };
  } catch (error) {
    // Clean up temporary original on error
    console.error('Error during processing, cleaning up:', error);
    await supabase.storage.from(bucket).remove([tempOriginalPath]);
    throw error;
  }
}
