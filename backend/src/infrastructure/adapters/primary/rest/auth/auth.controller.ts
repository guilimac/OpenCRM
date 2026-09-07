import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../../../../core/application/auth/register-user.use-case.js';
import { LoginUserUseCase } from '../../../../../core/application/auth/login-user.use-case.js';
import { RefreshTokenUseCase } from '../../../../../core/application/auth/refresh-token.use-case.js';
import { TOKEN_PORT, type ITokenPort, type AccessTokenPayload } from '../../../../../core/application/common/ports/token.port.js';
import {
  RegisterRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
} from './dto/auth.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(TOKEN_PORT)
    private readonly tokenPort: ITokenPort,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User successfully created and token pair issued' })
  async register(@Body() dto: RegisterRequestDto) {
    const result = await this.registerUserUseCase.execute(dto);
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    const { user, tokens } = result.getValue();
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.value,
        orgId: user.orgId,
      },
      tokens,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and issue token pair' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  async login(@Body() dto: LoginRequestDto) {
    const result = await this.loginUserUseCase.execute(dto);
    if (result.isFailure) {
      throw new UnauthorizedException(result.error);
    }
    const { user, tokens } = result.getValue();
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.value,
        orgId: user.orgId,
      },
      tokens,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new token pair' })
  @ApiResponse({ status: 200, description: 'Tokens rotated successfully' })
  async refresh(@Body() dto: RefreshTokenRequestDto) {
    const result = await this.refreshTokenUseCase.execute(dto.refreshToken);
    if (result.isFailure) {
      throw new UnauthorizedException(result.error);
    }
    return result.getValue();
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke active refresh token family' })
  async logout(@Body() dto: RefreshTokenRequestDto) {
    await this.tokenPort.revokeTokenFamily(dto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  getCurrentUser(@CurrentUser() user: AccessTokenPayload) {
    return user;
  }
}
