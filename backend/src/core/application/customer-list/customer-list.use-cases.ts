import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Result } from '../../domain/common/result.js';
import { CustomerList } from '../../domain/customer-list/customer-list.entity.js';
import {
  CUSTOMER_LIST_REPOSITORY_PORT,
  type ICustomerListRepository,
} from '../../domain/customer-list/customer-list.repository.port.js';
import {
  CUSTOMER_REPOSITORY_PORT,
  type ICustomerRepository,
} from '../../domain/customer/customer.repository.port.js';
import {
  INTERACTION_REPOSITORY_PORT,
  type IInteractionRepository,
} from '../../domain/interaction/interaction.repository.port.js';
import { Interaction } from '../../domain/interaction/interaction.entity.js';
import {
  EMAIL_PORT,
  type IEmailPort,
  type EmailAttachment,
} from '../common/ports/email.port.js';

// ── Create Customer List Use Case ────────────────────────────
export interface CreateCustomerListCommand {
  orgId: string;
  name: string;
  description?: string;
  customerIds?: string[];
}

@Injectable()
export class CreateCustomerListUseCase {
  constructor(
    @Inject(CUSTOMER_LIST_REPOSITORY_PORT)
    private readonly listRepository: ICustomerListRepository,
  ) {}

  async execute(command: CreateCustomerListCommand): Promise<Result<CustomerList>> {
    const listResult = CustomerList.create(
      {
        orgId: command.orgId,
        name: command.name,
        description: command.description,
        customerIds: command.customerIds ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      uuidv4(),
    );

    if (listResult.isFailure) {
      return Result.fail<CustomerList>(listResult.error || 'Failed to create customer list');
    }

    const list = listResult.getValue();
    await this.listRepository.save(list);
    return Result.ok<CustomerList>(list);
  }
}

// ── List Customer Lists Use Case ─────────────────────────────
@Injectable()
export class ListCustomerListsUseCase {
  constructor(
    @Inject(CUSTOMER_LIST_REPOSITORY_PORT)
    private readonly listRepository: ICustomerListRepository,
  ) {}

