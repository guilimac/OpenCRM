export type EmailProviderType = 'MAILGUN' | 'SMTP';

export interface EmailConfigResponse {
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
  updatedAt?: string | null;
}

export interface SaveEmailConfigRequest {
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

export interface SendTestEmailRequest {
  targetEmail: string;
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
}

export interface SendTestEmailResponse {
  success: boolean;
  message: string;
}
