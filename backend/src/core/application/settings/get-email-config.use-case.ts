import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_CONFIG_REPOSITORY_PORT, type IEmailConfigRepository } from '../../domain/settings/email-config.repository.port.js';
import { Result } from '../../domain/common/result.js';
import { type EmailProviderType } from '../../domain/settings/entities/email-config.entity.js';

export interface EmailConfigDto {
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
  isActive: boolean;
  hasMailgunApiKey: boolean;
  hasSmtpPassword: boolean;
}

@Injectable()
export class GetEmailConfigUseCase {
  constructor(
    @Inject(EMAIL_CONFIG_REPOSITORY_PORT)
    private readonly repo: IEmailConfigRepository,
  ) {}

  async execute(orgId: string): Promise<Result<EmailConfigDto>> {
    const config = await this.repo.findByOrgId(orgId);
    if (!config) {
      return Result.ok<EmailConfigDto>({
        orgId,
        provider: 'MAILGUN',
        mailgunApiKey: '',
        mailgunDomain: '',
        mailgunHost: 'api.mailgun.net',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        smtpSecure: false,
        fromEmail: 'no-reply@opencrm.com',
        fromName: 'OpenCRM',
        replyTo: '',
        isActive: false,
        hasMailgunApiKey: false,
        hasSmtpPassword: false,
      });
    }

    return Result.ok<EmailConfigDto>({
      orgId: config.orgId,
      provider: config.provider,
      mailgunApiKey: config.mailgunApiKey ? '********' : '',
      mailgunDomain: config.mailgunDomain ?? '',
      mailgunHost: config.mailgunHost,
      smtpHost: config.smtpHost ?? '',
      smtpPort: config.smtpPort,
      smtpUser: config.smtpUser ?? '',
      smtpPassword: config.smtpPassword ? '********' : '',
      smtpSecure: config.smtpSecure,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
      replyTo: config.replyTo ?? '',
      isActive: config.isActive,
      hasMailgunApiKey: !!config.mailgunApiKey,
      hasSmtpPassword: !!config.smtpPassword,
    });
  }
}
