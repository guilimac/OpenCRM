import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { IEmailPort, SendEmailOptions } from '../../../../core/application/common/ports/email.port.js';
import { Result } from '../../../../core/domain/common/result.js';

@Injectable()
export class MailgunEmailAdapter implements IEmailPort {
  private readonly logger = new Logger(MailgunEmailAdapter.name);
  private client: ReturnType<Mailgun['client']> | null = null;
  private readonly domain: string | null = null;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('MAILGUN_API_KEY');
    this.domain = this.configService.get<string>('MAILGUN_DOMAIN') || null;
    const host = this.configService.get<string>('MAILGUN_HOST', 'api.mailgun.net');
    this.defaultFrom = this.configService.get<string>(
      'MAILGUN_FROM_EMAIL',
      'OpenCRM <no-reply@opencrm.com>',
    );

    if (apiKey && this.domain) {
      try {
        const mailgun = new Mailgun(FormData);
        this.client = mailgun.client({
          username: 'api',
          key: apiKey,
          url: host.startsWith('http') ? host : `https://${host}`,
        });
        this.logger.log(`Mailgun client initialized for domain: ${this.domain} (host: ${host})`);
      } catch (err) {
        this.logger.warn(`Failed to initialize Mailgun client: ${err}. Operating in simulation fallback.`);
      }
    } else {
      this.logger.warn(
        'MAILGUN_API_KEY or MAILGUN_DOMAIN not configured. Email service will run in simulation mode (logging only).',
      );
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<Result<void>> {
    const from = options.from || this.defaultFrom;
    const toList = Array.isArray(options.to) ? options.to : [options.to];

    // Fallback simulation mode if Mailgun is not configured
    if (!this.client || !this.domain) {
      this.logger.log(
        `📬 [SIMULATION EMAIL]
To: ${toList.join(', ')}
From: ${from}
Subject: ${options.subject}
Body (Text):
${options.text || '(HTML only)'}`,
      );
      return Result.ok<void>();
    }

    try {
      await this.client.messages.create(this.domain, {
        from,
        to: toList,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`Email successfully dispatched via Mailgun to ${toList.join(', ')}`);
      return Result.ok<void>();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send email via Mailgun: ${message}`);
      return Result.fail<void>(`Email delivery failed: ${message}`);
    }
  }
}