  async execute(orgId: string): Promise<Result<CustomerList[]>> {
    const lists = await this.listRepository.findByOrg(orgId);
    return Result.ok<CustomerList[]>(lists);
  }
}

// ── Get Customer List By Id Use Case ─────────────────────────
export interface CustomerSummaryItem {
  id: string;
  companyName: string;
  industry?: string | null;
  primaryContactEmail?: string | null;
  primaryContactName?: string | null;
}

export interface CustomerListDetailResponse {
  id: string;
  orgId: string;
  name: string;
  description?: string | null;
  memberCount: number;
  customers: CustomerSummaryItem[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetCustomerListByIdUseCase {
  constructor(
    @Inject(CUSTOMER_LIST_REPOSITORY_PORT)
    private readonly listRepository: ICustomerListRepository,
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(orgId: string, id: string): Promise<Result<CustomerListDetailResponse>> {
    const list = await this.listRepository.findById(orgId, id);
    if (!list) {
      return Result.fail<CustomerListDetailResponse>('Customer list not found');
    }

    const customers: CustomerSummaryItem[] = [];
    for (const customerId of list.customerIds) {
      const cust = await this.customerRepository.findById(orgId, customerId);
      if (cust) {
        const primary = cust.contacts.find((c) => c.isPrimary) || cust.contacts[0];
        customers.push({
          id: cust.id,
          companyName: cust.companyName,
          industry: cust.industry,
          primaryContactEmail: primary?.email ?? null,
          primaryContactName: primary ? primary.fullName : null,
        });
      }
    }

    return Result.ok<CustomerListDetailResponse>({
      id: list.id,
      orgId: list.orgId,
      name: list.name,
      description: list.description,
      memberCount: list.memberCount,
      customers,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    });
  }
}

// ── Send Mass Email Use Case ─────────────────────────────────
export interface SendMassEmailCommand {
  orgId: string;
  userId: string;
  customerListId: string;
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}

export interface SendMassEmailResult {
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  errors: Array<{ customerId: string; companyName?: string; reason: string }>;
}

@Injectable()
export class SendMassEmailUseCase {
  constructor(
    @Inject(CUSTOMER_LIST_REPOSITORY_PORT)
    private readonly listRepository: ICustomerListRepository,
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepository: ICustomerRepository,
    @Inject(INTERACTION_REPOSITORY_PORT)
    private readonly interactionRepository: IInteractionRepository,
    @Inject(EMAIL_PORT)
    private readonly emailPort: IEmailPort,
  ) {}

  async execute(command: SendMassEmailCommand): Promise<Result<SendMassEmailResult>> {
    if (!command.subject || command.subject.trim().length === 0) {
      return Result.fail<SendMassEmailResult>('Subject is required');
    }
    if (!command.body || command.body.trim().length === 0) {
      return Result.fail<SendMassEmailResult>('Message body is required');
    }

    const list = await this.listRepository.findById(command.orgId, command.customerListId);
    if (!list) {
      return Result.fail<SendMassEmailResult>('Customer list not found');
    }

    if (list.customerIds.length === 0) {
      return Result.fail<SendMassEmailResult>('Customer list has no members');
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: Array<{ customerId: string; companyName?: string; reason: string }> = [];

    for (const customerId of list.customerIds) {
      const customer = await this.customerRepository.findById(command.orgId, customerId);
      if (!customer) {
        failedCount++;
        errors.push({ customerId, reason: 'Customer record not found' });
        continue;
      }

      // Find primary or first contact with an email
      const targetContact = customer.contacts.find((c) => c.isPrimary && c.email) ||
        customer.contacts.find((c) => c.email);

      if (!targetContact || !targetContact.email) {
        failedCount++;
        errors.push({
          customerId,
          companyName: customer.companyName,
          reason: 'No contact with a valid email address found',
        });
        continue;
      }

      // Dynamic Merge Variables: {{companyName}}, {{contactName}}, {{firstName}}, {{email}}
      const interpolate = (template: string): string => {
        return template
          .replace(/\{\{\s*companyName\s*\}\}/g, customer.companyName)
          .replace(/\{\{\s*contactName\s*\}\}/g, targetContact.fullName)
          .replace(/\{\{\s*firstName\s*\}\}/g, targetContact.firstName)
          .replace(/\{\{\s*email\s*\}\}/g, targetContact.email);
      };

      const interpolatedSubject = interpolate(command.subject);
      const interpolatedBody = interpolate(command.body);

      const isHtml = /<[a-z][\s\S]*>/i.test(interpolatedBody);
      const htmlBody = isHtml
        ? `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6;">${interpolatedBody}</div>`
        : `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6;">
          ${interpolatedBody.replace(/\n/g, '<br/>')}
        </div>
      `;

      const plainText = isHtml
        ? interpolatedBody
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\s+([.,;:!?])/g, '$1')
            .trim()
        : interpolatedBody;

      const sendResult = await this.emailPort.sendEmail({
        orgId: command.orgId,
        to: targetContact.email,
        subject: interpolatedSubject,
        text: plainText,
        html: htmlBody,
        attachments: command.attachments,
      });

      if (sendResult.isFailure) {
        failedCount++;
        errors.push({
          customerId,
          companyName: customer.companyName,
          reason: sendResult.error || 'Failed to dispatch email',
        });
      } else {
        sentCount++;
        // Log individual EMAIL interaction
        const now = new Date();
        const attachmentNote = command.attachments?.length
          ? `\n\n[Anexos (${command.attachments.length}): ${command.attachments.map((a) => a.filename).join(', ')}]`
          : '';

        const interaction = Interaction.create(
          {
            orgId: command.orgId,
            userId: command.userId,
            customerId: customer.id,
            contactId: targetContact.id,
            type: 'EMAIL',
            subject: interpolatedSubject,
            description: `${interpolatedBody}${attachmentNote}`,
            outcome: 'MASS_MAIL_SENT',
            completedAt: now,
            createdAt: now,
            updatedAt: now,
          },
          uuidv4(),
        );

        if (interaction.isSuccess) {
          await this.interactionRepository.save(interaction.getValue());
        }
      }
    }

    return Result.ok<SendMassEmailResult>({
      totalRecipients: list.customerIds.length,
      sentCount,
      failedCount,
      errors,
    });
  }
}
