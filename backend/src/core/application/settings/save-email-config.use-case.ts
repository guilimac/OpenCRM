import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_CONFIG_REPOSITORY_PORT, type IEmailConfigRepository } from '../../domain/settings/email-config.repository.port.js';
import { EmailConfig, type EmailProviderType } from '../../domain/settings/entities/email-config.entity.js';
import { Result } from '../../domain/common/result.js';
import { type EmailConfigDto, GetEmailConfigUseCase } from './get-email-config.use-case.js';

export interface SaveEmailConfigInput {
  orgId: string;
  provider: EmailProviderType;
  mailgunApiKey?: string | null;
  mailgunDomain?: string | null;
  mailgunHost?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPassword?: string | null;
  smtpSecure?: boolean;
  fromEmail: string;
  fromName: string;
  replyTo?: string | null;
  isActive?: boolean;
}

@Injectable()
export class SaveEmailConfigUseCase {
  constructor(
    @Inject(EMAIL_CONFIG_REPOSITORY_PORT)
    private readonly repo: IEmailConfigRepository,
    private readonly getEmailConfigUseCase: GetEmailConfigUseCase,
  ) {}

  async execute(input: SaveEmailConfigInput): Promise<Result<EmailConfigDto>> {
    let config = await this.repo.findByOrgId(input.orgId);

    if (!config) {
      const created = EmailConfig.create(
        {
          orgId: input.orgId,
          provider: input.provider,
          mailgunApiKey: input.mailgunApiKey && input.mailgunApiKey !== '********' ? input.mailgunApiKey.trim() : null,
          mailgunDomain: input.mailgunDomain ? input.mailgunDomain.trim() : null,
          mailgunHost: input.mailgunHost ? input.mailgunHost.trim() : 'api.mailgun.net',
          smtpHost: input.smtpHost ? input.smtpHost.trim() : null,
          smtpPort: input.smtpPort || 587,
          smtpUser: input.smtpUser ? input.smtpUser.trim() : null,
          smtpPassword: input.smtpPassword && input.smtpPassword !== '********' ? input.smtpPassword.trim() : null,
          smtpSecure: !!input.smtpSecure,
          fromEmail: input.fromEmail.trim(),
          fromName: input.fromName.trim(),
          replyTo: input.replyTo ? input.replyTo.trim() : null,
          isActive: input.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        input.orgId,
      );

      if (created.isFailure) {
        return Result.fail<EmailConfigDto>(created.error!);
      }
      config = created.getValue();
    } else {
      const updateResult = config.update({
        provider: input.provider,
        mailgunApiKey: input.mailgunApiKey && input.mailgunApiKey !== '********' ? input.mailgunApiKey.trim() : undefined,
        mailgunDomain: input.mailgunDomain !== undefined ? input.mailgunDomain : undefined,
        mailgunHost: input.mailgunHost !== undefined ? input.mailgunHost : undefined,
        smtpHost: input.smtpHost !== undefined ? input.smtpHost : undefined,
        smtpPort: input.smtpPort !== undefined ? input.smtpPort : undefined,
        smtpUser: input.smtpUser !== undefined ? input.smtpUser : undefined,
        smtpPassword: input.smtpPassword && input.smtpPassword !== '********' ? input.smtpPassword.trim() : undefined,
        smtpSecure: input.smtpSecure !== undefined ? input.smtpSecure : undefined,
        fromEmail: input.fromEmail,
        fromName: input.fromName,
        replyTo: input.replyTo,
        isActive: input.isActive,
      });

      if (updateResult.isFailure) {
        return Result.fail<EmailConfigDto>(updateResult.error!);
      }
    }

    await this.repo.save(config);
    return this.getEmailConfigUseCase.execute(input.orgId);
  }
}
