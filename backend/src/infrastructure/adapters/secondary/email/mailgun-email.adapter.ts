import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import nodemailer from 'nodemailer';
import { IEmailPort, SendEmailOptions } from '../../../../core/application/common/ports/email.port.js';
import { Result } from '../../../../core/domain/common/result.js';
import {
  EMAIL_CONFIG_REPOSITORY_PORT,
  type IEmailConfigRepository,
} from '../../../../core/domain/settings/email-config.repository.port.js';
import { EmailConfig } from '../../../../core/domain/settings/entities/email-config.entity.js';

@Injectable()
export class MailgunEmailAdapter implements IEmailPort {
  private readonly logger = new Logger(MailgunEmailAdapter.name);
  private defaultClient: ReturnType<Mailgun['client']> | null = null;
  private readonly defaultDomain: string | null = null;
  private readonly defaultFrom: string;

  constructor(
    private readonly configService: ConfigService,
    @Optional()
    @Inject(EMAIL_CONFIG_REPOSITORY_PORT)
    private readonly emailConfigRepo?: IEmailConfigRepository,
  ) {
    const apiKey = this.configService.get<string>('MAILGUN_API_KEY');
    this.defaultDomain = this.configService.get<string>('MAILGUN_DOMAIN') || null;
    const host = this.configService.get<string>('MAILGUN_HOST', 'api.mailgun.net');
    this.defaultFrom = this.configService.get<string>(
      'MAILGUN_FROM_EMAIL',
      'OpenCRM <no-reply@opencrm.com>',
    );

    if (apiKey && this.defaultDomain) {
      try {
        const mailgun = new Mailgun(FormData);
        this.defaultClient = mailgun.client({
          username: 'api',
          key: apiKey,
          url: host.startsWith('http') ? host : `https://${host}`,
        });
        this.logger.log(`Default Mailgun client initialized for domain: ${this.defaultDomain}`);
      } catch (err) {
        this.logger.warn(`Failed to initialize default Mailgun client: ${err}. Operating in simulation fallback.`);
      }
    } else {
      this.logger.warn(
        'MAILGUN_API_KEY or MAILGUN_DOMAIN not configured. System emails will run in simulation mode (logging only).',
      );
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<Result<void>> {
    // 1. Check if organization has active custom email configuration
    if (options.orgId && this.emailConfigRepo) {
      try {
        const orgConfig = await this.emailConfigRepo.findByOrgId(options.orgId);
        if (orgConfig && orgConfig.isActive) {
          if (orgConfig.provider === 'SMTP') {
            return await this.sendViaSmtp(orgConfig, options);
          } else if (orgConfig.provider === 'MAILGUN' && orgConfig.mailgunApiKey && orgConfig.mailgunDomain) {
            return await this.sendViaOrgMailgun(orgConfig, options);
          }
        }
      } catch (err) {
        this.logger.error(`Error loading org email config: ${err}. Falling back to default provider.`);
      }
    }

    // 2. Default System Mailgun / Simulation Fallback
    const from = options.from || this.defaultFrom;
    const toList = Array.isArray(options.to) ? options.to : [options.to];

    if (!this.defaultClient || !this.defaultDomain) {
      const attachmentInfo = options.attachments?.length
        ? `\nAttachments (${options.attachments.length}): ${options.attachments.map((a) => `${a.filename}${a.size ? ` (${Math.round(a.size / 1024)}KB)` : ''}`).join(', ')}`
        : '';

      this.logger.log(
        `📬 [SIMULATION EMAIL]
To: ${toList.join(', ')}
From: ${from}
Subject: ${options.subject}${attachmentInfo}
Body (Text):
${options.text || '(HTML only)'}`,
      );
      return Result.ok<void>();
    }

    try {
      const messageData: Record<string, unknown> = {
        from,
        to: toList,
        subject: options.subject,
      };
      if (options.text) messageData['text'] = options.text;
      if (options.html) messageData['html'] = options.html;
      if (!options.text && !options.html) {
        messageData['text'] = options.subject;
      }

      if (options.attachments && options.attachments.length > 0) {
        messageData['attachment'] = options.attachments.map((att) => {
          const dataBuffer = Buffer.isBuffer(att.content)
            ? att.content
            : Buffer.from(
                att.content.includes(';base64,')
                  ? att.content.split(';base64,')[1]
                  : att.content,
                'base64',
              );
          return {
            data: dataBuffer,
            filename: att.filename,
            contentType: att.contentType,
          };
        });
      }

      await (this.defaultClient.messages.create as any)(this.defaultDomain, messageData);
      this.logger.log(`Email successfully dispatched via system Mailgun to ${toList.join(', ')}`);
      return Result.ok<void>();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send email via system Mailgun: ${message}`);
      return Result.fail<void>(`Email delivery failed: ${message}`);
    }
  }

  private async sendViaSmtp(config: EmailConfig, options: SendEmailOptions): Promise<Result<void>> {
    const from = options.from || `${config.fromName} <${config.fromEmail}>`;
    const toList = Array.isArray(options.to) ? options.to : [options.to];

    try {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost || 'localhost',
        port: config.smtpPort || 587,
        secure: config.smtpSecure,
        auth: config.smtpUser && config.smtpPassword ? {
          user: config.smtpUser,
          pass: config.smtpPassword,
        } : undefined,
      });

      const mailOptions = {
        from,
        to: toList,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo || config.replyTo || undefined,
        attachments: options.attachments?.map((att) => ({
          filename: att.filename,
          content: Buffer.isBuffer(att.content)
            ? att.content
            : Buffer.from(
                att.content.includes(';base64,')
                  ? att.content.split(';base64,')[1]
                  : att.content,
                'base64',
              ),
          contentType: att.contentType,
        })),
      };

      await transporter.sendMail(mailOptions);
      this.logger.log(`Email dispatched via org SMTP (${config.smtpHost}) to ${toList.join(', ')}`);
      return Result.ok<void>();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send email via org SMTP: ${message}`);
      return Result.fail<void>(`Email delivery failed (SMTP): ${message}`);
    }
  }

  private async sendViaOrgMailgun(config: EmailConfig, options: SendEmailOptions): Promise<Result<void>> {
    const from = options.from || `${config.fromName} <${config.fromEmail}>`;
    const toList = Array.isArray(options.to) ? options.to : [options.to];

    try {
      const mailgun = new Mailgun(FormData);
      const client = mailgun.client({
        username: 'api',
        key: config.mailgunApiKey!,
        url: config.mailgunHost.startsWith('http') ? config.mailgunHost : `https://${config.mailgunHost}`,
      });

      const messageData: Record<string, unknown> = {
        from,
        to: toList,
        subject: options.subject,
        text: options.text || options.subject,
        html: options.html,
      };

      if (options.attachments && options.attachments.length > 0) {
        messageData['attachment'] = options.attachments.map((att) => {
          const dataBuffer = Buffer.isBuffer(att.content)
            ? att.content
            : Buffer.from(
                att.content.includes(';base64,')
                  ? att.content.split(';base64,')[1]
                  : att.content,
                'base64',
              );
          return {
            data: dataBuffer,
            filename: att.filename,
            contentType: att.contentType,
          };
        });
      }

      await (client.messages.create as any)(config.mailgunDomain!, messageData);
      this.logger.log(`Email dispatched via org Mailgun (${config.mailgunDomain}) to ${toList.join(', ')}`);
      return Result.ok<void>();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send email via org Mailgun: ${message}`);
      return Result.fail<void>(`Email delivery failed (Mailgun): ${message}`);
    }
  }
}
