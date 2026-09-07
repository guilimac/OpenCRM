import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  type IProductRepository,
  type ProductFilterOptions,
} from '../../../../../../core/domain/product/product.repository.port.js';
import { Product } from '../../../../../../core/domain/product/entities/product.entity.js';
import { ProductOrmEntity } from '../entities/product.orm-entity.js';
import { ProductMapper } from '../mappers/product.mapper.js';

@Injectable()
export class TypeOrmProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repo: Repository<ProductOrmEntity>,
  ) {}

  async findById(orgId: string, id: string): Promise<Product | null> {
    const orm = await this.repo.findOne({ where: { orgId, id } });
    return orm ? ProductMapper.toDomain(orm) : null;
  }

  async findByCode(orgId: string, code: string): Promise<Product | null> {
    const orm = await this.repo.findOne({
      where: { orgId, code: code.trim().toUpperCase() },
    });
    return orm ? ProductMapper.toDomain(orm) : null;
  }

  async findAllInOrg(orgId: string, options?: ProductFilterOptions): Promise<Product[]> {
    const qb = this.repo.createQueryBuilder('p').where('p.orgId = :orgId', { orgId });

    if (options?.category) {
      qb.andWhere('p.category = :cat', { cat: options.category });
    }

    if (options?.isActive !== undefined) {
      qb.andWhere('p.isActive = :isActive', { isActive: options.isActive });
    }

    if (options?.search) {
      const s = `%${options.search}%`;
      qb.andWhere('(p.name LIKE :search OR p.code LIKE :search OR p.description LIKE :search)', {
        search: s,
      });
    }

    qb.orderBy('p.name', 'ASC');

    const orms = await qb.getMany();
    return orms.map((orm) => ProductMapper.toDomain(orm));
  }

  async save(product: Product): Promise<void> {
    const orm = ProductMapper.toOrm(product);
    await this.repo.save(orm);
  }

  async update(product: Product): Promise<void> {
    const orm = ProductMapper.toOrm(product);
    await this.repo.save(orm);
  }

  async delete(orgId: string, id: string): Promise<void> {
    await this.repo.delete({ orgId, id });
  }
}
