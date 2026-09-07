import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestPasswordResetUseCase } from './request-password-reset.use-case.js';
import { ResetPasswordUseCase } from './reset-password.use-case.js';
import { type IUserRepository } from '../../domain/user/user.repository.port.js';
import { type ICachePort } from '../common/ports/cache.port.js';
import { type IEmailPort } from '../common/ports/email.port.js';
import { ConfigService } from '@nestjs/config';
import { User } from '../../domain/user/user.entity.js';
import { UserRole } from '../../domain/user/user-role.vo.js';
import { Result } from '../../domain/common/result.js';
import * as bcrypt from 'bcryptjs';

describe('Password Recovery Use Cases', () => {
  let requestUseCase: RequestPasswordResetUseCase;
  let resetUseCase: ResetPasswordUseCase;

  let mockUserRepo: IUserRepository;
  let mockCache: ICachePort;
  let mockEmail: IEmailPort;
  let mockConfig: ConfigService;

  let testUser: User;
  const memoryCache = new Map<string, any>();

  beforeEach(async () => {
    memoryCache.clear();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('InitialPassword123', salt);

    const userResult = User.create(
      {
        orgId: 'org-1',
        email: 'user@example.com',
        passwordHash,
        firstName: 'Carlos',
        lastName: 'Ferreira',
        role: UserRole.create('SALES_REP').getValue(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'user-456',
    );
    testUser = userResult.getValue();

    mockUserRepo = {
      findById: vi.fn().mockImplementation(async (id: string) => (id === 'user-456' ? testUser : null)),
      findByEmail: vi.fn(),
      findByEmailGlobal: vi.fn().mockImplementation(async (email: string) => (email === 'user@example.com' ? testUser : null)),
      save: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    };

    mockCache = {
      get: vi.fn().mockImplementation(async (key: string) => memoryCache.get(key) || null),
      set: vi.fn().mockImplementation(async (key: string, value: any) => {
        memoryCache.set(key, value);
      }),
      del: vi.fn().mockImplementation(async (key: string) => {
        memoryCache.delete(key);
      }),
      delPattern: vi.fn(),
      isRevoked: vi.fn(),
      revokeUser: vi.fn().mockResolvedValue(undefined),
    };

    mockEmail = {
      sendEmail: vi.fn().mockResolvedValue(Result.ok<void>()),
    };

    mockConfig = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'APP_URL') return 'http://localhost';
        return defaultValue;
      }),
    } as unknown as ConfigService;

    requestUseCase = new RequestPasswordResetUseCase(mockUserRepo, mockCache, mockEmail, mockConfig);
    resetUseCase = new ResetPasswordUseCase(mockUserRepo, mockCache, mockEmail);
  });

  describe('RequestPasswordResetUseCase', () => {
    it('should generate a token, store in cache, and dispatch email for existing user', async () => {
      const result = await requestUseCase.execute({ email: 'user@example.com' });

      expect(result.isSuccess).toBe(true);
      expect(mockCache.set).toHaveBeenCalledTimes(1);
      expect(mockEmail.sendEmail).toHaveBeenCalledTimes(1);

      const emailCall = (mockEmail.sendEmail as any).mock.calls[0][0];
      expect(emailCall.to).toBe('user@example.com');
      expect(emailCall.subject).toContain('Recuperação de Senha');
      expect(emailCall.text).toContain('/reset-password?token=');
    });

    it('should return generic success and not send email if user does not exist', async () => {
      const result = await requestUseCase.execute({ email: 'nonexistent@example.com' });

      expect(result.isSuccess).toBe(true);
      expect(mockCache.set).not.toHaveBeenCalled();
      expect(mockEmail.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('ResetPasswordUseCase', () => {
    it('should reset password with valid token and invalidate token', async () => {
      // Setup token in cache
      const resetToken = 'valid-token-123';
      await mockCache.set(`auth:reset-token:${resetToken}`, { userId: 'user-456', email: 'user@example.com' });

      const newPassword = 'BrandNewPassword789!';
      const result = await resetUseCase.execute({
        token: resetToken,
        newPassword,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().message).toBe('Senha redefinida com sucesso!');
      expect(mockUserRepo.update).toHaveBeenCalledWith(testUser);

      // Verify token was deleted from cache
      expect(mockCache.del).toHaveBeenCalledWith(`auth:reset-token:${resetToken}`);

      // Verify password was hashed and updated
      const matches = await bcrypt.compare(newPassword, testUser.passwordHash);
      expect(matches).toBe(true);
    });

    it('should reject invalid or expired reset token', async () => {
      const result = await resetUseCase.execute({
        token: 'invalid-or-expired-token',
        newPassword: 'BrandNewPassword789!',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('inválido ou expirado');
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it('should reject passwords shorter than 6 characters', async () => {
      const result = await resetUseCase.execute({
        token: 'some-token',
        newPassword: '123',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('pelo menos 6 caracteres');
    });
  });
});
