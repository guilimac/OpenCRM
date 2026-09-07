import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY_PORT,
  type IProductRepository,
} from '../../domain/product/product.repository.port.js';
import { Result } from '../../domain/common/result.js';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(orgId: string, id: string): Promise<Result<void>> {
    const product = await this.productRepository.findById(orgId, id);
    if (!product) {
      return Result.fail<void>('Product not found');
    }

    await this.productRepository.delete(orgId, id);
    return Result.ok<void>();
  }
}
