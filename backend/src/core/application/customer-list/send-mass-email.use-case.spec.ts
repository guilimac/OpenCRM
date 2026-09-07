import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendMassEmailUseCase } from './customer-list.use-cases.js';
import { CustomerList } from '../../domain/customer-list/customer-list.entity.js';
import { Customer } from '../../domain/customer/entities/customer.entity.js';
import { Contact } from '../../domain/customer/entities/contact.entity.js';
import { CustomerStatus } from '../../domain/customer/value-objects/customer-status.vo.js';
import { Result } from '../../domain/common/result.js';

describe('SendMassEmailUseCase', () => {
  let useCase: SendMassEmailUseCase;
  let listRepo: any;
  let customerRepo: any;
  let interactionRepo: any;
  let emailPort: any;

  const mockList = CustomerList.create(
    {
      orgId: 'org-1',
      name: 'Clientes Ativos',
      customerIds: ['cust-1', 'cust-2'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'list-1',
  ).getValue();

  const customer1 = Customer.create(
    {
      orgId: 'org-1',
      companyName: 'Tech Brasil',
      status: CustomerStatus.create('ACTIVE_CUSTOMER').getValue(),
      contacts: [
        Contact.create(
          {
            orgId: 'org-1',
            customerId: 'cust-1',
            firstName: 'Lucas',
            lastName: 'Melo',
            email: 'lucas@techbrasil.com',
            isPrimary: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          'c-1',
        ).getValue(),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'cust-1',
  ).getValue();

  const customer2 = Customer.create(
    {
      orgId: 'org-1',
      companyName: 'Agro Sul',
      status: CustomerStatus.create('ACTIVE_CUSTOMER').getValue(),
      contacts: [
        Contact.create(
          {
            orgId: 'org-1',
            customerId: 'cust-2',
            firstName: 'Renata',
            lastName: 'Alves',
            email: 'renata@agrosul.com',
            isPrimary: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          'c-2',
        ).getValue(),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'cust-2',
  ).getValue();

  beforeEach(() => {
    listRepo = {
      findById: vi.fn(),
    };
    customerRepo = {
      findById: vi.fn(),
    };
    interactionRepo = {
      save: vi.fn().mockResolvedValue(undefined),
    };
    emailPort = {
      sendEmail: vi.fn().mockResolvedValue(Result.ok({ messageId: 'msg-ok' })),
    };

    useCase = new SendMassEmailUseCase(listRepo, customerRepo, interactionRepo, emailPort);
  });

  it('should interpolate template tags and send emails to all list members', async () => {
    listRepo.findById.mockResolvedValue(mockList);
    customerRepo.findById.mockImplementation(async (_orgId: string, id: string) => {
      if (id === 'cust-1') return customer1;
      if (id === 'cust-2') return customer2;
      return null;
    });

    const result = await useCase.execute({
      orgId: 'org-1',
      userId: 'user-sender',
      customerListId: 'list-1',
      subject: 'Novidade para a {{companyName}}!',
      body: 'Olá {{firstName}}, estamos felizes em atender a {{companyName}}.',
    });

    expect(result.isSuccess).toBe(true);
    const summary = result.getValue();
    expect(summary.totalRecipients).toBe(2);
    expect(summary.sentCount).toBe(2);
    expect(summary.failedCount).toBe(0);

    // Verify interpolation for cust-1
    expect(emailPort.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'lucas@techbrasil.com',
        subject: 'Novidade para a Tech Brasil!',
        text: 'Olá Lucas, estamos felizes em atender a Tech Brasil.',
      }),
    );

    // Verify interpolation for cust-2
    expect(emailPort.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'renata@agrosul.com',
        subject: 'Novidade para a Agro Sul!',
        text: 'Olá Renata, estamos felizes em atender a Agro Sul.',
      }),
    );

    // Verify 2 interactions logged
    expect(interactionRepo.save).toHaveBeenCalledTimes(2);
  });

  it('should track failure when a customer has no valid email contact', async () => {
    const customerNoEmail = Customer.create(
      {
        orgId: 'org-1',
        companyName: 'Sem Contato',
        status: CustomerStatus.create('LEAD').getValue(),
        contacts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'cust-2',
    ).getValue();

    listRepo.findById.mockResolvedValue(mockList);
    customerRepo.findById.mockImplementation(async (_orgId: string, id: string) => {
      if (id === 'cust-1') return customer1;
      if (id === 'cust-2') return customerNoEmail;
      return null;
    });

    const result = await useCase.execute({
      orgId: 'org-1',
      userId: 'user-sender',
      customerListId: 'list-1',
      subject: 'Assunto Teste',
      body: 'Corpo Teste',
    });

    expect(result.isSuccess).toBe(true);
    const summary = result.getValue();
    expect(summary.totalRecipients).toBe(2);
    expect(summary.sentCount).toBe(1);
    expect(summary.failedCount).toBe(1);
    expect(summary.errors[0].reason).toContain('No contact with a valid email address');
  });

  it('should fail if list is not found', async () => {
    listRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      orgId: 'org-1',
      userId: 'user-sender',
      customerListId: 'unknown-list',
      subject: 'Assunto',
      body: 'Corpo',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Customer list not found');
  });

  it('should interpolate tags in HTML body and preserve HTML markup', async () => {
    listRepo.findById.mockResolvedValue(mockList);
    customerRepo.findById.mockImplementation(async (_orgId: string, id: string) => {
      if (id === 'cust-1') return customer1;
      if (id === 'cust-2') return customer2;
      return null;
    });

    const result = await useCase.execute({
      orgId: 'org-1',
      userId: 'user-sender',
      customerListId: 'list-1',
      subject: 'Campanha Especial',
      body: '<p>Olá <strong>{{firstName}}</strong>,</p><p>Bem-vindo à <em>{{companyName}}</em>.</p>',
    });

    expect(result.isSuccess).toBe(true);
    expect(emailPort.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'lucas@techbrasil.com',
        html: expect.stringContaining('<p>Olá <strong>Lucas</strong>,</p><p>Bem-vindo à <em>Tech Brasil</em>.</p>'),
        text: 'Olá Lucas, Bem-vindo à Tech Brasil.',
      }),
    );
  });
});
