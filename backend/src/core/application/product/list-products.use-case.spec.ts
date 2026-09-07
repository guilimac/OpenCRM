import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListProductsUseCase } from './list-products.use-case.js';
import { Product } from '../../domain/product/entities/product.entity.js';

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;
  let productRepo: any;

  const mockProduct = Product.create(
    {
      orgId: 'org-1',
      code: 'PRD-01',
      name: 'Licença CRM',
      category: 'SOFTWARE',
      unitPrice: 150,
      unit: 'mês',
      currency: 'BRL',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'p-1',
  ).getValue();

  beforeEach(() => {
    productRepo = {
      findAllInOrg: vi.fn().mockResolvedValue([mockProduct]),
    };
    useCase = new ListProductsUseCase(productRepo);
  });

  it('should return products list successfully', async () => {
    const result = await useCase.execute('org-1');
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().length).toBe(1);
    expect(productRepo.findAllInOrg).toHaveBeenCalledWith('org-1', undefined);
  });
});
