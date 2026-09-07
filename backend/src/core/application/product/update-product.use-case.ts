import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY_PORT,
  type IProductRepository,
} from '../../domain/product/product.repository.port.js';
import { Product } from '../../domain/product/entities/product.entity.js';
import { Result } from '../../domain/common/result.js';

export interface UpdateProductCommand {
  orgId: string;
  id: string;
  code?: string;
  name?: string;
  description?: string;
  category?: string;
  unitPrice?: number;
  unit?: string;
  currency?: string;
  isActive?: boolean;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: UpdateProductCommand): Promise<Result<Product>> {
    const product = await this.productRepository.findById(command.orgId, command.id);
    if (!product) {
      return Result.fail<Product>('Product not found');
    }

    if (command.code && command.code.trim().toUpperCase() !== product.code) {
      const existing = await this.productRepository.findByCode(command.orgId, command.code);
      if (existing) {
        return Result.fail<Product>(`Product code ${command.code} is already in use`);
      }
    }

    const updateRes = product.update({
      code: command.code,
      name: command.name,
      description: command.description,
      category: command.category,
      unitPrice: command.unitPrice,
      unit: command.unit,
      currency: command.currency,
      isActive: command.isActive,
    });

    if (updateRes.isFailure) {
      return Result.fail<Product>(updateRes.error!);
    }

    await this.productRepository.update(product);
    return Result.ok<Product>(product);
  }
}
