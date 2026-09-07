import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_PORT, type IUserRepository } from '../../domain/user/user.repository.port.js';
import { Result } from '../../domain/common/result.js';
import * as bcrypt from 'bcryptjs';

export interface ChangePasswordUseCaseDto {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: ChangePasswordUseCaseDto): Promise<Result<{ message: string }>> {
    if (!dto.newPassword || dto.newPassword.length < 6) {
      return Result.fail<{ message: string }>('New password must have at least 6 characters');
    }

    if (dto.currentPassword === dto.newPassword) {
      return Result.fail<{ message: string }>('New password must be different from current password');
    }

    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      return Result.fail<{ message: string }>('User not found');
    }

    const matches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!matches) {
      return Result.fail<{ message: string }>('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(dto.newPassword, salt);

    user.changePassword(newPasswordHash);
    await this.userRepository.update(user);

    return Result.ok<{ message: string }>({ message: 'Password updated successfully' });
  }
}
