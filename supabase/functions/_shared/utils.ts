/**
 * Shared utilities for edge functions
 * Provides type-safe error handling and validation
 */

/**
 * Type guard to check if an error has a message property
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Validate and return environment variable with meaningful error
 */
export function validateEnvVar(name: string): string {
  const value = Deno.env.get(name);
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  
  return value;
}

/**
 * Validate and extract authorization header
 */
export function validateAuthHeader(authHeader: string | null): string {
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid Authorization header format');
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Empty authorization token');
  }
  
  return token;
}
