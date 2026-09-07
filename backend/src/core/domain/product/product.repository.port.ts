import { Product } from './entities/product.entity.js';

export const PRODUCT_REPOSITORY_PORT = Symbol('PRODUCT_REPOSITORY_PORT');

export interface ProductFilterOptions {
  search?: string;
  category?: string;
  isActive?: boolean;
}

export interface IProductRepository {
  findById(orgId: string, id: string): Promise<Product | null>;
  findByCode(orgId: string, code: string): Promise<Product | null>;
  findAllInOrg(orgId: string, options?: ProductFilterOptions): Promise<Product[]>;
  save(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  delete(orgId: string, id: string): Promise<void>;
}
