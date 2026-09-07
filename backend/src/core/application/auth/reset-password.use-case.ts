import { Inject, Injectable, Logger } from '@nestjs/common';
import { USER_REPOSITORY_PORT, type IUserRepository } from '../../domain/user/user.repository.port.js';
import { CACHE_PORT, type ICachePort } from '../common/ports/cache.port.js';
import { EMAIL_PORT, type IEmailPort } from '../common/ports/email.port.js';
import { Result } from '../../domain/common/result.js';
import * as bcrypt from 'bcryptjs';

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: IUserRepository,
    @Inject(CACHE_PORT)
    private readonly cachePort: ICachePort,
    @Inject(EMAIL_PORT)
    private readonly emailPort: IEmailPort,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<Result<{ message: string }>> {
    if (!dto.token || dto.token.trim().length === 0) {
      return Result.fail<{ message: string }>('Token de recuperação é obrigatório');
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      return Result.fail<{ message: string }>('A nova senha deve ter pelo menos 6 caracteres');
    }

    const cacheKey = `auth:reset-token:${dto.token.trim()}`;
    const tokenData = await this.cachePort.get<{ userId: string; email: string }>(cacheKey);

    if (!tokenData || !tokenData.userId) {
      return Result.fail<{ message: string }>(
        'Token de recuperação inválido ou expirado. Por favor, solicite um novo link de recuperação.',
      );
    }

    const user = await this.userRepository.findById(tokenData.userId);
    if (!user) {
      return Result.fail<{ message: string }>('Usuário não encontrado');
    }

    // Securely hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(dto.newPassword, salt);

    user.changePassword(newPasswordHash);
    await this.userRepository.update(user);

    // Invalidate the reset token immediately (single-use)
    await this.cachePort.del(cacheKey);

    // Revoke any existing active JWT session family
    await this.cachePort.revokeUser(user.id, 900);

    // Send confirmation security notification via email
    this.emailPort
      .sendEmail({
        to: user.email,
        subject: 'Sua senha do OpenCRM foi redefinida',
        text: `Olá, ${user.firstName}!\n\nA senha da sua conta no OpenCRM foi alterada com sucesso.\nSe você realizou esta alteração, ignore este e-mail.\nCaso não tenha sido você, entre em contato imediatamente com o suporte.`,
      })
      .catch((err) => {
        this.logger.warn(`Could not send password reset confirmation email: ${err}`);
      });

    return Result.ok<{ message: string }>({ message: 'Senha redefinida com sucesso!' });
  }
}
