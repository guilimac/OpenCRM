import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { EmailAttachmentDto } from '../../customer/dto/customer.dto.js';

export class CreateCustomerListDto {
  @ApiProperty({ example: 'Clientes VIP e Contas Estratégicas' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'Lista prioritária para comunicação institucional e novidades' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['cust-uuid-1', 'cust-uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customerIds?: string[];
}

export class SendMassEmailDto {
  @ApiProperty({ example: 'Novidades exclusivas para a {{companyName}}' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({
    example:
      'Olá {{contactName}},\n\nPreparamos uma condição especial exclusiva para a {{companyName}} neste mês.\n\nAtenciosamente,\nEquipe OpenCRM',
  })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({ type: [EmailAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachmentDto)
  attachments?: EmailAttachmentDto[];
}
