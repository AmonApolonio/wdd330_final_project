// cache.js
// A simple caching mechanism for API responses

/**
 * Cache class to handle storing and retrieving data with expiration
 */
class Cache {
  constructor(expirationTime = 3600000) { // Default: 1 hour in milliseconds
    this.cache = {};
    this.defaultExpirationTime = expirationTime;
  }

  /**
   * Set a value in the cache with expiration
   * @param {string} key - The cache key
   * @param {*} value - The value to cache
   * @param {number} [expirationTime] - Custom expiration time in milliseconds
   */
  set(key, value, expirationTime = this.defaultExpirationTime) {
    this.cache[key] = {
      value,
      expiry: Date.now() + expirationTime
    };
    
    // Store in localStorage for persistence across page reloads
    try {
      const cacheEntry = {
        value,
        expiry: Date.now() + expirationTime
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
    } catch (e) {
      // If localStorage is full or unavailable, just use memory cache
      console.warn('Could not store in localStorage:', e);
    }
  }

  /**
   * Get a value from the cache
   * @param {string} key - The cache key
   * @returns {*} - The cached value or null if not found or expired
   */
  get(key) {
    // First try memory cache
    const memoryItem = this.cache[key];
    if (memoryItem && memoryItem.expiry > Date.now()) {
      return memoryItem.value;
    }
    
    // Try localStorage if not in memory or expired
    try {
      const storedItem = localStorage.getItem(`cache_${key}`);
      if (storedItem) {
        const parsed = JSON.parse(storedItem);
        if (parsed.expiry > Date.now()) {
          // Update memory cache
          this.cache[key] = parsed;
          return parsed.value;
        } else {
          // Remove expired items
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (e) {
      console.warn('Error retrieving from localStorage:', e);
    }
    
    return null;
  }

  /**
   * Remove a specific item from the cache
   * @param {string} key - The cache key to remove
   */
  remove(key) {
    delete this.cache[key];
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (e) {
      console.warn('Error removing from localStorage:', e);
    }
  }

  /**
   * Clear all cached data
   */
  clear() {
    this.cache = {};
    try {
      // Only clear our cache entries, not all localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Error clearing localStorage cache:', e);
    }
  }
}

// Create and export a shared cache instance
export const apiCache = new Cache();

/**
 * Wrap an async function with caching
 * @param {Function} fn - The async function to wrap
 * @param {Function} keyGenerator - Function that generates a cache key from the args
 * @param {number} [expirationTime] - Cache expiry time in milliseconds
 * @returns {Function} - Wrapped function with caching
 */
export function withCache(fn, keyGenerator, expirationTime) {
  return async function(...args) {
    const cacheKey = keyGenerator(...args);
    
    // Try to get from cache first
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }
    
    // If not in cache, call the function
    const result = await fn.apply(this, args);
    
    // Store the result in cache
    apiCache.set(cacheKey, result, expirationTime);
    
    return result;
  };
}
