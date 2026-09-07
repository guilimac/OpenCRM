import { AggregateRoot } from '../../common/aggregate-root.base.js';
import { MonetaryValue } from '../value-objects/monetary-value.vo.js';
import { OpportunityStage } from '../value-objects/stage.vo.js';
import { Result } from '../../common/result.js';

export interface OpportunityProps {
  orgId: string;
  customerId: string;
  ownerId: string;
  title: string;
  monetaryValue: MonetaryValue;
  stage: OpportunityStage;
  expectedCloseDate: Date;
  closedAt?: Date | null;
  lossReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Opportunity extends AggregateRoot<OpportunityProps> {
  get orgId(): string {
    return this.props.orgId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get title(): string {
    return this.props.title;
  }

  get monetaryValue(): MonetaryValue {
    return this.props.monetaryValue;
  }

  get stage(): OpportunityStage {
    return this.props.stage;
  }

  get expectedCloseDate(): Date {
    return this.props.expectedCloseDate;
  }

  get closedAt(): Date | null | undefined {
    return this.props.closedAt;
  }

  get lossReason(): string | null | undefined {
    return this.props.lossReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Expected weighted revenue in BRL: amountInBrl * (probability / 100)
   */
  get weightedValueInBrl(): number {
    const raw = (this.monetaryValue.amountInBrl * this.stage.probability) / 100;
    return Math.round(raw * 100) / 100;
  }

  public changeStage(newStage: OpportunityStage, lossReason?: string): Result<void> {
    if (newStage.value === 'CLOSED_LOST' && (!lossReason || lossReason.trim().length === 0)) {
      return Result.fail<void>('A loss reason is strictly required when marking an opportunity as CLOSED_LOST');
    }

    this.props.stage = newStage;
    if (newStage.isClosed) {
      this.props.closedAt = new Date();
      this.props.lossReason = newStage.value === 'CLOSED_LOST' ? lossReason : null;
    } else {
      this.props.closedAt = null;
      this.props.lossReason = null;
    }
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public updateDetails(params: {
    title?: string;
    monetaryValue?: MonetaryValue;
    expectedCloseDate?: Date;
    ownerId?: string;
  }): void {
    if (params.title) this.props.title = params.title;
    if (params.monetaryValue) this.props.monetaryValue = params.monetaryValue;
    if (params.expectedCloseDate) this.props.expectedCloseDate = params.expectedCloseDate;
    if (params.ownerId) this.props.ownerId = params.ownerId;
    this.props.updatedAt = new Date();
  }

  public static create(props: OpportunityProps, id: string): Result<Opportunity> {
    if (!props.title || props.title.trim().length === 0) {
      return Result.fail<Opportunity>('Opportunity title is required');
    }
    if (!props.customerId) {
      return Result.fail<Opportunity>('Customer ID is required');
    }
    if (!props.ownerId) {
      return Result.fail<Opportunity>('Owner ID is required');
    }

    return Result.ok<Opportunity>(new Opportunity(props, id));
  }
}
