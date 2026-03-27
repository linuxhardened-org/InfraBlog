// Redis is disabled by user request
export const redis = null;
export default redis;

// No-op cache helpers
export async function getCache<T>(_key: string): Promise<T | null> {
  return null;
}

export async function setCache(_key: string, _data: unknown, _ttl = 300): Promise<void> {
  // do nothing
}

export async function deleteCache(_pattern: string): Promise<void> {
  // do nothing
}
