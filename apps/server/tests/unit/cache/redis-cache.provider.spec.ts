import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RedisCacheProvider } from '../../../src/providers/cache/redis-cache.provider.js';
import { env } from '../../../src/config/env.config.js';

describe('RedisCacheProvider Unit Tests', () => {
  let cache: RedisCacheProvider;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate deterministic MD5 query keys', () => {
    const key1 = RedisCacheProvider.createKey('search', { query: 'Autonomous Drone Navigation', topK: 10 });
    const key2 = RedisCacheProvider.createKey('search', { query: 'Autonomous Drone Navigation', topK: 10 });
    const key3 = RedisCacheProvider.createKey('search', { query: 'Autonomous Drone Navigation', topK: 5 });

    expect(key1).toEqual(key2);
    expect(key1).not.toEqual(key3);
    expect(key1.startsWith('search:')).toBe(true);
  });

  it('should bypass cache operations when ENABLE_QUERY_CACHE is false', async () => {
    vi.spyOn(env, 'ENABLE_QUERY_CACHE', 'get').mockReturnValue(false);

    cache = new RedisCacheProvider();
    expect(cache.isAvailable()).toBe(false);

    await cache.set('search:test', { data: 'sample' });
    const val = await cache.get('search:test');

    expect(val).toBeNull();
  });

  it('should store and retrieve data via in-memory fallback cache when enabled', async () => {
    vi.spyOn(env, 'ENABLE_QUERY_CACHE', 'get').mockReturnValue(true);

    cache = new RedisCacheProvider();
    await cache.set('search:drone', { count: 5, results: ['US-101'] }, 300);

    const val = await cache.get<{ count: number; results: string[] }>('search:drone');
    expect(val).not.toBeNull();
    expect(val?.count).toBe(5);
    expect(val?.results).toEqual(['US-101']);
  });

  it('should respect TTL expiration for in-memory fallback cache', async () => {
    vi.spyOn(env, 'ENABLE_QUERY_CACHE', 'get').mockReturnValue(true);

    cache = new RedisCacheProvider();
    // Set item with -1 second TTL (already expired)
    await cache.set('search:expired', { data: 'old' }, -1);

    const val = await cache.get('search:expired');
    expect(val).toBeNull();
  });

  it('should flush cached items correctly', async () => {
    vi.spyOn(env, 'ENABLE_QUERY_CACHE', 'get').mockReturnValue(true);

    cache = new RedisCacheProvider();
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');

    await cache.flush();

    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBeNull();
  });
});
