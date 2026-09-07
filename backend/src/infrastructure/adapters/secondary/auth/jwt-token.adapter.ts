import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  type ITokenPort,
  type AccessTokenPayload,
  type TokenPair,
} from '../../../../core/application/common/ports/token.port.js';
import { CACHE_PORT, type ICachePort } from '../../../../core/application/common/ports/cache.port.js';
import { v4 as uuidv4 } from 'uuid';

interface RefreshTokenRecord {
  tokenId: string;
  familyId: string;
  userId: string;
  orgId: string;
  role: string;
  email: string;
}

@Injectable()
export class JwtTokenAdapter implements ITokenPort {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly accessExpiresInSeconds = 900; // 15 minutes
  private readonly refreshExpiresInSeconds = 604800; // 7 days

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_PORT)
    private readonly cachePort: ICachePort,
  ) {
    this.jwtSecret = this.configService.get<string>(
      'JWT_SECRET',
      'supersecret_jwt_key_crm_development_replace_in_prod_12345',
    );
    this.jwtRefreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'supersecret_refresh_jwt_key_crm_development_replace_in_prod_54321',
    );
  }

  async generateTokenPair(payload: AccessTokenPayload): Promise<TokenPair> {
    const familyId = uuidv4();
    const tokenId = uuidv4();

    const accessToken = await this.jwtService.signAsync(
      {
        sub: payload.sub,
        email: payload.email,
        orgId: payload.orgId,
        role: payload.role,
      },
      {
        secret: this.jwtSecret,
        expiresIn: this.accessExpiresInSeconds,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: payload.sub,
        tokenId,
        familyId,
      },
      {
        secret: this.jwtRefreshSecret,
        expiresIn: this.refreshExpiresInSeconds,
      },
    );

    // Store active token in Redis/cache
    const record: RefreshTokenRecord = {
      tokenId,
      familyId,
      userId: payload.sub,
      orgId: payload.orgId,
      role: payload.role,
      email: payload.email,
    };

    await this.cachePort.set(
      `auth:refresh:${tokenId}`,
      record,
      this.refreshExpiresInSeconds,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiresInSeconds,
    };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const decoded = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.jwtSecret,
      });

      // Check if user session was invalidated
      const isRevoked = await this.cachePort.isRevoked(decoded.sub);
      if (isRevoked) {
        throw new UnauthorizedException('Session has been revoked');
      }

      return decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  async rotateRefreshToken(refreshToken: string): Promise<TokenPair> {
    let decoded: { sub: string; tokenId: string; familyId: string };
    try {
      decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const cacheKey = `auth:refresh:${decoded.tokenId}`;
    const existing = await this.cachePort.get<RefreshTokenRecord>(cacheKey);

    if (!existing) {
      // Possible Token Reuse / Theft! Revoke all tokens for this family!
      await this.cachePort.delPattern(`auth:refresh:*`);
      await this.cachePort.revokeUser(decoded.sub, this.accessExpiresInSeconds);
      throw new UnauthorizedException('Security alert: Token reuse detected. Re-authentication required.');
    }

    // Invalidate consumed refresh token
    await this.cachePort.del(cacheKey);

    // Issue child refresh token in same family
    const nextTokenId = uuidv4();
    const nextRefreshToken = await this.jwtService.signAsync(
      {
        sub: existing.userId,
        tokenId: nextTokenId,
        familyId: existing.familyId,
      },
      {
        secret: this.jwtRefreshSecret,
        expiresIn: this.refreshExpiresInSeconds,
      },
    );

    const nextAccessToken = await this.jwtService.signAsync(
      {
        sub: existing.userId,
        email: existing.email,
        orgId: existing.orgId,
        role: existing.role,
      },
      {
        secret: this.jwtSecret,
        expiresIn: this.accessExpiresInSeconds,
      },
    );

    const nextRecord: RefreshTokenRecord = {
      tokenId: nextTokenId,
      familyId: existing.familyId,
      userId: existing.userId,
      orgId: existing.orgId,
      role: existing.role,
      email: existing.email,
    };

    await this.cachePort.set(
      `auth:refresh:${nextTokenId}`,
      nextRecord,
      this.refreshExpiresInSeconds,
    );

    return {
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      expiresIn: this.accessExpiresInSeconds,
    };
  }

  async revokeTokenFamily(refreshToken: string): Promise<void> {
    try {
      const decoded = await this.jwtService.verifyAsync<{ sub: string; tokenId: string }>(
        refreshToken,
        { secret: this.jwtRefreshSecret },
      );
      await this.cachePort.del(`auth:refresh:${decoded.tokenId}`);
      await this.cachePort.revokeUser(decoded.sub, this.accessExpiresInSeconds);
    } catch {
      // Ignore token verification errors during revocation
    }
  }
}
