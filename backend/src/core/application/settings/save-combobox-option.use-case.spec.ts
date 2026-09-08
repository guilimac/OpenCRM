import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveComboboxOptionUseCase } from './save-combobox-option.use-case.js';
import { ComboboxCategory } from '../../domain/settings/value-objects/combobox-category.vo.js';
import { ComboboxOption } from '../../domain/settings/entities/combobox-option.entity.js';

describe('SaveComboboxOptionUseCase', () => {
  let useCase: SaveComboboxOptionUseCase;
  let repo: any;

  beforeEach(() => {
    repo = {
      findById: vi.fn().mockResolvedValue(null),
      findByValue: vi.fn().mockResolvedValue(null),
      countByCategory: vi.fn().mockResolvedValue(2),
      save: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new SaveComboboxOptionUseCase(repo);
  });

  it('should successfully create a new option', async () => {
    const result = await useCase.execute({
      orgId: 'org-1',
      category: ComboboxCategory.PAYMENT_TERMS,
      value: '45_DIAS',
      label: '45 Dias no Boleto',
    });

    expect(result.isSuccess).toBe(true);
    const option = result.getValue();
    expect(option.value).toBe('45_DIAS');
    expect(option.label).toBe('45 Dias no Boleto');
    expect(option.orderIndex).toBe(2);
    expect(repo.save).toHaveBeenCalled();
  });

  it('should fail if duplicate value exists', async () => {
    repo.findByValue.mockResolvedValue(
      ComboboxOption.create(
        {
          orgId: 'org-1',
          category: ComboboxCategory.PAYMENT_TERMS,
          value: '30_DIAS',
          label: '30 Dias',
          orderIndex: 0,
          isDefault: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        'existing-id',
      ).getValue(),
    );

    const result = await useCase.execute({
      orgId: 'org-1',
      category: ComboboxCategory.PAYMENT_TERMS,
      value: '30_DIAS',
      label: 'Novo 30 dias',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('already exists in this category');
  });

  it('should successfully update existing option', async () => {
    const existing = ComboboxOption.create(
      {
        orgId: 'org-1',
        category: ComboboxCategory.PAYMENT_TERMS,
        value: '30_DIAS',
        label: '30 Dias',
        orderIndex: 0,
        isDefault: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'existing-id',
    ).getValue();

    repo.findById.mockResolvedValue(existing);

    const result = await useCase.execute({
      orgId: 'org-1',
      id: 'existing-id',
      category: ComboboxCategory.PAYMENT_TERMS,
      value: '30_DIAS',
      label: '30 Dias Líquidos Atualizado',
      isActive: false,
    });

    expect(result.isSuccess).toBe(true);
    expect(existing.label).toBe('30 Dias Líquidos Atualizado');
    expect(existing.isActive).toBe(false);
    expect(repo.save).toHaveBeenCalledWith(existing);
  });
});
