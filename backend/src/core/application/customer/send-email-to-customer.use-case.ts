import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Result } from '../../domain/common/result.js';
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
} from '../common/ports/email.port.js';

export interface SendEmailToCustomerCommand {
  orgId: string;
  userId: string;
  customerId: string;
  contactId?: string;
  recipientEmail?: string;
  subject: string;
  body: string;
}

export interface SendEmailToCustomerResponse {
  interactionId: string;
  recipientEmail: string;
  sentAt: Date;
}

@Injectable()
export class SendEmailToCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepository: ICustomerRepository,
    @Inject(INTERACTION_REPOSITORY_PORT)
    private readonly interactionRepository: IInteractionRepository,
    @Inject(EMAIL_PORT)
    private readonly emailPort: IEmailPort,
  ) {}

  async execute(command: SendEmailToCustomerCommand): Promise<Result<SendEmailToCustomerResponse>> {
    if (!command.subject || command.subject.trim().length === 0) {
      return Result.fail<SendEmailToCustomerResponse>('Subject is required');
    }
    if (!command.body || command.body.trim().length === 0) {
      return Result.fail<SendEmailToCustomerResponse>('Message body is required');
    }

    const customer = await this.customerRepository.findById(command.orgId, command.customerId);
    if (!customer) {
      return Result.fail<SendEmailToCustomerResponse>('Customer not found');
    }

    // Resolve target contact and email
    let resolvedContact = null;
    let resolvedEmail = command.recipientEmail?.trim();

    if (command.contactId) {
      resolvedContact = customer.contacts.find((c) => c.id === command.contactId);
      if (!resolvedContact) {
        return Result.fail<SendEmailToCustomerResponse>('Specified contact not found for this customer');
      }
      resolvedEmail = resolvedContact.email;
    } else if (!resolvedEmail) {
      // Find primary contact or first contact with email
      resolvedContact = customer.contacts.find((c) => c.isPrimary && c.email) ||
        customer.contacts.find((c) => c.email);

      if (resolvedContact) {
        resolvedEmail = resolvedContact.email;
      }
    }

    if (!resolvedEmail) {
      return Result.fail<SendEmailToCustomerResponse>(
        'Customer has no contacts with a valid email address and no recipient email was specified',
      );
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6;">
        ${command.body.replace(/\n/g, '<br/>')}
      </div>
    `;

    // Dispatch email via Mailgun Email Port
    const emailResult = await this.emailPort.sendEmail({
      to: resolvedEmail,
      subject: command.subject,
      text: command.body,
      html: htmlBody,
    });

    if (emailResult.isFailure) {
      return Result.fail<SendEmailToCustomerResponse>(`Failed to dispatch email: ${emailResult.error}`);
    }

    // Log interaction
    const now = new Date();
    const interactionOrError = Interaction.create(
      {
        orgId: command.orgId,
        userId: command.userId,
        customerId: customer.id,
        contactId: resolvedContact?.id ?? null,
        type: 'EMAIL',
        subject: command.subject,
        description: command.body,
        outcome: 'SENT',
        completedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      uuidv4(),
    );

    if (interactionOrError.isSuccess) {
      await this.interactionRepository.save(interactionOrError.getValue());
    }

    return Result.ok<SendEmailToCustomerResponse>({
      interactionId: interactionOrError.getValue().id,
      recipientEmail: resolvedEmail,
      sentAt: now,
    });
  }
}
