import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendEmailToCustomerUseCase } from './send-email-to-customer.use-case.js';
import { Customer } from '../../domain/customer/entities/customer.entity.js';
import { Contact } from '../../domain/customer/entities/contact.entity.js';
import { CustomerStatus } from '../../domain/customer/value-objects/customer-status.vo.js';
import { Result } from '../../domain/common/result.js';

describe('SendEmailToCustomerUseCase', () => {
  let useCase: SendEmailToCustomerUseCase;
  let customerRepo: any;
  let interactionRepo: any;
  let emailPort: any;

  const mockCustomer = Customer.create(
    {
      orgId: 'org-1',
      companyName: 'Acme Corp',
      status: CustomerStatus.create('ACTIVE_CUSTOMER').getValue(),
      contacts: [
        Contact.create(
          {
            orgId: 'org-1',
            customerId: 'cust-1',
            firstName: 'Carlos',
            lastName: 'Silva',
            email: 'carlos@acme.com',
            isPrimary: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          'cont-1',
        ).getValue(),
        Contact.create(
          {
            orgId: 'org-1',
            customerId: 'cust-1',
            firstName: 'Mariana',
            lastName: 'Lima',
            email: 'mariana@acme.com',
            isPrimary: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          'cont-2',
        ).getValue(),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'cust-1',
  ).getValue();

  beforeEach(() => {
    customerRepo = {
      findById: vi.fn(),
    };
    interactionRepo = {
      save: vi.fn().mockResolvedValue(undefined),
    };
    emailPort = {
      sendEmail: vi.fn().mockResolvedValue(Result.ok({ messageId: 'msg-1' })),
    };

    useCase = new SendEmailToCustomerUseCase(customerRepo, interactionRepo, emailPort);
  });

  it('should send email to primary contact when contactId is omitted', async () => {
    customerRepo.findById.mockResolvedValue(mockCustomer);

    const result = await useCase.execute({
      orgId: 'org-1',
      userId: 'user-1',
      customerId: 'cust-1',
      subject: 'Proposta Comercial',
      body: 'Olá Carlos, segue a proposta.',
    });

    expect(result.isSuccess).toBe(true);
    expect(emailPort.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'carlos@acme.com',
        subject: 'Proposta Comercial',
      }),
    );
    expect(interactionRepo.save).toHaveBeenCalledTimes(1);
    const savedInteraction = interactionRepo.save.mock.calls[0][0];
    expect(savedInteraction.type).toBe('EMAIL');
    expect(savedInteraction.contactId).toBe('cont-1');
  });

  it('should send email to specified contactId', async () => {
    customerRepo.findById.mockResolvedValue(mockCustomer);

    const result = await useCase.execute({
      orgId: 'org-1',
      userId: 'user-1',
      customerId: 'cust-1',
      contactId: 'cont-2',
      subject: 'Dúvidas Técnicas',
      body: 'Olá Mariana.',
    });

    expect(result.isSuccess).toBe(true);
    expect(emailPort.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'mariana@acme.com',
      }),
    );
  });

  it('should fail if subject or body is missing', async () => {
    const res1 = await useCase.execute({
      orgId: 'org-1',
      userId: 'user-1',
      customerId: 'cust-1',
      subject: '',
      body: 'Body text',
    });
    expect(res1.isFailure).toBe(true);
    expect(res1.error).toContain('Subject is required');

    const res2 = await useCase.execute({
      orgId: 'org-1',
      userId: 'user-1',
      customerId: 'cust-1',
      subject: 'Valid Subject',
      body: '',
    });
    expect(res2.isFailure).toBe(true);
    expect(res2.error).toContain('Message body is required');
  });

  it('should fail if customer is not found', async () => {
    customerRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      orgId: 'org-1',
      userId: 'user-1',
      customerId: 'unknown-cust',
      subject: 'Subject',
      body: 'Body',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Customer not found');
  });

  it('should preserve HTML markup and generate clean plain text', async () => {
    customerRepo.findById.mockResolvedValue(mockCustomer);

    const htmlContent = '<h1>Proposta Comercial</h1><p>Segue os <strong>detalhes</strong>.</p>';
    const result = await useCase.execute({
      orgId: 'org-1',
      userId: 'user-1',
      customerId: 'cust-1',
      subject: 'Proposta com HTML',
      body: htmlContent,
    });

    expect(result.isSuccess).toBe(true);
    expect(emailPort.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining(htmlContent),
        text: 'Proposta Comercial Segue os detalhes.',
      }),
    );
  });
});
