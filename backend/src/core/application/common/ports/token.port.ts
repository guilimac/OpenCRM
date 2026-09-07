export const TOKEN_PORT = Symbol('TOKEN_PORT');

export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
  orgId: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ITokenPort {
  generateTokenPair(payload: AccessTokenPayload): Promise<TokenPair>;
  verifyAccessToken(token: string): Promise<AccessTokenPayload>;
  rotateRefreshToken(refreshToken: string): Promise<TokenPair>;
  revokeTokenFamily(refreshToken: string): Promise<void>;
}
