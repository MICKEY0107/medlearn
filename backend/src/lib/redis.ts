// Redis disabled for local dev — no REDIS_URL required
export const redis = null as unknown

export async function connectRedis() {
  console.log('// Redis disabled for local dev.')
}

export async function getCached<T>(_key: string): Promise<T | null> {
  return null
}

export async function setCache(_key: string, _value: unknown, _ttlSeconds: number): Promise<void> {
  // no-op
}

export async function delCache(_key: string): Promise<void> {
  // no-op
}
