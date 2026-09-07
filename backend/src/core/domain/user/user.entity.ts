import { AggregateRoot } from '../common/aggregate-root.base.js';
import { UserRole } from './user-role.vo.js';
import { Result } from '../common/result.js';

export interface UserProps {
  orgId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<UserProps> {
  get orgId(): string {
    return this.props.orgId;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
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

  get role(): UserRole {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastLoginAt(): Date | null | undefined {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public recordLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public static create(props: UserProps, id: string): Result<User> {
    if (!props.email || !props.email.includes('@')) {
      return Result.fail<User>('Invalid email address');
    }
    if (!props.firstName || props.firstName.trim().length === 0) {
      return Result.fail<User>('First name is required');
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      return Result.fail<User>('Last name is required');
    }

    return Result.ok<User>(new User(props, id));
  }
}
