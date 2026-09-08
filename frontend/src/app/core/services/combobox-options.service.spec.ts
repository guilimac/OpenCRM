import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ComboboxOptionsService } from './combobox-options.service';
import { ComboboxSettingsApiService } from '../../domains/settings/services/combobox-settings-api.service';
import {
  ComboboxCategory,
  ComboboxOptionItem,
} from '../../domains/settings/models/combobox-settings.model';

describe('ComboboxOptionsService', () => {
  let service: ComboboxOptionsService;
  let apiMock: any;

  const mockOptions: ComboboxOptionItem[] = [
    {
      id: '1',
      category: ComboboxCategory.PRODUCT_CATEGORY,
      value: 'SOFTWARE',
      label: 'Software / SaaS',
      orderIndex: 0,
      isDefault: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      category: ComboboxCategory.PRODUCT_CATEGORY,
      value: 'LEGACY',
      label: 'Antigo (Desativado)',
      orderIndex: 1,
      isDefault: false,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    apiMock = {
      getAll: vi.fn().mockReturnValue(of(mockOptions)),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      resetCategory: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ComboboxOptionsService,
        { provide: ComboboxSettingsApiService, useValue: apiMock },
      ],
    });

    service = TestBed.inject(ComboboxOptionsService);
  });

  it('should load options and filter active options in getOptions', () => {
    service.loadOptions();
    expect(apiMock.getAll).toHaveBeenCalled();

    const activeOptions = service.getOptions(ComboboxCategory.PRODUCT_CATEGORY)();
    expect(activeOptions.length).toBe(1);
    expect(activeOptions[0].value).toBe('SOFTWARE');

    const allOptions = service.getAllOptions(ComboboxCategory.PRODUCT_CATEGORY)();
    expect(allOptions.length).toBe(2);
  });

  it('should add option and update signals reactively', () => {
    service.loadOptions();

    const newOption: ComboboxOptionItem = {
      id: '3',
      category: ComboboxCategory.PRODUCT_CATEGORY,
      value: 'HARDWARE',
      label: 'Hardware',
      orderIndex: 2,
      isDefault: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    apiMock.create.mockReturnValue(of(newOption));

    service.createOption({
      category: ComboboxCategory.PRODUCT_CATEGORY,
      value: 'HARDWARE',
      label: 'Hardware',
    }).subscribe();

    const activeOptions = service.getOptions(ComboboxCategory.PRODUCT_CATEGORY)();
    expect(activeOptions.length).toBe(2);
    expect(activeOptions.some((o) => o.value === 'HARDWARE')).toBe(true);
  });
});
