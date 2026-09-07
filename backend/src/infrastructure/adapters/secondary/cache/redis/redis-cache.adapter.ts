import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { type ICachePort } from '../../../../../core/application/common/ports/cache.port.js';

@Injectable()
export class RedisCacheAdapter implements ICachePort, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheAdapter.name);
  private client: Redis | null = null;
  private readonly fallbackMemory = new Map<string, { value: unknown; expiry?: number }>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    try {
      this.client = new Redis({
        host,
        port,
        password: password || undefined,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn('Redis connection retry limit reached. Falling back to in-memory cache.');
            return null; // Stop retrying
          }
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
        connectTimeout: 2000,
      });

      this.client.connect().catch((err: Error) => {
        this.logger.warn(`Redis failed to connect (${err.message}). Using local in-memory fallback.`);
      });

      this.client.on('error', (err: Error) => {
        this.logger.debug(`Redis client error: ${err.message}`);
      });
    } catch (err: unknown) {
      this.logger.warn(`Could not initialize Redis client. In-memory fallback active. ${err}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.client && this.client.status === 'ready') {
      try {
        const raw = await this.client.get(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch (err: unknown) {
        this.logger.warn(`Redis get error on ${key}: ${err}`);
      }
    }

    const item = this.fallbackMemory.get(key);
    if (item) {
      if (item.expiry && item.expiry < Date.now()) {
        this.fallbackMemory.delete(key);
        return null;
      }
      return item.value as T;
    }
    return null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (this.client && this.client.status === 'ready') {
      try {
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
          await this.client.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, serialized);
        }
        return;
      } catch (err: unknown) {
        this.logger.warn(`Redis set error on ${key}: ${err}`);
      }
    }

    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.fallbackMemory.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    if (this.client && this.client.status === 'ready') {
      try {
        await this.client.del(key);
        return;
      } catch (err: unknown) {
        this.logger.warn(`Redis del error on ${key}: ${err}`);
      }
    }
    this.fallbackMemory.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    if (this.client && this.client.status === 'ready') {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
        return;
      } catch (err: unknown) {
        this.logger.warn(`Redis delPattern error on ${pattern}: ${err}`);
      }
    }

    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    for (const key of this.fallbackMemory.keys()) {
      if (regex.test(key)) {
        this.fallbackMemory.delete(key);
      }
    }
  }

  async isRevoked(userId: string): Promise<boolean> {
    const key = `auth:revocation:user:${userId}`;
    const result = await this.get<string>(key);
    return result !== null;
  }

  async revokeUser(userId: string, ttlSeconds: number): Promise<void> {
    const key = `auth:revocation:user:${userId}`;
    await this.set(key, new Date().toISOString(), ttlSeconds);
  }
}
