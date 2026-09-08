import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetComboboxOptionsUseCase } from './get-combobox-options.use-case.js';
import { ComboboxCategory } from '../../domain/settings/value-objects/combobox-category.vo.js';
import { ComboboxOption } from '../../domain/settings/entities/combobox-option.entity.js';

describe('GetComboboxOptionsUseCase', () => {
  let useCase: GetComboboxOptionsUseCase;
  let repo: any;

  beforeEach(() => {
    repo = {
      countByCategory: vi.fn().mockResolvedValue(0),
      saveMany: vi.fn().mockResolvedValue(undefined),
      findByCategory: vi.fn().mockResolvedValue([]),
      findAllByOrg: vi.fn().mockResolvedValue([]),
    };
    useCase = new GetComboboxOptionsUseCase(repo);
  });

  it('should seed default options if count is 0 for category', async () => {
    const dummyOption = ComboboxOption.create(
      {
        orgId: 'org-1',
        category: ComboboxCategory.CUSTOMER_INDUSTRY,
        value: 'Tecnologia',
        label: 'Tecnologia & Software',
        orderIndex: 0,
        isDefault: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'id-1',
    ).getValue();

    repo.findByCategory.mockResolvedValue([dummyOption]);

    const result = await useCase.execute({
      orgId: 'org-1',
      category: ComboboxCategory.CUSTOMER_INDUSTRY,
    });

    expect(result.isSuccess).toBe(true);
    expect(repo.countByCategory).toHaveBeenCalledWith('org-1', ComboboxCategory.CUSTOMER_INDUSTRY);
    expect(repo.saveMany).toHaveBeenCalled();
    expect(result.getValue().length).toBe(1);
  });

  it('should not seed if options already exist', async () => {
    repo.countByCategory.mockResolvedValue(5);
    repo.findByCategory.mockResolvedValue([
      ComboboxOption.create(
        {
          orgId: 'org-1',
          category: ComboboxCategory.PRODUCT_CATEGORY,
          value: 'CUSTOM',
          label: 'Custom Category',
          orderIndex: 0,
          isDefault: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        'id-custom',
      ).getValue(),
    ]);

    const result = await useCase.execute({
      orgId: 'org-1',
      category: ComboboxCategory.PRODUCT_CATEGORY,
    });

    expect(result.isSuccess).toBe(true);
    expect(repo.saveMany).not.toHaveBeenCalled();
    expect(result.getValue()[0].value).toBe('CUSTOM');
  });

  it('should fail if orgId is missing', async () => {
    const result = await useCase.execute({
      orgId: '',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Organization ID is required');
  });
});
