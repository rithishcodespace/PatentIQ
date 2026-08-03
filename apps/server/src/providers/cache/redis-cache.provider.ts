import ioredisModule from 'ioredis';
import crypto from 'node:crypto';
import type { ICacheProvider } from './cache-provider.interface.js';
import { env } from '../../config/env.config.js';

const RedisClient = (ioredisModule as any).default || ioredisModule;

export class RedisCacheProvider implements ICacheProvider {
  private client: any = null;
  private isConnected = false;
  private inMemoryCache = new Map<string, { value: any; expiresAt: number }>();

  constructor(redisUrl?: string) {
    if (!env.ENABLE_QUERY_CACHE) {
      console.log('[CacheProvider] Query caching is disabled via ENABLE_QUERY_CACHE=false.');
      return;
    }

    const connectionString = redisUrl || (env as any).REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.client = new RedisClient(connectionString, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        connectTimeout: 2000,
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('[CacheProvider] Connected to Redis server.');
      });

      this.client.on('error', (err: any) => {
        if (this.isConnected) {
          console.warn(`[CacheProvider] Redis connection error: ${err.message}. Falling back to in-memory cache.`);
        }
        this.isConnected = false;
      });

      // Attempt initial connection asynchronously
      this.client.connect().catch((err: any) => {
        console.warn(`[CacheProvider] Unable to connect to Redis (${err.message}). Using in-memory fallback cache.`);
        this.isConnected = false;
      });
    } catch (err: any) {
      console.warn(`[CacheProvider] Failed to initialize Redis client: ${err.message}`);
    }
  }

  isAvailable(): boolean {
    return env.ENABLE_QUERY_CACHE;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) return null;

    if (this.client && this.isConnected) {
      try {
        const raw = await this.client.get(key);
        if (raw) {
          return JSON.parse(raw) as T;
        }
        return null;
      } catch (err: any) {
        console.warn(`[CacheProvider] Redis GET failed for key "${key}": ${err.message}`);
      }
    }

    // Fallback to in-memory cache
    const item = this.inMemoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.inMemoryCache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = env.CACHE_TTL_SECONDS): Promise<void> {
    if (!this.isAvailable()) return;

    if (this.client && this.isConnected) {
      try {
        const payload = JSON.stringify(value);
        if (ttlSeconds > 0) {
          await this.client.set(key, payload, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, payload);
        }
        return;
      } catch (err: any) {
        console.warn(`[CacheProvider] Redis SET failed for key "${key}": ${err.message}`);
      }
    }

    // Fallback to in-memory cache
    const expiresAt = Date.now() + (ttlSeconds || 300) * 1000;
    this.inMemoryCache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.del(key);
      } catch (err: any) {
        console.warn(`[CacheProvider] Redis DEL failed for key "${key}": ${err.message}`);
      }
    }
    this.inMemoryCache.delete(key);
  }

  async flush(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.flushdb();
        console.log('[CacheProvider] Flushed Redis database cache.');
      } catch (err: any) {
        console.warn(`[CacheProvider] Redis FLUSHDB failed: ${err.message}`);
      }
    }
    this.inMemoryCache.clear();
    console.log('[CacheProvider] Flushed in-memory cache.');
  }

  /**
   * Helper method to generate deterministic cache keys from arbitrary request payloads.
   */
  static createKey(prefix: string, payload: unknown): string {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hash = crypto.createHash('md5').update(serialized).digest('hex');
    return `${prefix}:${hash}`;
  }
}
