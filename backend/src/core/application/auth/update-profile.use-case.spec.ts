import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetProfileUseCase } from './get-profile.use-case.js';
import { UpdateProfileUseCase } from './update-profile.use-case.js';
import { type IUserRepository } from '../../domain/user/user.repository.port.js';
import { User } from '../../domain/user/user.entity.js';
import { UserRole } from '../../domain/user/user-role.vo.js';

describe('Profile Use Cases', () => {
  let mockUserRepo: IUserRepository;
  let testUser: User;
  let getProfileUseCase: GetProfileUseCase;
  let updateProfileUseCase: UpdateProfileUseCase;

  beforeEach(() => {
    const userResult = User.create(
      {
        orgId: 'org-1',
        email: 'john.doe@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.create('SALES_REP').getValue(),
        isActive: true,
        avatarUrl: 'https://example.com/avatar.png',
        phone: '+55 11 99999-8888',
        jobTitle: 'Account Executive',
        bio: 'Focused on enterprise accounts',
        language: 'pt',
        timezone: 'America/Sao_Paulo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'user-123',
    );
    testUser = userResult.getValue();

    mockUserRepo = {
      findById: vi.fn().mockImplementation(async (id: string) => (id === 'user-123' ? testUser : null)),
      findByEmail: vi.fn(),
      findByEmailGlobal: vi.fn().mockImplementation(async (email: string) => {
        if (email === 'taken@example.com') {
          return User.create(
            {
              orgId: 'org-2',
              email: 'taken@example.com',
              passwordHash: 'hash',
              firstName: 'Other',
              lastName: 'User',
              role: UserRole.create('ADMIN').getValue(),
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            'user-other',
          ).getValue();
        }
        return null;
      }),
      save: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    };

    getProfileUseCase = new GetProfileUseCase(mockUserRepo);
    updateProfileUseCase = new UpdateProfileUseCase(mockUserRepo);
  });

  describe('GetProfileUseCase', () => {
    it('should return user profile details', async () => {
      const result = await getProfileUseCase.execute('user-123');

      expect(result.isSuccess).toBe(true);
      const profile = result.getValue();
      expect(profile.id).toBe('user-123');
      expect(profile.email).toBe('john.doe@example.com');
      expect(profile.firstName).toBe('John');
      expect(profile.lastName).toBe('Doe');
      expect(profile.fullName).toBe('John Doe');
      expect(profile.jobTitle).toBe('Account Executive');
      expect(profile.phone).toBe('+55 11 99999-8888');
      expect(profile.avatarUrl).toBe('https://example.com/avatar.png');
    });

    it('should fail if user is not found', async () => {
      const result = await getProfileUseCase.execute('unknown-id');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('User not found');
    });
  });

  describe('UpdateProfileUseCase', () => {
    it('should update profile fields and persist changes', async () => {
      const result = await updateProfileUseCase.execute({
        userId: 'user-123',
        firstName: 'Jonathan',
        lastName: 'Smith',
        phone: '+55 11 88888-7777',
        jobTitle: 'Senior Sales Director',
        avatarUrl: 'https://example.com/new-avatar.png',
        bio: 'Updated bio here',
      });

      expect(result.isSuccess).toBe(true);
      const updated = result.getValue();
      expect(updated.firstName).toBe('Jonathan');
      expect(updated.lastName).toBe('Smith');
      expect(updated.fullName).toBe('Jonathan Smith');
      expect(updated.phone).toBe('+55 11 88888-7777');
      expect(updated.jobTitle).toBe('Senior Sales Director');
      expect(updated.avatarUrl).toBe('https://example.com/new-avatar.png');
      expect(updated.bio).toBe('Updated bio here');
      expect(mockUserRepo.update).toHaveBeenCalledWith(testUser);
    });

    it('should fail if first name is empty', async () => {
      const result = await updateProfileUseCase.execute({
        userId: 'user-123',
        firstName: '   ',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('First name cannot be empty');
    });

    it('should prevent duplicate email from another user', async () => {
      const result = await updateProfileUseCase.execute({
        userId: 'user-123',
        email: 'taken@example.com',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Email is already in use');
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });
  });
});
