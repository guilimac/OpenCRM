import { Result } from '../../../domain/common/result.js';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

export const EMAIL_PORT = Symbol('EMAIL_PORT');

export interface IEmailPort {
  sendEmail(options: SendEmailOptions): Promise<Result<void>>;
}
