import { Entity } from '../../common/entity.base.js';
import { Result } from '../../common/result.js';

export interface ContactProps {
  orgId: string;
  customerId: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  email: string;
  phone?: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Contact extends Entity<ContactProps> {
  get orgId(): string {
    return this.props.orgId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`.trim();
  }

  get title(): string | null | undefined {
    return this.props.title;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string | null | undefined {
    return this.props.phone;
  }

  get isPrimary(): boolean {
    return this.props.isPrimary;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public setPrimary(isPrimary: boolean): void {
    this.props.isPrimary = isPrimary;
    this.props.updatedAt = new Date();
  }

  public static create(props: ContactProps, id: string): Result<Contact> {
    if (!props.email || !props.email.includes('@')) {
      return Result.fail<Contact>('Valid email is required for contact');
    }
    if (!props.firstName || props.firstName.trim().length === 0) {
      return Result.fail<Contact>('First name is required');
    }
    return Result.ok<Contact>(new Contact(props, id));
  }
}
