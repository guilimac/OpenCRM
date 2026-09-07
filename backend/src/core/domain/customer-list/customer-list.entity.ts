import { AggregateRoot } from '../common/aggregate-root.base.js';
import { Result } from '../common/result.js';

export interface CustomerListProps {
  orgId: string;
  name: string;
  description?: string | null;
  customerIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class CustomerList extends AggregateRoot<CustomerListProps> {
  get orgId(): string {
    return this.props.orgId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get customerIds(): string[] {
    return [...this.props.customerIds];
  }

  get memberCount(): number {
    return this.props.customerIds.length;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateDetails(name: string, description?: string | null): Result<void> {
    if (!name || name.trim().length < 2) {
      return Result.fail<void>('List name must be at least 2 characters long');
    }
    this.props.name = name.trim();
    if (description !== undefined) {
      this.props.description = description;
    }
    this.props.updatedAt = new Date();
    return Result.ok<void>(undefined);
  }

  public addCustomer(customerId: string): void {
    if (!this.props.customerIds.includes(customerId)) {
      this.props.customerIds.push(customerId);
      this.props.updatedAt = new Date();
    }
  }

  public removeCustomer(customerId: string): void {
    const index = this.props.customerIds.indexOf(customerId);
    if (index !== -1) {
      this.props.customerIds.splice(index, 1);
      this.props.updatedAt = new Date();
    }
  }

  public setCustomers(customerIds: string[]): void {
    this.props.customerIds = Array.from(new Set(customerIds));
    this.props.updatedAt = new Date();
  }

  public static create(props: CustomerListProps, id: string): Result<CustomerList> {
    if (!props.orgId || props.orgId.trim().length === 0) {
      return Result.fail<CustomerList>('Organization ID is required');
    }
    if (!props.name || props.name.trim().length < 2) {
      return Result.fail<CustomerList>('List name must be at least 2 characters long');
    }

    return Result.ok<CustomerList>(
      new CustomerList(
        {
          ...props,
          name: props.name.trim(),
          customerIds: Array.from(new Set(props.customerIds || [])),
        },
        id,
      ),
    );
  }
}
