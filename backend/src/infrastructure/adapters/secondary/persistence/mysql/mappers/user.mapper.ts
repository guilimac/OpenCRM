import { User } from '../../../../../../core/domain/user/user.entity.js';
import { UserRole } from '../../../../../../core/domain/user/user-role.vo.js';
import { UserOrmEntity } from '../entities/user.orm-entity.js';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    const roleResult = UserRole.create(orm.role);
    const role = roleResult.isSuccess ? roleResult.getValue() : UserRole.create('SALES_REP').getValue();

    const userResult = User.create(
      {
        orgId: orm.orgId,
        email: orm.email,
        passwordHash: orm.passwordHash,
        firstName: orm.firstName,
        lastName: orm.lastName,
        role,
        isActive: orm.isActive,
        lastLoginAt: orm.lastLoginAt,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
      },
      orm.id,
    );

    return userResult.getValue();
  }

  static toOrm(domain: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    orm.orgId = domain.orgId;
    orm.email = domain.email;
    orm.passwordHash = domain.passwordHash;
    orm.firstName = domain.firstName;
    orm.lastName = domain.lastName;
    orm.role = domain.role.value;
    orm.isActive = domain.isActive;
    orm.lastLoginAt = domain.lastLoginAt;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
