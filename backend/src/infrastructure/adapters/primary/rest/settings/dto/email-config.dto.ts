import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { type EmailProviderType } from '../../../../../../core/domain/settings/entities/email-config.entity.js';

export class SaveEmailConfigDto {
  @ApiProperty({ enum: ['MAILGUN', 'SMTP'], example: 'MAILGUN' })
  @IsEnum(['MAILGUN', 'SMTP'])
  provider!: EmailProviderType;

  @ApiPropertyOptional({ example: 'key-1234567890' })
  @IsOptional()
  @IsString()
  mailgunApiKey?: string | null;

  @ApiPropertyOptional({ example: 'mg.mycompany.com' })
  @IsOptional()
  @IsString()
  mailgunDomain?: string | null;

  @ApiPropertyOptional({ example: 'api.mailgun.net' })
  @IsOptional()
  @IsString()
  mailgunHost?: string | null;

  @ApiPropertyOptional({ example: 'smtp.gmail.com' })
  @IsOptional()
  @IsString()
  smtpHost?: string | null;

  @ApiPropertyOptional({ example: 587 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort?: number | null;

  @ApiPropertyOptional({ example: 'user@gmail.com' })
  @IsOptional()
  @IsString()
  smtpUser?: string | null;

  @ApiPropertyOptional({ example: 'app-password' })
  @IsOptional()
  @IsString()
  smtpPassword?: string | null;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean;

  @ApiProperty({ example: 'sales@mycompany.com' })
  @IsEmail()
  @IsNotEmpty()
  fromEmail!: string;

  @ApiProperty({ example: 'MyCompany Sales' })
  @IsString()
  @IsNotEmpty()
  fromName!: string;

  @ApiPropertyOptional({ example: 'support@mycompany.com' })
  @IsOptional()
  @IsString()
  replyTo?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SendTestEmailDto {
  @ApiProperty({ example: 'target@example.com' })
  @IsEmail()
  @IsNotEmpty()
  targetEmail!: string;

  @ApiPropertyOptional({ enum: ['MAILGUN', 'SMTP'], example: 'MAILGUN' })
  @IsOptional()
  @IsEnum(['MAILGUN', 'SMTP'])
  provider?: EmailProviderType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mailgunApiKey?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mailgunDomain?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mailgunHost?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  smtpHost?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  smtpPort?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  smtpUser?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  smtpPassword?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromName?: string;
}
