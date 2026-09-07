import { Inject, Injectable } from '@nestjs/common';
import { TOKEN_PORT, type ITokenPort, type TokenPair } from '../common/ports/token.port.js';
import { Result } from '../../domain/common/result.js';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(TOKEN_PORT)
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(refreshToken: string): Promise<Result<TokenPair>> {
    try {
      const tokens = await this.tokenPort.rotateRefreshToken(refreshToken);
      return Result.ok<TokenPair>(tokens);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or expired refresh token';
      return Result.fail<TokenPair>(message);
    }
  }
}
