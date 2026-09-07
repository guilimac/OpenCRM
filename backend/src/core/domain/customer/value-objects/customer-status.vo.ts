import { ValueObject } from '../../common/value-object.base.js';
import { Result } from '../../common/result.js';

export type CustomerStatusType = 'LEAD' | 'PROSPECT' | 'ACTIVE_CUSTOMER' | 'CHURNED' | 'INACTIVE';

export class CustomerStatus extends ValueObject<{ value: CustomerStatusType }> {
  private static readonly VALID_STATUSES: CustomerStatusType[] = [
    'LEAD',
    'PROSPECT',
    'ACTIVE_CUSTOMER',
    'CHURNED',
    'INACTIVE',
  ];

  get value(): CustomerStatusType {
    return this.props.value;
  }

  public static create(status: string): Result<CustomerStatus> {
    const uppercase = status.toUpperCase() as CustomerStatusType;
    if (!this.VALID_STATUSES.includes(uppercase)) {
      return Result.fail<CustomerStatus>(
        `Invalid customer status: ${status}. Must be one of: ${this.VALID_STATUSES.join(', ')}`,
      );
    }
    return Result.ok<CustomerStatus>(new CustomerStatus({ value: uppercase }));
  }
}
