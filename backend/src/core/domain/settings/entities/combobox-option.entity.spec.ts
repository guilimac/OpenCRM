import { describe, it, expect } from 'vitest';
import { ComboboxOption } from './combobox-option.entity.js';
import { ComboboxCategory } from '../value-objects/combobox-category.vo.js';

describe('ComboboxOption Entity', () => {
  it('should successfully create a valid ComboboxOption', () => {
    const result = ComboboxOption.create(
      {
        orgId: 'org-1',
        category: ComboboxCategory.PRODUCT_CATEGORY,
        value: 'HARDWARE',
        label: 'Hardware & Equipamentos',
        orderIndex: 3,
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'opt-1',
    );

    expect(result.isSuccess).toBe(true);
    const option = result.getValue();
    expect(option.id).toBe('opt-1');
    expect(option.orgId).toBe('org-1');
    expect(option.category).toBe(ComboboxCategory.PRODUCT_CATEGORY);
    expect(option.value).toBe('HARDWARE');
    expect(option.label).toBe('Hardware & Equipamentos');
    expect(option.orderIndex).toBe(3);
    expect(option.isDefault).toBe(false);
    expect(option.isActive).toBe(true);
  });

  it('should fail to create if orgId is missing', () => {
    const result = ComboboxOption.create(
      {
        orgId: '',
        category: ComboboxCategory.CUSTOMER_INDUSTRY,
        value: 'TECH',
        label: 'Tecnologia',
        orderIndex: 0,
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'opt-2',
    );

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Organization ID is required');
  });

  it('should fail to create if value is missing', () => {
    const result = ComboboxOption.create(
      {
        orgId: 'org-1',
        category: ComboboxCategory.CUSTOMER_INDUSTRY,
        value: '   ',
        label: 'Tecnologia',
        orderIndex: 0,
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'opt-3',
    );

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Option value is required');
  });

  it('should fail to create if label is missing', () => {
    const result = ComboboxOption.create(
      {
        orgId: 'org-1',
        category: ComboboxCategory.CUSTOMER_INDUSTRY,
        value: 'TECH',
        label: '   ',
        orderIndex: 0,
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'opt-4',
    );

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Option label is required');
  });

  it('should update label, orderIndex and isActive', () => {
    const option = ComboboxOption.create(
      {
        orgId: 'org-1',
        category: ComboboxCategory.PAYMENT_TERMS,
        value: '30_DIAS',
        label: '30 Dias',
        orderIndex: 1,
        isDefault: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'opt-5',
    ).getValue();

    const updateRes = option.update({
      label: 'Faturamento 30 Dias Líquidos',
      orderIndex: 5,
      isActive: false,
    });

    expect(updateRes.isSuccess).toBe(true);
    expect(option.label).toBe('Faturamento 30 Dias Líquidos');
    expect(option.orderIndex).toBe(5);
    expect(option.isActive).toBe(false);
  });

  it('should fail to update with empty label', () => {
    const option = ComboboxOption.create(
      {
        orgId: 'org-1',
        category: ComboboxCategory.PAYMENT_TERMS,
        value: '30_DIAS',
        label: '30 Dias',
        orderIndex: 1,
        isDefault: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'opt-6',
    ).getValue();

    const updateRes = option.update({
      label: '   ',
    });

    expect(updateRes.isFailure).toBe(true);
    expect(updateRes.error).toContain('Label cannot be empty');
  });
});
