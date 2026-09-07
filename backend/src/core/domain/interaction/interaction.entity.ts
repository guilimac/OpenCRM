import { Entity } from '../common/entity.base.js';
import { Result } from '../common/result.js';

export type InteractionType = 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK';

export interface InteractionProps {
  orgId: string;
  userId: string;
  customerId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  type: InteractionType;
  subject: string;
  description?: string | null;
  outcome?: string | null;
  scheduledAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Interaction extends Entity<InteractionProps> {
  get orgId(): string {
    return this.props.orgId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get contactId(): string | null | undefined {
    return this.props.contactId;
  }

  get opportunityId(): string | null | undefined {
    return this.props.opportunityId;
  }

  get type(): InteractionType {
    return this.props.type;
  }

  get subject(): string {
    return this.props.subject;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get outcome(): string | null | undefined {
    return this.props.outcome;
  }

  get scheduledAt(): Date | null | undefined {
    return this.props.scheduledAt;
  }

  get completedAt(): Date | null | undefined {
    return this.props.completedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public complete(outcome?: string): void {
    this.props.completedAt = new Date();
    if (outcome) {
      this.props.outcome = outcome;
    }
    this.props.updatedAt = new Date();
  }

  public static create(props: InteractionProps, id: string): Result<Interaction> {
    if (!props.subject || props.subject.trim().length === 0) {
      return Result.fail<Interaction>('Subject is required for interaction');
    }
    if (!props.customerId) {
      return Result.fail<Interaction>('Customer ID is required');
    }
    if (!props.userId) {
      return Result.fail<Interaction>('User ID is required');
    }

    return Result.ok<Interaction>(new Interaction(props, id));
  }
}
