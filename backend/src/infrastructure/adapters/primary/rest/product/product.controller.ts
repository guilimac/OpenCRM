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
import { CreateProductUseCase } from '../../../../../core/application/product/create-product.use-case.js';
import { ListProductsUseCase } from '../../../../../core/application/product/list-products.use-case.js';
import { UpdateProductUseCase } from '../../../../../core/application/product/update-product.use-case.js';
import { DeleteProductUseCase } from '../../../../../core/application/product/delete-product.use-case.js';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto.js';

@ApiTags('Products & Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'products', version: '1' })
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new product or service' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateProductDto,
  ) {
    const result = await this.createProductUseCase.execute({
      ...dto,
      orgId: user.orgId,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    const p = result.getValue();
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      category: p.category,
      unitPrice: p.unitPrice,
      unit: p.unit,
      currency: p.currency,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List products and services in the organization catalog' })
  async list(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: ProductQueryDto,
  ) {
    const result = await this.listProductsUseCase.execute(user.orgId, {
      search: query.search,
      category: query.category,
      isActive: query.isActive !== undefined ? String(query.isActive) === 'true' : undefined,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return result.getValue().map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      category: p.category,
      unitPrice: p.unitPrice,
      unit: p.unit,
      currency: p.currency,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing product or service' })
  async update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const result = await this.updateProductUseCase.execute({
      ...dto,
      orgId: user.orgId,
      id,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    const p = result.getValue();
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      category: p.category,
      unitPrice: p.unitPrice,
      unit: p.unit,
      currency: p.currency,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product or service' })
  async delete(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ) {
    const result = await this.deleteProductUseCase.execute(user.orgId, id);
    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }
    return { success: true, message: 'Produto removido com sucesso' };
  }
}
