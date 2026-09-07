import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TOKEN_PORT, type ITokenPort } from '../../../../../core/application/common/ports/token.port.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_PORT)
    private readonly tokenPort: ITokenPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const token = authHeader.substring(7);
    try {
      const payload = await this.tokenPort.verifyAccessToken(token);
      request.user = payload;
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid token';
      throw new UnauthorizedException(msg);
    }
  }
}
