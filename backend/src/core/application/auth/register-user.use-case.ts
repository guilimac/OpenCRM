import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_PORT, type IUserRepository } from '../../domain/user/user.repository.port.js';
import { TOKEN_PORT, type ITokenPort, type TokenPair } from '../common/ports/token.port.js';
import { User } from '../../domain/user/user.entity.js';
import { UserRole } from '../../domain/user/user-role.vo.js';
import { Result } from '../../domain/common/result.js';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterUserDto {
  orgId?: string;
  organizationName?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_PORT)
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(dto: RegisterUserDto): Promise<Result<{ user: User; tokens: TokenPair }>> {
    const email = dto.email.toLowerCase().trim();

    // Prevent duplicate emails globally across the platform
    const existing = await this.userRepository.findByEmailGlobal(email);
    if (existing) {
      return Result.fail<{ user: User; tokens: TokenPair }>('An account with this email already exists');
    }

    // Auto-generate orgId if registering a new workspace; assign ADMIN role by default for new orgs
    const orgId = dto.orgId?.trim() || uuidv4();
    const defaultRole = dto.orgId ? 'SALES_REP' : 'ADMIN';
    const roleResult = UserRole.create(dto.role ?? defaultRole);
    if (roleResult.isFailure) {
      return Result.fail<{ user: User; tokens: TokenPair }>(roleResult.error!);
    }

    // Securely hash password using bcrypt salt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);
    const now = new Date();

    const userResult = User.create(
      {
        orgId,
        email,
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        role: roleResult.getValue(),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      uuidv4(),
    );

    if (userResult.isFailure) {
      return Result.fail<{ user: User; tokens: TokenPair }>(userResult.error!);
    }

    const user = userResult.getValue();
    await this.userRepository.save(user);

    const tokens = await this.tokenPort.generateTokenPair({
      sub: user.id,
      email: user.email,
      orgId: user.orgId,
      role: user.role.value,
    });

    return Result.ok<{ user: User; tokens: TokenPair }>({ user, tokens });
  }
}
