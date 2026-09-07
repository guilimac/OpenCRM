import { describe, it, expect } from 'vitest';
import { Product } from './product.entity.js';

describe('Product Entity', () => {
  it('should successfully create a valid product', () => {
    const result = Product.create(
      {
        orgId: 'org-1',
        code: 'prd-100',
        name: 'Licença Enterprise',
        category: 'SOFTWARE',
        unitPrice: 199.9,
        unit: 'mês',
        currency: 'brl',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'prod-1',
    );

    expect(result.isSuccess).toBe(true);
    const product = result.getValue();
    expect(product.id).toBe('prod-1');
    expect(product.code).toBe('PRD-100'); // Uppercase normalized
    expect(product.currency).toBe('BRL');
    expect(product.unitPrice).toBe(199.9);
    expect(product.isActive).toBe(true);
  });

  it('should fail to create product if code is missing', () => {
    const result = Product.create(
      {
        orgId: 'org-1',
        code: '',
        name: 'Produto sem código',
        category: 'OUTROS',
        unitPrice: 50,
        unit: 'un',
        currency: 'BRL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'prod-2',
    );

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Product code/SKU is required');
  });

  it('should update product fields properly', () => {
    const product = Product.create(
      {
        orgId: 'org-1',
        code: 'SRV-01',
        name: 'Consultoria Básica',
        category: 'SERVICO',
        unitPrice: 100,
        unit: 'hora',
        currency: 'BRL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'prod-3',
    ).getValue();

    const updateRes = product.update({
      name: 'Consultoria Avançada',
      unitPrice: 150,
    });

    expect(updateRes.isSuccess).toBe(true);
    expect(product.name).toBe('Consultoria Avançada');
    expect(product.unitPrice).toBe(150);
  });
});
