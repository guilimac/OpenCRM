import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Alice' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ example: 'VP of Procurement' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'alice@acme.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+55 11 99999-9999' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateCustomerRequestDto {
  @ApiProperty({ example: 'Acme Brasil Soluções Ltda' })
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @ApiPropertyOptional({ example: 'Information Technology' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ example: 'https://acme.com.br' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    enum: ['LEAD', 'PROSPECT', 'ACTIVE_CUSTOMER', 'CHURNED', 'INACTIVE'],
    default: 'LEAD',
  })
  @IsOptional()
  @IsEnum(['LEAD', 'PROSPECT', 'ACTIVE_CUSTOMER', 'CHURNED', 'INACTIVE'])
  status?: string;

  @ApiPropertyOptional({ example: 1250000.0 })
  @IsOptional()
  @IsNumber()
  annualRevenue?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt()
  employeeCount?: number;

  @ApiPropertyOptional({ type: CreateContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateContactDto)
  primaryContact?: CreateContactDto;
}

export class CustomerQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'Acme' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['LEAD', 'PROSPECT', 'ACTIVE_CUSTOMER', 'CHURNED', 'INACTIVE'],
  })
  @IsOptional()
  @IsString()
  status?: string;
}
