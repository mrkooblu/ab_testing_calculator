/**
 * Shared caching utilities for statistical calculations
 * Implements efficient caching with LRU (Least Recently Used) eviction policy
 */

/**
 * A simple LRU cache implementation for expensive calculations
 * This ensures we don't consume too much memory while still providing performance benefits
 */
export class LRUCache<T> {
  private cache: Map<string, T>;
  private maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.cache = new Map<string, T>();
    this.maxSize = maxSize;
  }
  
  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not found
   */
  get(key: string): T | undefined {
    if (!this.cache.has(key)) return undefined;
    
    // Access makes this entry most recently used
    const value = this.cache.get(key);
    
    // Move to the end (most recently used position)
    this.cache.delete(key);
    if (value !== undefined) {
      this.cache.set(key, value);
    }
    
    return value;
  }
  
  /**
   * Store a value in the cache
   * @param key The cache key
   * @param value The value to cache
   */
  set(key: string, value: T): void {
    // If key exists, refresh its position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } 
    // If we're at capacity, remove the oldest entry
    else if (this.cache.size >= this.maxSize) {
      const keysIterator = this.cache.keys();
      const firstKey = keysIterator.next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    // Add the new entry
    this.cache.set(key, value);
  }
  
  /**
   * Check if the cache contains a key
   * @param key The cache key to check
   * @returns True if the key exists in the cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Remove a value from the cache
   * @param key The cache key to remove
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get the current size of the cache
   * @returns The number of entries in the cache
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Factory function to create a memoized version of a function
 * Will cache results based on the function's arguments
 * 
 * @param fn The function to memoize
 * @param maxCacheSize Maximum number of entries to cache
 * @returns A memoized version of the function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  maxCacheSize: number = 100
): T {
  const cache = new LRUCache<ReturnType<T>>(maxCacheSize);
  
  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    // Create a cache key from the function arguments
    const key = args.map(arg => 
      typeof arg === 'object' 
        ? JSON.stringify(arg) 
        : String(arg)
    ).join('|');
    
    // Return cached result if available
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    // Calculate the result and cache it
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
  
  return memoized;
}

// Shared cache instances for common statistical functions
export const normCDFCache = new LRUCache<number>(200);
export const criticalZCache = new LRUCache<number>(50);
export const pValueCache = new LRUCache<number>(200);
export const curvePointsCache = new LRUCache<[number, number][]>(50); 