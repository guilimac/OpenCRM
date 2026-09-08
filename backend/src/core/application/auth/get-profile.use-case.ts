import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_PORT, type IUserRepository } from '../../domain/user/user.repository.port.js';
import { Result } from '../../domain/common/result.js';

export interface UserProfileDto {
  id: string;
  orgId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  avatarUrl?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  bio?: string | null;
  language?: string | null;
  timezone?: string | null;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<Result<UserProfileDto>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.fail<UserProfileDto>('User not found');
    }

    return Result.ok<UserProfileDto>({
      id: user.id,
      orgId: user.orgId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role.value,
      avatarUrl: user.avatarUrl ?? null,
      phone: user.phone ?? null,
      jobTitle: user.jobTitle ?? null,
      bio: user.bio ?? null,
      language: user.language ?? 'pt',
      timezone: user.timezone ?? 'America/Sao_Paulo',
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  }
}
