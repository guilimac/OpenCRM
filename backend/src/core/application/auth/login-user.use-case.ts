import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_PORT, type IUserRepository } from '../../domain/user/user.repository.port.js';
import { TOKEN_PORT, type ITokenPort, type TokenPair } from '../common/ports/token.port.js';
import { User } from '../../domain/user/user.entity.js';
import { Result } from '../../domain/common/result.js';
import * as bcrypt from 'bcryptjs';

export interface LoginUserDto {
  email: string;
  password: string;
  orgId?: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_PORT)
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(dto: LoginUserDto): Promise<Result<{ user: User; tokens: TokenPair }>> {
    const email = dto.email.toLowerCase().trim();
    let user: User | null = null;

    if (dto.orgId) {
      user = await this.userRepository.findByEmail(dto.orgId, email);
    } else {
      user = await this.userRepository.findByEmailGlobal(email);
    }

    if (!user) {
      return Result.fail<{ user: User; tokens: TokenPair }>('Invalid email or password');
    }

    if (!user.isActive) {
      return Result.fail<{ user: User; tokens: TokenPair }>('User account is deactivated');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      return Result.fail<{ user: User; tokens: TokenPair }>('Invalid email or password');
    }

    user.recordLogin();
    await this.userRepository.update(user);

    const tokens = await this.tokenPort.generateTokenPair({
      sub: user.id,
      email: user.email,
      orgId: user.orgId,
      role: user.role.value,
    });

    return Result.ok<{ user: User; tokens: TokenPair }>({ user, tokens });
  }
}
