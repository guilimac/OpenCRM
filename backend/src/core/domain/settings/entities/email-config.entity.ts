import { AggregateRoot } from '../../common/aggregate-root.base.js';
import { Result } from '../../common/result.js';

export type EmailProviderType = 'MAILGUN' | 'SMTP';

export interface EmailConfigProps {
  orgId: string;
  provider: EmailProviderType;
  // Mailgun
  mailgunApiKey?: string | null;
  mailgunDomain?: string | null;
  mailgunHost?: string | null;
  // SMTP
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPassword?: string | null;
  smtpSecure?: boolean;
  // Sender info
  fromEmail: string;
  fromName: string;
  replyTo?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class EmailConfig extends AggregateRoot<EmailConfigProps> {
  get orgId(): string {
    return this.props.orgId;
  }

  get provider(): EmailProviderType {
    return this.props.provider;
  }

  get mailgunApiKey(): string | null | undefined {
    return this.props.mailgunApiKey;
  }

  get mailgunDomain(): string | null | undefined {
    return this.props.mailgunDomain;
  }

  get mailgunHost(): string {
    return this.props.mailgunHost || 'api.mailgun.net';
  }

  get smtpHost(): string | null | undefined {
    return this.props.smtpHost;
  }

  get smtpPort(): number {
    return this.props.smtpPort || 587;
  }

  get smtpUser(): string | null | undefined {
    return this.props.smtpUser;
  }

  get smtpPassword(): string | null | undefined {
    return this.props.smtpPassword;
  }

  get smtpSecure(): boolean {
    return !!this.props.smtpSecure;
  }

  get fromEmail(): string {
    return this.props.fromEmail;
  }

  get fromName(): string {
    return this.props.fromName;
  }

  get replyTo(): string | null | undefined {
    return this.props.replyTo;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(props: {
    provider?: EmailProviderType;
    mailgunApiKey?: string | null;
    mailgunDomain?: string | null;
    mailgunHost?: string | null;
    smtpHost?: string | null;
    smtpPort?: number | null;
    smtpUser?: string | null;
    smtpPassword?: string | null;
    smtpSecure?: boolean;
    fromEmail?: string;
    fromName?: string;
    replyTo?: string | null;
    isActive?: boolean;
  }): Result<void> {
    if (props.provider !== undefined) {
      this.props.provider = props.provider;
    }
    if (props.mailgunApiKey !== undefined && props.mailgunApiKey !== '********') {
      this.props.mailgunApiKey = props.mailgunApiKey;
    }
    if (props.mailgunDomain !== undefined) {
      this.props.mailgunDomain = props.mailgunDomain ? props.mailgunDomain.trim() : null;
    }
    if (props.mailgunHost !== undefined) {
      this.props.mailgunHost = props.mailgunHost ? props.mailgunHost.trim() : 'api.mailgun.net';
    }
    if (props.smtpHost !== undefined) {
      this.props.smtpHost = props.smtpHost ? props.smtpHost.trim() : null;
    }
    if (props.smtpPort !== undefined) {
      this.props.smtpPort = props.smtpPort;
    }
    if (props.smtpUser !== undefined) {
      this.props.smtpUser = props.smtpUser ? props.smtpUser.trim() : null;
    }
    if (props.smtpPassword !== undefined && props.smtpPassword !== '********') {
      this.props.smtpPassword = props.smtpPassword;
    }
    if (props.smtpSecure !== undefined) {
      this.props.smtpSecure = props.smtpSecure;
    }
    if (props.fromEmail !== undefined) {
      if (!props.fromEmail || !props.fromEmail.includes('@')) {
        return Result.fail('Invalid from email address');
      }
      this.props.fromEmail = props.fromEmail.trim();
    }
    if (props.fromName !== undefined) {
      if (!props.fromName || props.fromName.trim().length === 0) {
        return Result.fail('From name cannot be empty');
      }
      this.props.fromName = props.fromName.trim();
    }
    if (props.replyTo !== undefined) {
      this.props.replyTo = props.replyTo ? props.replyTo.trim() : null;
    }
    if (props.isActive !== undefined) {
      this.props.isActive = props.isActive;
    }
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public static create(props: EmailConfigProps, id: string): Result<EmailConfig> {
    if (!props.fromEmail || !props.fromEmail.includes('@')) {
      return Result.fail<EmailConfig>('Invalid sender email address');
    }
    if (!props.fromName || props.fromName.trim().length === 0) {
      return Result.fail<EmailConfig>('Sender name is required');
    }
    return Result.ok<EmailConfig>(new EmailConfig(props, id));
  }
}
