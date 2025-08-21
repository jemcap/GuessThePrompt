/**
 * Secure Guest Session Management with HTTP-Only Cookies
 * 
 * Uses server-side cookie management for better security
 * and automatic cleanup.
 */

/**
 * Request a guest session from the server
 * Server sets HTTP-only cookie automatically
 */
export async function initializeGuestSession(): Promise<string> {
  try {
    const response = await fetch('http://localhost:3003/api/v1/guest/session', {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to initialize guest session');
    }

    const data = await response.json();
    return data.sessionId;
  } catch (error) {
    console.error('Guest session initialization failed:', error);
    throw error;
  }
}

/**
 * Check if guest session exists (server-side validation)
 */
export async function hasGuestSession(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3003/api/v1/guest/session/check', {
      method: 'GET',
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('Guest session check failed:', error);
    return false;
  }
}

/**
 * Clear guest session (server-side cleanup)
 */
export async function clearGuestSession(): Promise<void> {
  try {
    await fetch('http://localhost:3003/api/v1/guest/session', {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Guest session cleanup failed:', error);
  }
}

/**
 * Get guest session ID from server
 * (Only needed for explicit transfers)
 */
export async function getGuestSessionId(): Promise<string | null> {
  try {
    const response = await fetch('http://localhost:3003/api/v1/guest/session', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.sessionId;
  } catch (error) {
    console.error('Failed to get guest session ID:', error);
    return null;
  }
}
