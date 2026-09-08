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
  avatarUrl?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  bio?: string | null;
  language?: string | null;
  timezone?: string | null;
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

  get avatarUrl(): string | null | undefined {
    return this.props.avatarUrl;
  }

  get phone(): string | null | undefined {
    return this.props.phone;
  }

  get jobTitle(): string | null | undefined {
    return this.props.jobTitle;
  }

  get bio(): string | null | undefined {
    return this.props.bio;
  }

  get language(): string | null | undefined {
    return this.props.language;
  }

  get timezone(): string | null | undefined {
    return this.props.timezone;
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

  public changePassword(newPasswordHash: string): void {
    this.props.passwordHash = newPasswordHash;
    this.props.updatedAt = new Date();
  }

  public updateProfile(props: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string | null;
    phone?: string | null;
    jobTitle?: string | null;
    bio?: string | null;
    language?: string | null;
    timezone?: string | null;
  }): Result<void> {
    if (props.firstName !== undefined) {
      if (!props.firstName || props.firstName.trim().length === 0) {
        return Result.fail('First name cannot be empty');
      }
      this.props.firstName = props.firstName.trim();
    }
    if (props.lastName !== undefined) {
      if (!props.lastName || props.lastName.trim().length === 0) {
        return Result.fail('Last name cannot be empty');
      }
      this.props.lastName = props.lastName.trim();
    }
    if (props.email !== undefined) {
      if (!props.email || !props.email.includes('@')) {
        return Result.fail('Invalid email address');
      }
      this.props.email = props.email.toLowerCase().trim();
    }
    if (props.avatarUrl !== undefined) {
      this.props.avatarUrl = props.avatarUrl;
    }
    if (props.phone !== undefined) {
      this.props.phone = props.phone;
    }
    if (props.jobTitle !== undefined) {
      this.props.jobTitle = props.jobTitle;
    }
    if (props.bio !== undefined) {
      this.props.bio = props.bio;
    }
    if (props.language !== undefined) {
      this.props.language = props.language;
    }
    if (props.timezone !== undefined) {
      this.props.timezone = props.timezone;
    }
    this.props.updatedAt = new Date();
    return Result.ok();
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
