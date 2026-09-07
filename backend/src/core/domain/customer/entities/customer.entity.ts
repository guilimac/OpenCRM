import { AggregateRoot } from '../../common/aggregate-root.base.js';
import { CustomerStatus } from '../value-objects/customer-status.vo.js';
import { Contact } from './contact.entity.js';
import { Result } from '../../common/result.js';

export interface CustomerProps {
  orgId: string;
  assignedOwnerId?: string | null;
  companyName: string;
  industry?: string | null;
  website?: string | null;
  status: CustomerStatus;
  annualRevenue?: number | null;
  employeeCount?: number | null;
  contacts?: Contact[];
  createdAt: Date;
  updatedAt: Date;
}

export class Customer extends AggregateRoot<CustomerProps> {
  get orgId(): string {
    return this.props.orgId;
  }

  get assignedOwnerId(): string | null | undefined {
    return this.props.assignedOwnerId;
  }

  get companyName(): string {
    return this.props.companyName;
  }

  get industry(): string | null | undefined {
    return this.props.industry;
  }

  get website(): string | null | undefined {
    return this.props.website;
  }

  get status(): CustomerStatus {
    return this.props.status;
  }

  get annualRevenue(): number | null | undefined {
    return this.props.annualRevenue;
  }

  get employeeCount(): number | null | undefined {
    return this.props.employeeCount;
  }

  get contacts(): Contact[] {
    return this.props.contacts ?? [];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateStatus(newStatus: CustomerStatus): void {
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  public assignOwner(ownerId: string | null): void {
    this.props.assignedOwnerId = ownerId;
    this.props.updatedAt = new Date();
  }

  public updateProfile(params: {
    companyName?: string;
    industry?: string | null;
    website?: string | null;
    annualRevenue?: number | null;
    employeeCount?: number | null;
  }): void {
    if (params.companyName) this.props.companyName = params.companyName;
    if (params.industry !== undefined) this.props.industry = params.industry;
    if (params.website !== undefined) this.props.website = params.website;
    if (params.annualRevenue !== undefined) this.props.annualRevenue = params.annualRevenue;
    if (params.employeeCount !== undefined) this.props.employeeCount = params.employeeCount;
    this.props.updatedAt = new Date();
  }

  public addContact(contact: Contact): void {
    if (!this.props.contacts) {
      this.props.contacts = [];
    }
    this.props.contacts.push(contact);
    this.props.updatedAt = new Date();
  }

  public static create(props: CustomerProps, id: string): Result<Customer> {
    if (!props.companyName || props.companyName.trim().length === 0) {
      return Result.fail<Customer>('Company name is required');
    }
    if (!props.orgId) {
      return Result.fail<Customer>('Organization ID is required');
    }

    return Result.ok<Customer>(new Customer(props, id));
  }
}
