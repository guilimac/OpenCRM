import { ValueObject } from '../../common/value-object.base.js';
import { Result } from '../../common/result.js';

export type BudgetStatusType = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export class BudgetStatus extends ValueObject<{ value: BudgetStatusType }> {
  get value(): BudgetStatusType {
    return this.props.value;
  }

  get isApproved(): boolean {
    return this.props.value === 'APPROVED';
  }

  get isClosed(): boolean {
    return this.props.value === 'APPROVED' || this.props.value === 'REJECTED' || this.props.value === 'EXPIRED';
  }

  public static create(status: string): Result<BudgetStatus> {
    const validStatuses: BudgetStatusType[] = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'];
    const upper = (status || '').toUpperCase().trim() as BudgetStatusType;

    if (!validStatuses.includes(upper)) {
      return Result.fail<BudgetStatus>(
        `Invalid budget status: ${status}. Allowed: ${validStatuses.join(', ')}`,
      );
    }

    return Result.ok<BudgetStatus>(new BudgetStatus({ value: upper }));
  }
}
