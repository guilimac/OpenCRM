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
