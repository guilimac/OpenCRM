import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOpportunityRequestDto {
  @ApiProperty({ example: '3711917a-c0fa-4882-a12e-005f108203eb' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ example: 'Enterprise Cloud Migration Contract' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 85000.0 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ example: 'BRL', default: 'BRL' })
  @IsOptional()
  @IsString()
  currency?: string = 'BRL';

  @ApiPropertyOptional({ example: 1.0, default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  exchangeRateToBrl?: number = 1.0;

  @ApiPropertyOptional({
    enum: ['DISCOVERY', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'],
    default: 'DISCOVERY',
  })
  @IsOptional()
  @IsEnum(['DISCOVERY', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'])
  stage?: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  expectedCloseDate!: string;
}

export class UpdateOpportunityStageRequestDto {
  @ApiProperty({
    enum: ['DISCOVERY', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'],
  })
  @IsEnum(['DISCOVERY', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'])
  stage!: string;

  @ApiPropertyOptional({ example: 'Competitor undercut price by 20%' })
  @IsOptional()
  @IsString()
  lossReason?: string;
}
