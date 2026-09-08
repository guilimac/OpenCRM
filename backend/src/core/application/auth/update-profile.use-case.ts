import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_PORT, type IUserRepository } from '../../domain/user/user.repository.port.js';
import { Result } from '../../domain/common/result.js';
import { type UserProfileDto } from './get-profile.use-case.js';

export interface UpdateProfileInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  bio?: string | null;
  language?: string | null;
  timezone?: string | null;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: UpdateProfileInput): Promise<Result<UserProfileDto>> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      return Result.fail<UserProfileDto>('User not found');
    }

    // If changing email, verify uniqueness
    if (input.email && input.email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      const existing = await this.userRepository.findByEmailGlobal(input.email.toLowerCase().trim());
      if (existing && existing.id !== user.id) {
        return Result.fail<UserProfileDto>('Email is already in use by another user');
      }
    }

    const updateResult = user.updateProfile({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      avatarUrl: input.avatarUrl,
      phone: input.phone,
      jobTitle: input.jobTitle,
      bio: input.bio,
      language: input.language,
      timezone: input.timezone,
    });

    if (updateResult.isFailure) {
      return Result.fail<UserProfileDto>(updateResult.error!);
    }

    await this.userRepository.update(user);

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
