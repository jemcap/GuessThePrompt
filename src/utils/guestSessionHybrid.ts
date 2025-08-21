/**
 * Hybrid Guest Session Management
 * 
 * Combines in-memory storage with server synchronization
 * for optimal performance and security.
 */

interface GuestSessionState {
  sessionId: string | null;
  isInitialized: boolean;
  lastSync: Date | null;
}

class GuestSessionManager {
  private state: GuestSessionState = {
    sessionId: null,
    isInitialized: false,
    lastSync: null,
  };

  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private syncTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize guest session
   * Checks server first, then creates if needed
   */
  async initialize(): Promise<string> {
    if (this.state.isInitialized && this.state.sessionId) {
      return this.state.sessionId;
    }

    try {
      // Check if server has existing session
      const existingSession = await this.checkServerSession();
      
      if (existingSession) {
        this.state.sessionId = existingSession;
      } else {
        // Create new session on server
        this.state.sessionId = await this.createServerSession();
      }

      this.state.isInitialized = true;
      this.state.lastSync = new Date();
      
      // Start periodic sync
      this.startPeriodicSync();
      
      return this.state.sessionId;
    } catch (error) {
      console.error('Failed to initialize guest session:', error);
      throw error;
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.state.sessionId;
  }

  /**
   * Check if session exists
   */
  hasSession(): boolean {
    return this.state.sessionId !== null;
  }

  /**
   * Clear session
   */
  async clearSession(): Promise<void> {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (this.state.sessionId) {
      try {
        await this.deleteServerSession();
      } catch (error) {
        console.error('Failed to clear server session:', error);
      }
    }

    this.state = {
      sessionId: null,
      isInitialized: false,
      lastSync: null,
    };
  }

  /**
   * Force sync with server
   */
  async syncWithServer(): Promise<void> {
    if (!this.state.sessionId) return;

    try {
      const serverSession = await this.checkServerSession();
      
      if (!serverSession) {
        // Session expired on server, clear local state
        await this.clearSession();
      } else {
        this.state.lastSync = new Date();
      }
    } catch (error) {
      console.error('Server sync failed:', error);
    }
  }

  /**
   * Start periodic synchronization
   */
  private startPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      this.syncWithServer();
    }, this.SYNC_INTERVAL);
  }

  /**
   * Check existing session on server
   */
  private async checkServerSession(): Promise<string | null> {
    try {
      const response = await fetch('http://localhost:3003/api/v1/guest/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.sessionId;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to check server session:', error);
      return null;
    }
  }

  /**
   * Create new session on server
   */
  private async createServerSession(): Promise<string> {
    const response = await fetch('http://localhost:3003/api/v1/guest/session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create server session');
    }

    const data = await response.json();
    return data.sessionId;
  }

  /**
   * Delete session on server
   */
  private async deleteServerSession(): Promise<void> {
    await fetch('http://localhost:3003/api/v1/guest/session', {
      method: 'DELETE',
      credentials: 'include',
    });
  }
}

// Export singleton instance
export const guestSessionManager = new GuestSessionManager();

// Convenience functions for existing API compatibility
export async function getGuestSessionId(): Promise<string> {
  return await guestSessionManager.initialize();
}

export function hasGuestSession(): boolean {
  return guestSessionManager.hasSession();
}

export async function clearGuestSessionId(): Promise<void> {
  await guestSessionManager.clearSession();
}
