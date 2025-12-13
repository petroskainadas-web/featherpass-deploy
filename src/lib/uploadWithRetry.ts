/**
 * Upload helper with automatic retry logic
 */

interface UploadOptions {
  maxRetries?: number;
  retryDelay?: number;
  onProgress?: (progress: number) => void;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function uploadWithRetry<T>(
  uploadFn: () => Promise<T>,
  options: UploadOptions = {}
): Promise<T> {
  const { 
    maxRetries = 3, 
    retryDelay = 2000,
    onProgress,
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      onProgress?.((attempt / (maxRetries + 1)) * 100);
      const result = await uploadFn();
      onProgress?.(100);
      return result;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        onRetry?.(attempt + 1, lastError);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw new Error(`Upload failed after ${maxRetries + 1} attempts: ${lastError!.message}`);
}

export function isNetworkError(error: Error): boolean {
  return error.message.includes('network') || 
         error.message.includes('timeout') ||
         error.message.includes('fetch');
}
