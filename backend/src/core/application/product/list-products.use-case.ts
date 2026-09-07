import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY_PORT,
  type IProductRepository,
  type ProductFilterOptions,
} from '../../domain/product/product.repository.port.js';
import { Product } from '../../domain/product/entities/product.entity.js';
import { Result } from '../../domain/common/result.js';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(orgId: string, options?: ProductFilterOptions): Promise<Result<Product[]>> {
    if (!orgId) {
      return Result.fail<Product[]>('Organization ID is required');
    }

    const products = await this.productRepository.findAllInOrg(orgId, options);
    return Result.ok<Product[]>(products);
  }
}
