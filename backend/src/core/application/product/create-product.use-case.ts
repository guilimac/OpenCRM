import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  PRODUCT_REPOSITORY_PORT,
  type IProductRepository,
} from '../../domain/product/product.repository.port.js';
import { Product } from '../../domain/product/entities/product.entity.js';
import { Result } from '../../domain/common/result.js';

export interface CreateProductCommand {
  orgId: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  unitPrice: number;
  unit?: string;
  currency?: string;
  isActive?: boolean;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<Result<Product>> {
    if (!command.orgId) {
      return Result.fail<Product>('Organization ID is required');
    }
    if (!command.code || command.code.trim().length === 0) {
      return Result.fail<Product>('Product code is required');
    }
    if (!command.name || command.name.trim().length === 0) {
      return Result.fail<Product>('Product name is required');
    }

    const existing = await this.productRepository.findByCode(command.orgId, command.code);
    if (existing) {
      return Result.fail<Product>(`Product with code ${command.code} already exists`);
    }

    const id = uuidv4();
    const productResult = Product.create(
      {
        orgId: command.orgId,
        code: command.code,
        name: command.name,
        description: command.description,
        category: command.category || 'PRODUTO',
        unitPrice: command.unitPrice,
        unit: command.unit || 'un',
        currency: command.currency || 'BRL',
        isActive: command.isActive !== undefined ? command.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );

    if (productResult.isFailure) {
      return Result.fail<Product>(productResult.error!);
    }

    const product = productResult.getValue();
    await this.productRepository.save(product);
    return Result.ok<Product>(product);
  }
}
