import { EmailConfig, type EmailProviderType } from '../../../../../../core/domain/settings/entities/email-config.entity.js';
import { EmailConfigOrmEntity } from '../entities/email-config.orm-entity.js';

export class EmailConfigMapper {
  static toDomain(orm: EmailConfigOrmEntity): EmailConfig {
    const result = EmailConfig.create(
      {
        orgId: orm.orgId,
        provider: orm.provider as EmailProviderType,
        mailgunApiKey: orm.mailgunApiKey,
        mailgunDomain: orm.mailgunDomain,
        mailgunHost: orm.mailgunHost,
        smtpHost: orm.smtpHost,
        smtpPort: orm.smtpPort,
        smtpUser: orm.smtpUser,
        smtpPassword: orm.smtpPassword,
        smtpSecure: orm.smtpSecure,
        fromEmail: orm.fromEmail,
        fromName: orm.fromName,
        replyTo: orm.replyTo,
        isActive: orm.isActive,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
      },
      orm.orgId,
    );

    return result.getValue();
  }

  static toOrm(domain: EmailConfig): EmailConfigOrmEntity {
    const orm = new EmailConfigOrmEntity();
    orm.orgId = domain.orgId;
    orm.provider = domain.provider;
    orm.mailgunApiKey = domain.mailgunApiKey ?? null;
    orm.mailgunDomain = domain.mailgunDomain ?? null;
    orm.mailgunHost = domain.mailgunHost ?? 'api.mailgun.net';
    orm.smtpHost = domain.smtpHost ?? null;
    orm.smtpPort = domain.smtpPort ?? 587;
    orm.smtpUser = domain.smtpUser ?? null;
    orm.smtpPassword = domain.smtpPassword ?? null;
    orm.smtpSecure = domain.smtpSecure;
    orm.fromEmail = domain.fromEmail;
    orm.fromName = domain.fromName;
    orm.replyTo = domain.replyTo ?? null;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
