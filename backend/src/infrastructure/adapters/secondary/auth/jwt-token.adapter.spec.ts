import { describe, it, expect, beforeEach } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtTokenAdapter } from './jwt-token.adapter.js';

describe('JwtTokenAdapter', () => {
  let adapter: JwtTokenAdapter;
  let mockCache: any;

  beforeEach(() => {
    const jwtService = new JwtService({
      secret: 'supersecret_jwt_key_crm_development_replace_in_prod_12345',
    });
    const configService = new ConfigService();
    mockCache = {
      set: () => Promise.resolve(),
      get: () => Promise.resolve(null),
      del: () => Promise.resolve(),
      delPattern: () => Promise.resolve(),
      isRevoked: () => Promise.resolve(false),
      revokeUser: () => Promise.resolve(),
    };

    adapter = new JwtTokenAdapter(jwtService, configService, mockCache);
  });

  it('should generate and verify access token', async () => {
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      orgId: 'org-456',
      role: 'ADMIN',
    };

    const tokens = await adapter.generateTokenPair(payload);
    expect(tokens.accessToken).toBeDefined();

    const verified = await adapter.verifyAccessToken(tokens.accessToken);
    expect(verified.sub).toBe('user-123');
    expect(verified.email).toBe('test@example.com');
  });
});
