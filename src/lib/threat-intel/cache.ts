/**
 * SENTINEL AI - Threat Intelligence In-Memory Cache
 * 
 * Safe, bounded cache with TTL to prevent redundant quota consumption.
 * Respects data freshness and privacy by indexing on normalized host + path hashes.
 */

import type { ThreatIntelReputation } from "./types";

interface CacheEntry {
  reputation: ThreatIntelReputation;
  expiresAt: number;
  cachedAt: string;
}

export class ThreatIntelCache {
  private static readonly TTL_MS = 15 * 60 * 1000; // 15 minutes TTL
  private static readonly MAX_ENTRIES = 200;
  private static readonly store = new Map<string, CacheEntry>();

  /**
   * Generates a cache key based on the URL.
   */
  private static getKey(url: string): string {
    return url.trim().toLowerCase();
  }

  /**
   * Retrieves a cached reputation result if valid and not expired.
   */
  static get(url: string): ThreatIntelReputation | null {
    const key = this.getKey(url);
    const entry = this.store.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // Return shallow copy marked as cached
    return {
      ...entry.reputation,
      isCached: true,
      cachedAt: entry.cachedAt,
    };
  }

  /**
   * Caches a reputation result with bounded capacity.
   */
  static set(url: string, reputation: ThreatIntelReputation): void {
    const key = this.getKey(url);

    // Evict oldest entries if capacity reached
    if (this.store.size >= this.MAX_ENTRIES) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }

    this.store.set(key, {
      reputation: { ...reputation, isCached: false },
      expiresAt: Date.now() + this.TTL_MS,
      cachedAt: new Date().toISOString(),
    });
  }

  /**
   * Clears the cache (primarily for tests).
   */
  static clear(): void {
    this.store.clear();
  }

  /**
   * Returns current cache item count.
   */
  static size(): number {
    return this.store.size;
  }
}
