import Redis from 'ioredis';
import { config } from './index.js';

const redis = new Redis(config.redis.url);

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

export default redis;

// Cache helpers
export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function setCache(key: string, data: unknown, ttl = 300): Promise<void> {
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
}

export async function deleteCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
