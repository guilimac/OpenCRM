import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ComboboxCategory } from '../../../../../../core/domain/settings/value-objects/combobox-category.vo.js';

export class CreateComboboxOptionDto {
  @ApiProperty({ enum: ComboboxCategory, example: ComboboxCategory.PRODUCT_CATEGORY })
  @IsEnum(ComboboxCategory)
  category!: ComboboxCategory;

  @ApiProperty({ example: 'TREINAMENTO' })
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiProperty({ example: 'Treinamento & Capacitação' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateComboboxOptionDto {
  @ApiPropertyOptional({ example: 'Treinamento Corporativo Avançado' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  label?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
