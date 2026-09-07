import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TOKEN_PORT } from '../../core/application/common/ports/token.port.js';
import { JwtTokenAdapter } from '../adapters/secondary/auth/jwt-token.adapter.js';
import { RegisterUserUseCase } from '../../core/application/auth/register-user.use-case.js';
import { LoginUserUseCase } from '../../core/application/auth/login-user.use-case.js';
import { RefreshTokenUseCase } from '../../core/application/auth/refresh-token.use-case.js';
import { ChangePasswordUseCase } from '../../core/application/auth/change-password.use-case.js';
import { RequestPasswordResetUseCase } from '../../core/application/auth/request-password-reset.use-case.js';
import { ResetPasswordUseCase } from '../../core/application/auth/reset-password.use-case.js';
import { AuthController } from '../adapters/primary/rest/auth/auth.controller.js';
import { JwtAuthGuard } from '../adapters/primary/rest/guards/jwt-auth.guard.js';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'supersecret_jwt_key_crm_development_replace_in_prod_12345'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: TOKEN_PORT,
      useClass: JwtTokenAdapter,
    },
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    JwtAuthGuard,
  ],
  exports: [
    TOKEN_PORT,
    JwtAuthGuard,
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
  ],
})
export class AuthModule {}
