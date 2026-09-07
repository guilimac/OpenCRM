import { SetMetadata } from '@nestjs/common';
import { UserRoleType } from '../../../../../core/domain/user/user-role.vo.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoleType[]) => SetMetadata(ROLES_KEY, roles);
