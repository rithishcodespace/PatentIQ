import ioredisModule from 'ioredis';
import crypto from 'node:crypto';
import { env } from '../../config/env.config.js';
const RedisClient = ioredisModule.default || ioredisModule;
export class RedisCacheProvider {
    client = null;
    isConnected = false;
    inMemoryCache = new Map();
    constructor(redisUrl) {
        if (!env.ENABLE_QUERY_CACHE) {
            console.log('[CacheProvider] Query caching is disabled via ENABLE_QUERY_CACHE=false.');
            return;
        }
        const connectionString = redisUrl || env.REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';
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
            this.client.on('error', (err) => {
                if (this.isConnected) {
                    console.warn(`[CacheProvider] Redis connection error: ${err.message}. Falling back to in-memory cache.`);
                }
                this.isConnected = false;
            });
            // Attempt initial connection asynchronously
            this.client.connect().catch((err) => {
                console.warn(`[CacheProvider] Unable to connect to Redis (${err.message}). Using in-memory fallback cache.`);
                this.isConnected = false;
            });
        }
        catch (err) {
            console.warn(`[CacheProvider] Failed to initialize Redis client: ${err.message}`);
        }
    }
    isAvailable() {
        return env.ENABLE_QUERY_CACHE;
    }
    async get(key) {
        if (!this.isAvailable())
            return null;
        if (this.client && this.isConnected) {
            try {
                const raw = await this.client.get(key);
                if (raw) {
                    return JSON.parse(raw);
                }
                return null;
            }
            catch (err) {
                console.warn(`[CacheProvider] Redis GET failed for key "${key}": ${err.message}`);
            }
        }
        // Fallback to in-memory cache
        const item = this.inMemoryCache.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiresAt) {
            this.inMemoryCache.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, ttlSeconds = env.CACHE_TTL_SECONDS) {
        if (!this.isAvailable())
            return;
        if (this.client && this.isConnected) {
            try {
                const payload = JSON.stringify(value);
                if (ttlSeconds > 0) {
                    await this.client.set(key, payload, 'EX', ttlSeconds);
                }
                else {
                    await this.client.set(key, payload);
                }
                return;
            }
            catch (err) {
                console.warn(`[CacheProvider] Redis SET failed for key "${key}": ${err.message}`);
            }
        }
        // Fallback to in-memory cache
        const expiresAt = Date.now() + (ttlSeconds || 300) * 1000;
        this.inMemoryCache.set(key, { value, expiresAt });
    }
    async del(key) {
        if (this.client && this.isConnected) {
            try {
                await this.client.del(key);
            }
            catch (err) {
                console.warn(`[CacheProvider] Redis DEL failed for key "${key}": ${err.message}`);
            }
        }
        this.inMemoryCache.delete(key);
    }
    async flush() {
        if (this.client && this.isConnected) {
            try {
                await this.client.flushdb();
                console.log('[CacheProvider] Flushed Redis database cache.');
            }
            catch (err) {
                console.warn(`[CacheProvider] Redis FLUSHDB failed: ${err.message}`);
            }
        }
        this.inMemoryCache.clear();
        console.log('[CacheProvider] Flushed in-memory cache.');
    }
    /**
     * Helper method to generate deterministic cache keys from arbitrary request payloads.
     */
    static createKey(prefix, payload) {
        const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const hash = crypto.createHash('md5').update(serialized).digest('hex');
        return `${prefix}:${hash}`;
    }
}
//# sourceMappingURL=redis-cache.provider.js.map