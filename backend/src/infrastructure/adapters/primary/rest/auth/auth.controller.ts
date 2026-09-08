import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../../../../core/application/auth/register-user.use-case.js';
import { LoginUserUseCase } from '../../../../../core/application/auth/login-user.use-case.js';
import { RefreshTokenUseCase } from '../../../../../core/application/auth/refresh-token.use-case.js';
import { ChangePasswordUseCase } from '../../../../../core/application/auth/change-password.use-case.js';
import { RequestPasswordResetUseCase } from '../../../../../core/application/auth/request-password-reset.use-case.js';
import { ResetPasswordUseCase } from '../../../../../core/application/auth/reset-password.use-case.js';
import { GetProfileUseCase } from '../../../../../core/application/auth/get-profile.use-case.js';
import { UpdateProfileUseCase } from '../../../../../core/application/auth/update-profile.use-case.js';
import { TOKEN_PORT, type ITokenPort, type AccessTokenPayload } from '../../../../../core/application/common/ports/token.port.js';
import {
  RegisterRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  ChangePasswordDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  UpdateProfileDto,
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
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
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
        avatarUrl: user.avatarUrl ?? null,
        phone: user.phone ?? null,
        jobTitle: user.jobTitle ?? null,
        bio: user.bio ?? null,
        language: user.language ?? 'pt',
        timezone: user.timezone ?? 'America/Sao_Paulo',
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
        avatarUrl: user.avatarUrl ?? null,
        phone: user.phone ?? null,
        jobTitle: user.jobTitle ?? null,
        bio: user.bio ?? null,
        language: user.language ?? 'pt',
        timezone: user.timezone ?? 'America/Sao_Paulo',
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
  async getCurrentUser(@CurrentUser() user: AccessTokenPayload) {
    const result = await this.getProfileUseCase.execute(user.sub);
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile data for currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failure or email collision' })
  async updateProfile(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    const result = await this.updateProfileUseCase.execute({
      userId: user.sub,
      ...dto,
    });
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password for currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password or validation failure' })
  async changePassword(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    const result = await this.changePasswordUseCase.execute({
      userId: user.sub,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email initiated' })
  async forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
    const result = await this.requestPasswordResetUseCase.execute(dto);
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token received via email' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid/expired token or validation failure' })
  async resetPassword(@Body() dto: ResetPasswordRequestDto) {
    const result = await this.resetPasswordUseCase.execute(dto);
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }
}
