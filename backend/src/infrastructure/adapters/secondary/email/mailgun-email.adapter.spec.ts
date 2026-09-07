import { describe, it, expect, vi } from 'vitest';
import { MailgunEmailAdapter } from './mailgun-email.adapter.js';
import { ConfigService } from '@nestjs/config';

describe('MailgunEmailAdapter', () => {
  it('should run in simulation mode and succeed when API key is not configured', async () => {
    const configService = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'MAILGUN_FROM_EMAIL') return 'OpenCRM <no-reply@opencrm.com>';
        return defaultValue || undefined;
      }),
    } as unknown as ConfigService;

    const adapter = new MailgunEmailAdapter(configService);

    const result = await adapter.sendEmail({
      to: 'user@example.com',
      subject: 'Welcome to OpenCRM',
      text: 'Hello, welcome to OpenCRM!',
    });

    expect(result.isSuccess).toBe(true);
  });

  it('should format recipient array and handle custom from address in simulation mode', async () => {
    const configService = {
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const adapter = new MailgunEmailAdapter(configService);

    const result = await adapter.sendEmail({
      to: ['user1@example.com', 'user2@example.com'],
      from: 'custom@opencrm.com',
      subject: 'Alert',
      html: '<h1>Alert</h1>',
    });

    expect(result.isSuccess).toBe(true);
  });

  it('should handle attachments in simulation mode', async () => {
    const configService = {
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const adapter = new MailgunEmailAdapter(configService);

    const result = await adapter.sendEmail({
      to: 'client@example.com',
      subject: 'Proposta com anexo',
      text: 'Segue proposta em anexo.',
      attachments: [
        {
          filename: 'proposta.pdf',
          content: 'JVBERi0xLjQK...',
          contentType: 'application/pdf',
          size: 1024,
        },
      ],
    });

    expect(result.isSuccess).toBe(true);
  });
});
