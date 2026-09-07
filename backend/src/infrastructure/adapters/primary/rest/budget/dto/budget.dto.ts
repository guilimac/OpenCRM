import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateBudgetItemDto {
  @ApiPropertyOptional({ example: 'prod-uuid' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ example: 'Licença Software OpenCRM Enterprise' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @ApiProperty({ example: 1200.0 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ example: 10, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number = 0;
}

export class CreateBudgetDto {
  @ApiProperty({ example: 'Proposta Comercial - Solução CRM' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'customer-uuid' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiPropertyOptional({ example: 'opportunity-uuid' })
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  issueDate?: Date;

  @ApiPropertyOptional({ example: '2026-09-30' })
  @IsOptional()
  @IsDateString()
  validUntil?: Date;

  @ApiProperty({ type: [CreateBudgetItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetItemDto)
  items!: CreateBudgetItemDto[];

  @ApiPropertyOptional({ example: 100.0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number = 0;

  @ApiPropertyOptional({ example: 'BRL', default: 'BRL' })
  @IsOptional()
  @IsString()
  currency?: string = 'BRL';

  @ApiPropertyOptional({ example: '30 dias líquido ou 50% entrada + 50% entrega' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'Valores válidos por 30 dias a partir da data de emissão.' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBudgetStatusDto {
  @ApiProperty({
    enum: ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'],
    example: 'APPROVED',
  })
  @IsEnum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'])
  status!: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
}

export class BudgetQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiPropertyOptional({
    enum: ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'],
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
