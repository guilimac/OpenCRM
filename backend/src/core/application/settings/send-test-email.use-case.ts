import { Inject, Injectable, Logger } from '@nestjs/common';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import nodemailer from 'nodemailer';
import { EMAIL_CONFIG_REPOSITORY_PORT, type IEmailConfigRepository } from '../../domain/settings/email-config.repository.port.js';
import { Result } from '../../domain/common/result.js';
import { type EmailProviderType } from '../../domain/settings/entities/email-config.entity.js';

export interface SendTestEmailInput {
  orgId: string;
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

@Injectable()
export class SendTestEmailUseCase {
  private readonly logger = new Logger(SendTestEmailUseCase.name);

  constructor(
    @Inject(EMAIL_CONFIG_REPOSITORY_PORT)
    private readonly repo: IEmailConfigRepository,
  ) {}

  async execute(input: SendTestEmailInput): Promise<Result<{ message: string; details?: string }>> {
    if (!input.targetEmail || !input.targetEmail.includes('@')) {
      return Result.fail('Invalid target email address');
    }

    const savedConfig = await this.repo.findByOrgId(input.orgId);

    const provider = input.provider || savedConfig?.provider || 'MAILGUN';
    const fromEmail = input.fromEmail || savedConfig?.fromEmail || 'no-reply@opencrm.com';
    const fromName = input.fromName || savedConfig?.fromName || 'OpenCRM';
    const fromHeader = `${fromName} <${fromEmail}>`;

    const subject = '✔ [OpenCRM] E-mail de Teste de Configuração';
    const textBody = `Olá! Este é um e-mail de teste enviado com sucesso pelo OpenCRM através do provedor ${provider}.`;
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">OpenCRM</h2>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
          <h3 style="color: #166534; margin: 0 0 4px; font-size: 16px;">Conexão bem-sucedida!</h3>
          <p style="color: #15803d; margin: 0; font-size: 14px;">
            Este e-mail confirma que suas credenciais do provedor <strong>${provider}</strong> estão funcionando perfeitamente.
          </p>
        </div>
        <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: 600;">Provedor:</td>
            <td style="padding: 6px 0;">${provider}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600;">Remetente:</td>
            <td style="padding: 6px 0;">${fromHeader}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600;">Destinatário:</td>
            <td style="padding: 6px 0;">${input.targetEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600;">Data/Hora:</td>
            <td style="padding: 6px 0;">${new Date().toLocaleString('pt-BR')}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          Enviado automaticamente pelo OpenCRM Management Portal.
        </p>
      </div>
    `;

    if (provider === 'MAILGUN') {
      const apiKey = input.mailgunApiKey && input.mailgunApiKey !== '********'
        ? input.mailgunApiKey
        : savedConfig?.mailgunApiKey;
      const domain = input.mailgunDomain || savedConfig?.mailgunDomain;
      const host = input.mailgunHost || savedConfig?.mailgunHost || 'api.mailgun.net';

      if (!apiKey || !domain) {
        return Result.fail('Mailgun API Key and Domain must be provided to send email');
      }

      try {
        const mailgun = new Mailgun(FormData);
        const client = mailgun.client({
          username: 'api',
          key: apiKey,
          url: host.startsWith('http') ? host : `https://${host}`,
        });

        await (client.messages.create as any)(domain, {
          from: fromHeader,
          to: [input.targetEmail],
          subject,
          text: textBody,
          html: htmlBody,
        });

        return Result.ok({
          message: `E-mail de teste enviado com sucesso via Mailgun para ${input.targetEmail}!`,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Mailgun test email failed: ${msg}`);
        return Result.fail(`Falha no envio via Mailgun: ${msg}`);
      }
    } else if (provider === 'SMTP') {
      const host = input.smtpHost || savedConfig?.smtpHost;
      const port = input.smtpPort || savedConfig?.smtpPort || 587;
      const user = input.smtpUser || savedConfig?.smtpUser;
      const pass = input.smtpPassword && input.smtpPassword !== '********'
        ? input.smtpPassword
        : savedConfig?.smtpPassword;
      const secure = input.smtpSecure !== undefined ? input.smtpSecure : (savedConfig?.smtpSecure || port === 465);

      if (!host) {
        return Result.fail('SMTP Host is required');
      }

      try {
        const transporter = nodemailer.createTransport({
          host,
          port: Number(port),
          secure: !!secure,
          auth: user && pass ? { user, pass } : undefined,
          connectionTimeout: 10000,
          greetingTimeout: 10000,
        });

        // Verify connection first
        await transporter.verify();

        // Dispatch email
        await transporter.sendMail({
          from: fromHeader,
          to: input.targetEmail,
          subject,
          text: textBody,
          html: htmlBody,
        });

        return Result.ok({
          message: `E-mail de teste enviado com sucesso via Servidor SMTP (${host}:${port}) para ${input.targetEmail}!`,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`SMTP test email failed: ${msg}`);
        return Result.fail(`Falha na conexão/envio SMTP (${host}:${port}): ${msg}`);
      }
    }

    return Result.fail(`Unknown provider: ${provider}`);
  }
}
