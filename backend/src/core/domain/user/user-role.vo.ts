import { ValueObject } from '../common/value-object.base.js';
import { Result } from '../common/result.js';

export type UserRoleType = 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'SALES_REP' | 'SUPPORT_AGENT';

export class UserRole extends ValueObject<{ value: UserRoleType }> {
  private static readonly VALID_ROLES: UserRoleType[] = [
    'SUPERADMIN',
    'ADMIN',
    'MANAGER',
    'SALES_REP',
    'SUPPORT_AGENT',
  ];

  get value(): UserRoleType {
    return this.props.value;
  }

  public static create(role: string): Result<UserRole> {
    const uppercaseRole = role.toUpperCase() as UserRoleType;
    if (!this.VALID_ROLES.includes(uppercaseRole)) {
      return Result.fail<UserRole>(`Invalid role: ${role}. Must be one of: ${this.VALID_ROLES.join(', ')}`);
    }
    return Result.ok<UserRole>(new UserRole({ value: uppercaseRole }));
  }
}
