import { Result } from '../../../domain/common/result.js';

export interface EmailAttachment {
  filename: string;
  content: Buffer | string; // Buffer or Base64 string
  contentType?: string;
  size?: number;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  orgId?: string;
}

export const EMAIL_PORT = Symbol('EMAIL_PORT');

export interface IEmailPort {
  sendEmail(options: SendEmailOptions): Promise<Result<void>>;
}
