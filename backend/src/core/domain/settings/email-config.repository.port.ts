import { EmailConfig } from './entities/email-config.entity.js';

export const EMAIL_CONFIG_REPOSITORY_PORT = Symbol('EMAIL_CONFIG_REPOSITORY_PORT');

export interface IEmailConfigRepository {
  findByOrgId(orgId: string): Promise<EmailConfig | null>;
  save(config: EmailConfig): Promise<void>;
}
