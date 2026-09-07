import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserUseCase, RegisterUserDto } from './register-user.use-case.js';
import { type IUserRepository } from '../../domain/user/user.repository.port.js';
import { type ITokenPort, type TokenPair } from '../common/ports/token.port.js';
import { User } from '../../domain/user/user.entity.js';
import * as bcrypt from 'bcryptjs';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepo: IUserRepository;
  let mockTokenPort: ITokenPort;
  let savedUser: User | null = null;

  beforeEach(() => {
    savedUser = null;
    mockUserRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByEmailGlobal: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation(async (user: User) => {
        savedUser = user;
      }),
      update: vi.fn(),
    };

    mockTokenPort = {
      generateTokenPair: vi.fn().mockResolvedValue({
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresIn: 900,
      } as TokenPair),
      verifyAccessToken: vi.fn(),
      rotateRefreshToken: vi.fn(),
      revokeTokenFamily: vi.fn(),
    };

    useCase = new RegisterUserUseCase(mockUserRepo, mockTokenPort);
  });

  it('should successfully register a user and store their password as a bcrypt hash', async () => {
    const plainPassword = 'StrongPassword123!';
    const dto: RegisterUserDto = {
      email: 'newuser@example.com',
      password: plainPassword,
      firstName: 'Alice',
      lastName: 'Smith',
    };

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    const { user, tokens } = result.getValue();

    expect(user.email).toBe('newuser@example.com');
    expect(user.role.value).toBe('ADMIN'); // Default for new org
    expect(user.orgId).toBeDefined();
    expect(tokens.accessToken).toBe('mock_access_token');

    // Verify password is NOT plain text and is a valid bcrypt hash
    expect(savedUser).not.toBeNull();
    expect(savedUser!.passwordHash).not.toBe(plainPassword);
    expect(savedUser!.passwordHash.startsWith('$2')).toBe(true);

    const matches = await bcrypt.compare(plainPassword, savedUser!.passwordHash);
    expect(matches).toBe(true);
  });

  it('should reject registration if email already exists globally', async () => {
    (mockUserRepo.findByEmailGlobal as any).mockResolvedValue({ id: 'existing_id' });

    const dto: RegisterUserDto = {
      email: 'existing@example.com',
      password: 'password123',
      firstName: 'Bob',
      lastName: 'Jones',
    };

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('An account with this email already exists');
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });
});
