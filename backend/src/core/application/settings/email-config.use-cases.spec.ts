import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetEmailConfigUseCase } from './get-email-config.use-case.js';
import { SaveEmailConfigUseCase } from './save-email-config.use-case.js';
import { type IEmailConfigRepository } from '../../domain/settings/email-config.repository.port.js';
import { EmailConfig } from '../../domain/settings/entities/email-config.entity.js';

describe('Email Configuration Use Cases', () => {
  let mockRepo: IEmailConfigRepository;
  let getUseCase: GetEmailConfigUseCase;
  let saveUseCase: SaveEmailConfigUseCase;
  let storedConfig: EmailConfig | null = null;

  beforeEach(() => {
    storedConfig = null;

    mockRepo = {
      findByOrgId: vi.fn().mockImplementation(async (orgId: string) => storedConfig),
      save: vi.fn().mockImplementation(async (config: EmailConfig) => {
        storedConfig = config;
      }),
    };

    getUseCase = new GetEmailConfigUseCase(mockRepo);
    saveUseCase = new SaveEmailConfigUseCase(mockRepo, getUseCase);
  });

  it('should return default empty config if org has no saved settings', async () => {
    const result = await getUseCase.execute('org-1');

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.orgId).toBe('org-1');
    expect(dto.provider).toBe('MAILGUN');
    expect(dto.isActive).toBe(false);
    expect(dto.hasMailgunApiKey).toBe(false);
    expect(dto.hasSmtpPassword).toBe(false);
  });

  it('should create and save a new Mailgun configuration', async () => {
    const result = await saveUseCase.execute({
      orgId: 'org-1',
      provider: 'MAILGUN',
      mailgunApiKey: 'key-1234567890',
      mailgunDomain: 'mg.mycompany.com',
      mailgunHost: 'api.mailgun.net',
      fromEmail: 'sales@mycompany.com',
      fromName: 'MyCompany Sales',
      isActive: true,
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.provider).toBe('MAILGUN');
    expect(dto.fromEmail).toBe('sales@mycompany.com');
    expect(dto.fromName).toBe('MyCompany Sales');
    expect(dto.hasMailgunApiKey).toBe(true);
    expect(dto.mailgunApiKey).toBe('********'); // masked for security
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should create and save a new SMTP configuration', async () => {
    const result = await saveUseCase.execute({
      orgId: 'org-1',
      provider: 'SMTP',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'user@gmail.com',
      smtpPassword: 'app-password-secret',
      smtpSecure: false,
      fromEmail: 'user@gmail.com',
      fromName: 'Gmail User',
      isActive: true,
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.provider).toBe('SMTP');
    expect(dto.smtpHost).toBe('smtp.gmail.com');
    expect(dto.smtpPort).toBe(587);
    expect(dto.hasSmtpPassword).toBe(true);
    expect(dto.smtpPassword).toBe('********'); // masked
  });

  it('should preserve existing secrets when masked string is sent on update', async () => {
    // 1. Initial save
    await saveUseCase.execute({
      orgId: 'org-1',
      provider: 'SMTP',
      smtpHost: 'smtp.sendgrid.net',
      smtpPort: 587,
      smtpUser: 'apikey',
      smtpPassword: 'original-secret-token',
      fromEmail: 'noreply@sendgrid.com',
      fromName: 'Sendgrid Sender',
      isActive: true,
    });

    // 2. Update without changing password (sends ********)
    const updateResult = await saveUseCase.execute({
      orgId: 'org-1',
      provider: 'SMTP',
      smtpHost: 'smtp.sendgrid.net',
      smtpPort: 587,
      smtpUser: 'apikey',
      smtpPassword: '********',
      fromEmail: 'new-email@sendgrid.com',
      fromName: 'Updated Name',
      isActive: true,
    });

    expect(updateResult.isSuccess).toBe(true);
    expect(storedConfig!.smtpPassword).toBe('original-secret-token');
    expect(storedConfig!.fromEmail).toBe('new-email@sendgrid.com');
  });
});
