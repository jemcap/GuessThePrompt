/**
 * Advanced Guest Session Management with IndexedDB
 * 
 * Provides structured storage with better performance
 * and larger storage capacity.
 */

interface GuestSessionData {
  sessionId: string;
  createdAt: Date;
  lastActivity: Date;
  submissions: Array<{
    promptId: string;
    userPrompt: string;
    score: number;
    timestamp: Date;
  }>;
}

class GuestSessionDB {
  private dbName = 'GuessThePrompt';
  private version = 1;
  private storeName = 'guestSessions';

  /**
   * Initialize IndexedDB
   */
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'sessionId' });
          store.createIndex('createdAt', 'createdAt');
        }
      };
    });
  }

  /**
   * Get or create guest session
   */
  async getGuestSession(): Promise<GuestSessionData> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const sessions = request.result;
        
        if (sessions.length > 0) {
          // Return most recent session
          const session = sessions.sort((a, b) => 
            new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
          )[0];
          
          // Update last activity
          this.updateLastActivity(session.sessionId);
          resolve(session);
        } else {
          // Create new session
          const newSession: GuestSessionData = {
            sessionId: this.generateUUID(),
            createdAt: new Date(),
            lastActivity: new Date(),
            submissions: []
          };
          
          this.saveSession(newSession);
          resolve(newSession);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save guest session data
   */
  async saveSession(session: GuestSessionData): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.put(session);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update last activity timestamp
   */
  async updateLastActivity(sessionId: string): Promise<void> {
    const session = await this.getSessionById(sessionId);
    if (session) {
      session.lastActivity = new Date();
      await this.saveSession(session);
    }
  }

  /**
   * Add submission to guest session
   */
  async addSubmission(sessionId: string, submission: any): Promise<void> {
    const session = await this.getSessionById(sessionId);
    if (session) {
      session.submissions.push({
        ...submission,
        timestamp: new Date()
      });
      session.lastActivity = new Date();
      await this.saveSession(session);
    }
  }

  /**
   * Get session by ID
   */
  private async getSessionById(sessionId: string): Promise<GuestSessionData | null> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(sessionId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all guest sessions
   */
  async clearAllSessions(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generate UUID v4
   */
  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Export singleton instance
export const guestSessionDB = new GuestSessionDB();

// Convenience functions for existing API compatibility
export async function getGuestSessionId(): Promise<string> {
  const session = await guestSessionDB.getGuestSession();
  return session.sessionId;
}

export async function hasGuestSession(): Promise<boolean> {
  try {
    await guestSessionDB.getGuestSession();
    return true;
  } catch {
    return false;
  }
}

export async function clearGuestSessionId(): Promise<void> {
  await guestSessionDB.clearAllSessions();
}
