/**
 * Enhanced request validation utilities
 */

export interface FileValidation {
  allowedTypes: string[];
  maxSizeBytes: number;
  requireMagicBytes?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file upload against constraints
 */
export function validateFile(
  file: File,
  config: FileValidation
): ValidationResult {
  // Check file presence
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Validate MIME type
  if (!config.allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${config.allowedTypes.join(', ')}` 
    };
  }

  // Validate file size
  if (file.size > config.maxSizeBytes) {
    const maxMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(1);
    return { 
      valid: false, 
      error: `File size exceeds ${maxMB}MB limit` 
    };
  }

  // Validate filename (prevent path traversal)
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { 
      valid: false, 
      error: 'Invalid filename' 
    };
  }

  return { valid: true };
}

/**
 * Validate magic bytes for image files
 */
export async function validateImageMagicBytes(
  file: File
): Promise<ValidationResult> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Check magic bytes for common image formats
  const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
  const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  const isWEBP = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;

  if (!isPNG && !isJPEG && !isWEBP) {
    return { 
      valid: false, 
      error: 'Invalid image format detected. File may be corrupted or not a valid image.' 
    };
  }

  return { valid: true };
}

/**
 * Sanitize text input
 */
export function sanitizeText(
  text: string | null | undefined,
  maxLength?: number
): string | null {
  if (!text) return null;

  let sanitized = text.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Apply length limit if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized || null;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate request origin (basic CORS check)
 */
export function validateOrigin(req: Request, allowedOrigins: string[]): boolean {
  const origin = req.headers.get('origin');
  
  if (!origin) return false;
  
  // Allow wildcard
  if (allowedOrigins.includes('*')) return true;
  
  // Check against allowed list
  return allowedOrigins.some(allowed => {
    if (allowed.endsWith('/*')) {
      // Wildcard subdomain support
      const base = allowed.slice(0, -2);
      return origin.startsWith(base);
    }
    return origin === allowed;
  });
}
