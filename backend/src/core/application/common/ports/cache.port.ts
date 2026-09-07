export const CACHE_PORT = Symbol('CACHE_PORT');

export interface ICachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  delPattern(pattern: string): Promise<void>;
  isRevoked(userId: string): Promise<boolean>;
  revokeUser(userId: string, ttlSeconds: number): Promise<void>;
}
