import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { type AccessTokenPayload } from '../../../../../core/application/common/ports/token.port.js';
import { GetComboboxOptionsUseCase } from '../../../../../core/application/settings/get-combobox-options.use-case.js';
import { SaveComboboxOptionUseCase } from '../../../../../core/application/settings/save-combobox-option.use-case.js';
import { DeleteComboboxOptionUseCase } from '../../../../../core/application/settings/delete-combobox-option.use-case.js';
import { ResetComboboxOptionsUseCase } from '../../../../../core/application/settings/reset-combobox-options.use-case.js';
import {
  ComboboxCategory,
  isValidComboboxCategory,
} from '../../../../../core/domain/settings/value-objects/combobox-category.vo.js';
import {
  CreateComboboxOptionDto,
  UpdateComboboxOptionDto,
} from './dto/combobox-setting.dto.js';

@ApiTags('Settings & Combobox Options')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'settings/comboboxes', version: '1' })
export class ComboboxSettingController {
  constructor(
    private readonly getComboboxOptionsUseCase: GetComboboxOptionsUseCase,
    private readonly saveComboboxOptionUseCase: SaveComboboxOptionUseCase,
    private readonly deleteComboboxOptionUseCase: DeleteComboboxOptionUseCase,
    private readonly resetComboboxOptionsUseCase: ResetComboboxOptionsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all combobox options for organization' })
  @ApiResponse({ status: 200, description: 'All combobox options' })
  async listAll(
    @CurrentUser() user: AccessTokenPayload,
    @Query('category') category?: string,
  ) {
    let catEnum: ComboboxCategory | undefined;
    if (category) {
      if (!isValidComboboxCategory(category)) {
        throw new BadRequestException(`Invalid combobox category: ${category}`);
      }
      catEnum = category;
    }

    const result = await this.getComboboxOptionsUseCase.execute({
      orgId: user.orgId,
      category: catEnum,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return result.getValue().map((opt) => ({
      id: opt.id,
      category: opt.category,
      value: opt.value,
      label: opt.label,
      orderIndex: opt.orderIndex,
      isDefault: opt.isDefault,
      isActive: opt.isActive,
      createdAt: opt.createdAt,
      updatedAt: opt.updatedAt,
    }));
  }

  @Get(':category')
  @ApiOperation({ summary: 'List combobox options for a single category' })
  @ApiResponse({ status: 200, description: 'Combobox options for category' })
  async listByCategory(
    @CurrentUser() user: AccessTokenPayload,
    @Param('category') category: string,
  ) {
    if (!isValidComboboxCategory(category)) {
      throw new BadRequestException(`Invalid combobox category: ${category}`);
    }

    const result = await this.getComboboxOptionsUseCase.execute({
      orgId: user.orgId,
      category,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return result.getValue().map((opt) => ({
      id: opt.id,
      category: opt.category,
      value: opt.value,
      label: opt.label,
      orderIndex: opt.orderIndex,
      isDefault: opt.isDefault,
      isActive: opt.isActive,
      createdAt: opt.createdAt,
      updatedAt: opt.updatedAt,
    }));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new combobox option' })
  @ApiResponse({ status: 201, description: 'Option created' })
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateComboboxOptionDto,
  ) {
    const result = await this.saveComboboxOptionUseCase.execute({
      orgId: user.orgId,
      category: dto.category,
      value: dto.value,
      label: dto.label,
      orderIndex: dto.orderIndex,
      isActive: dto.isActive,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    const opt = result.getValue();
    return {
      id: opt.id,
      category: opt.category,
      value: opt.value,
      label: opt.label,
      orderIndex: opt.orderIndex,
      isDefault: opt.isDefault,
      isActive: opt.isActive,
      createdAt: opt.createdAt,
      updatedAt: opt.updatedAt,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing combobox option' })
  @ApiResponse({ status: 200, description: 'Option updated' })
  async update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateComboboxOptionDto,
  ) {
    const result = await this.saveComboboxOptionUseCase.execute({
      orgId: user.orgId,
      id,
      category: '' as any, // Not changed on update
      value: '', // Not changed on update
      label: dto.label ?? '',
      orderIndex: dto.orderIndex,
      isActive: dto.isActive,
    });

    if (result.isFailure) {
      if (result.error?.includes('not found')) {
        throw new NotFoundException(result.error);
      }
      throw new BadRequestException(result.error);
    }

    const opt = result.getValue();
    return {
      id: opt.id,
      category: opt.category,
      value: opt.value,
      label: opt.label,
      orderIndex: opt.orderIndex,
      isDefault: opt.isDefault,
      isActive: opt.isActive,
      createdAt: opt.createdAt,
      updatedAt: opt.updatedAt,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a combobox option' })
  @ApiResponse({ status: 200, description: 'Option deleted' })
  async delete(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ) {
    const result = await this.deleteComboboxOptionUseCase.execute({
      orgId: user.orgId,
      id,
    });

    if (result.isFailure) {
      if (result.error?.includes('not found')) {
        throw new NotFoundException(result.error);
      }
      throw new BadRequestException(result.error);
    }

    return { success: true };
  }

  @Post('reset/:category')
  @ApiOperation({ summary: 'Reset a category to default options' })
  @ApiResponse({ status: 200, description: 'Category options reset to defaults' })
  async resetCategory(
    @CurrentUser() user: AccessTokenPayload,
    @Param('category') category: string,
  ) {
    if (!isValidComboboxCategory(category)) {
      throw new BadRequestException(`Invalid combobox category: ${category}`);
    }

    const result = await this.resetComboboxOptionsUseCase.execute({
      orgId: user.orgId,
      category,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return result.getValue().map((opt) => ({
      id: opt.id,
      category: opt.category,
      value: opt.value,
      label: opt.label,
      orderIndex: opt.orderIndex,
      isDefault: opt.isDefault,
      isActive: opt.isActive,
      createdAt: opt.createdAt,
      updatedAt: opt.updatedAt,
    }));
  }
}
