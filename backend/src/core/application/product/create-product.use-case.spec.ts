import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProductUseCase } from './create-product.use-case.js';
import { Product } from '../../domain/product/entities/product.entity.js';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let productRepo: any;

  beforeEach(() => {
    productRepo = {
      findByCode: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new CreateProductUseCase(productRepo);
  });

  it('should successfully create a new product', async () => {
    const result = await useCase.execute({
      orgId: 'org-1',
      code: 'PRD-01',
      name: 'Plano Premium',
      category: 'SOFTWARE',
      unitPrice: 299,
      unit: 'mês',
    });

    expect(result.isSuccess).toBe(true);
    const product = result.getValue();
    expect(product.code).toBe('PRD-01');
    expect(product.name).toBe('Plano Premium');
    expect(productRepo.save).toHaveBeenCalled();
  });

  it('should fail if product code already exists', async () => {
    productRepo.findByCode.mockResolvedValue(
      Product.create(
        {
          orgId: 'org-1',
          code: 'PRD-01',
          name: 'Existente',
          category: 'PRODUTO',
          unitPrice: 100,
          unit: 'un',
          currency: 'BRL',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        'existing-id',
      ).getValue(),
    );

    const result = await useCase.execute({
      orgId: 'org-1',
      code: 'PRD-01',
      name: 'Novo Produto',
      unitPrice: 50,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('already exists');
    expect(productRepo.save).not.toHaveBeenCalled();
  });
});
