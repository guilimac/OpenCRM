import { Product } from '../../../../../../core/domain/product/entities/product.entity.js';
import { ProductOrmEntity } from '../entities/product.orm-entity.js';

export class ProductMapper {
  static toDomain(orm: ProductOrmEntity): Product {
    const result = Product.create(
      {
        orgId: orm.orgId,
        code: orm.code,
        name: orm.name,
        description: orm.description,
        category: orm.category,
        unitPrice: Number(orm.unitPrice),
        unit: orm.unit,
        currency: orm.currency,
        isActive: orm.isActive,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
      },
      orm.id,
    );

    if (result.isFailure) {
      throw new Error(`Failed to map ProductOrmEntity to domain: ${result.error}`);
    }

    return result.getValue();
  }

  static toOrm(domain: Product): ProductOrmEntity {
    const orm = new ProductOrmEntity();
    orm.id = domain.id;
    orm.orgId = domain.orgId;
    orm.code = domain.code;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.category = domain.category;
    orm.unitPrice = domain.unitPrice;
    orm.unit = domain.unit;
    orm.currency = domain.currency;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
