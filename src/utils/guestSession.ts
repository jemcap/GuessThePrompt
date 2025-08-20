/**
 * Guest Session Management Utility
 * 
 * Manages guest session IDs for tracking guest submissions
 * and enabling score transfer upon registration.
 */

/**
 * Get or create a guest session ID
 * Uses localStorage to persist the session ID across page reloads
 */
export function getGuestSessionId(): string {
  const STORAGE_KEY = 'guestSessionId';
  
  // Check if session ID already exists
  let sessionId = localStorage.getItem(STORAGE_KEY);
  
  // If not, generate a new UUID
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Clear the guest session ID
 * Called after successful registration with score transfer
 */
export function clearGuestSessionId(): void {
  localStorage.removeItem('guestSessionId');
}

/**
 * Check if a guest session exists
 */
export function hasGuestSession(): boolean {
  return localStorage.getItem('guestSessionId') !== null;
}

/**
 * Generate a UUID v4
 * Fallback implementation in case crypto.randomUUID is not available
 */
function generateUUID(): string {
  // Try to use the native crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}