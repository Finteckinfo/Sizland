/**
 * In-memory nonce store with expiration
 * In production, replace this with Redis for distributed systems
 */

interface NonceEntry {
  nonce: string;
  expiresAt: number;
}

class NonceStore {
  private store: Map<string, NonceEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired nonces every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, nonce: string, ttlSeconds: number = 600): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.store.set(key, { nonce, expiresAt });
  }

  get(key: string): string | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.nonce;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance
export const nonceStore = new NonceStore();
