import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { USER_REPOSITORY_PORT, type IUserRepository } from '../../domain/user/user.repository.port.js';
import { CACHE_PORT, type ICachePort } from '../common/ports/cache.port.js';
import { EMAIL_PORT, type IEmailPort } from '../common/ports/email.port.js';
import { Result } from '../../domain/common/result.js';

export interface RequestPasswordResetDto {
  email: string;
}

@Injectable()
export class RequestPasswordResetUseCase {
  private readonly logger = new Logger(RequestPasswordResetUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: IUserRepository,
    @Inject(CACHE_PORT)
    private readonly cachePort: ICachePort,
    @Inject(EMAIL_PORT)
    private readonly emailPort: IEmailPort,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: RequestPasswordResetDto): Promise<Result<{ message: string }>> {
    const genericSuccessMessage =
      'Se o e-mail informado estiver cadastrado em nosso sistema, as instruções para redefinição de senha foram enviadas.';

    const email = dto.email?.toLowerCase().trim();
    if (!email) {
      return Result.fail<{ message: string }>('E-mail é obrigatório');
    }

    const user = await this.userRepository.findByEmailGlobal(email);
    if (!user || !user.isActive) {
      // Return success to avoid email enumeration
      return Result.ok<{ message: string }>({ message: genericSuccessMessage });
    }

    // Generate secure single-use token with 15-minute TTL (900 seconds)
    const token = randomBytes(32).toString('hex');
    const cacheKey = `auth:reset-token:${token}`;
    await this.cachePort.set(cacheKey, { userId: user.id, email: user.email }, 900);

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost');
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    const textBody = `Olá, ${user.firstName}!

Recebemos uma solicitação para redefinir a senha da sua conta no OpenCRM.
Para cadastrar uma nova senha, clique no link abaixo (ou copie e cole no seu navegador):

${resetLink}

Este link é válido por 15 minutos e só pode ser utilizado uma única vez.
Se você não solicitou a redefinição de senha, nenhuma ação é necessária. Sua senha atual continua segura.

Atenciosamente,
Equipe OpenCRM`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2563eb; margin: 0;">OpenCRM</h2>
          <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Recuperação de Senha</p>
        </div>
        <p>Olá, <strong>${user.firstName}</strong>,</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Redefinir Minha Senha</a>
        </div>
        <p style="font-size: 13px; color: #64748b;">Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:<br/><a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a></p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Este link é válido por <strong>15 minutos</strong>. Se você não solicitou esta redefinição, desconsidere esta mensagem com segurança.</p>
      </div>
    `;

    const emailResult = await this.emailPort.sendEmail({
      to: user.email,
      subject: 'Recuperação de Senha - OpenCRM',
      text: textBody,
      html: htmlBody,
    });

    if (emailResult.isFailure) {
      this.logger.warn(`Failed to dispatch password recovery email to ${user.email}: ${emailResult.error}`);
    }

    return Result.ok<{ message: string }>({ message: genericSuccessMessage });
  }
}
