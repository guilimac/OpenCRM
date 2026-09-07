import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PRODUCT_REPOSITORY_PORT } from '../../core/domain/product/product.repository.port.js';
import { ProductOrmEntity } from '../adapters/secondary/persistence/mysql/entities/product.orm-entity.js';
import { TypeOrmProductRepository } from '../adapters/secondary/persistence/mysql/repositories/typeorm-product.repository.js';
import { CreateProductUseCase } from '../../core/application/product/create-product.use-case.js';
import { ListProductsUseCase } from '../../core/application/product/list-products.use-case.js';
import { UpdateProductUseCase } from '../../core/application/product/update-product.use-case.js';
import { DeleteProductUseCase } from '../../core/application/product/delete-product.use-case.js';
import { ProductController } from '../adapters/primary/rest/product/product.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY_PORT,
      useClass: TypeOrmProductRepository,
    },
    CreateProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
  ],
  exports: [PRODUCT_REPOSITORY_PORT],
})
export class ProductModule {}
