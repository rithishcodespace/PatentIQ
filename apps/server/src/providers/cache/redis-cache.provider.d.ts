import type { ICacheProvider } from './cache-provider.interface.js';
export declare class RedisCacheProvider implements ICacheProvider {
    private client;
    private isConnected;
    private inMemoryCache;
    constructor(redisUrl?: string);
    isAvailable(): boolean;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    flush(): Promise<void>;
    /**
     * Helper method to generate deterministic cache keys from arbitrary request payloads.
     */
    static createKey(prefix: string, payload: unknown): string;
}
//# sourceMappingURL=redis-cache.provider.d.ts.map