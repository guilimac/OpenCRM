import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @ApiPropertyOptional({ example: 'org_12345' })
  @IsOptional()
  @IsString()
  orgId?: string;

  @ApiPropertyOptional({ example: 'TechCorp Brasil' })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongP@ssw0rd!' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ enum: ['SUPERADMIN', 'ADMIN', 'MANAGER', 'SALES_REP', 'SUPPORT_AGENT'] })
  @IsOptional()
  @IsString()
  role?: string;
}

export class LoginRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongP@ssw0rd!' })
  @IsString()
  password!: string;

  @ApiPropertyOptional({ example: 'org_12345' })
  @IsOptional()
  @IsString()
  orgId?: string;
}

export class RefreshTokenRequestDto {
  @ApiProperty({ description: 'The refresh token string' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldSecretP@ss123' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ example: 'NewSecretP@ss123' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'usuario@empresa.com' })
  @IsEmail()
  email!: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty({ example: '4f7b2c9a...' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'NovaSenhaForte123!' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @ApiPropertyOptional({ example: 'john.doe@empresa.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @ApiPropertyOptional({ example: '+55 11 99999-8888' })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional({ example: 'Diretor Comercial' })
  @IsOptional()
  @IsString()
  jobTitle?: string | null;

  @ApiPropertyOptional({ example: 'Especialista em vendas B2B' })
  @IsOptional()
  @IsString()
  bio?: string | null;

  @ApiPropertyOptional({ example: 'pt' })
  @IsOptional()
  @IsString()
  language?: string | null;

  @ApiPropertyOptional({ example: 'America/Sao_Paulo' })
  @IsOptional()
  @IsString()
  timezone?: string | null;
}


