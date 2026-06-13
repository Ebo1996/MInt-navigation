/**
 * Simple in-memory cache for public API data.
 * Data is cached for TTL ms (default 5 minutes).
 * On first visit the network call happens; every subsequent
 * navigation within the same session returns instantly.
 */

const store = new Map(); // key → { data, expiresAt }
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const cache = {
  get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { store.delete(key); return null; }
    return entry.data;
  },

  set(key, data, ttl = DEFAULT_TTL) {
    store.set(key, { data, expiresAt: Date.now() + ttl });
  },

  /** Wrap an async fetcher: returns cached value or calls fetcher once */
  async fetch(key, fetcher, ttl = DEFAULT_TTL) {
    const cached = this.get(key);
    if (cached !== null) return cached;
    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  },

  invalidate(key) { store.delete(key); },
  clear() { store.clear(); },
};
