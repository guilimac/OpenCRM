import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangePasswordUseCase } from './change-password.use-case.js';
import { type IUserRepository } from '../../domain/user/user.repository.port.js';
import { User } from '../../domain/user/user.entity.js';
import { UserRole } from '../../domain/user/user-role.vo.js';
import * as bcrypt from 'bcryptjs';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let mockUserRepo: IUserRepository;
  let testUser: User;
  const initialPassword = 'InitialP@ss123!';

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(initialPassword, salt);

    const userResult = User.create(
      {
        orgId: 'org-1',
        email: 'user@example.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.create('SALES_REP').getValue(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'user-123',
    );
    testUser = userResult.getValue();

    mockUserRepo = {
      findById: vi.fn().mockImplementation(async (id: string) => (id === 'user-123' ? testUser : null)),
      findByEmail: vi.fn(),
      findByEmailGlobal: vi.fn(),
      save: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new ChangePasswordUseCase(mockUserRepo);
  });

  it('should successfully change password when current password is valid', async () => {
    const newPassword = 'NewSecretPassword456!';
    const result = await useCase.execute({
      userId: 'user-123',
      currentPassword: initialPassword,
      newPassword,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().message).toBe('Password updated successfully');
    expect(mockUserRepo.update).toHaveBeenCalledWith(testUser);

    // Verify the new password hash matches the new password
    const matches = await bcrypt.compare(newPassword, testUser.passwordHash);
    expect(matches).toBe(true);
  });

  it('should fail if current password is incorrect', async () => {
    const result = await useCase.execute({
      userId: 'user-123',
      currentPassword: 'WrongPassword!',
      newPassword: 'NewSecretPassword456!',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Current password is incorrect');
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });

  it('should fail if new password is identical to current password', async () => {
    const result = await useCase.execute({
      userId: 'user-123',
      currentPassword: initialPassword,
      newPassword: initialPassword,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('New password must be different from current password');
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });

  it('should fail if new password is too short', async () => {
    const result = await useCase.execute({
      userId: 'user-123',
      currentPassword: initialPassword,
      newPassword: '123',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('New password must have at least 6 characters');
  });

  it('should fail if user is not found', async () => {
    const result = await useCase.execute({
      userId: 'non-existent-user',
      currentPassword: initialPassword,
      newPassword: 'NewSecretPassword456!',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('User not found');
  });
});
