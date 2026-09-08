import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ComboboxSettingsComponent } from './combobox-settings.component';
import { ComboboxOptionsService } from '../../../../core/services/combobox-options.service';
import { ComboboxCategory } from '../../models/combobox-settings.model';
import { signal } from '@angular/core';

describe('ComboboxSettingsComponent', () => {
  let component: ComboboxSettingsComponent;
  let fixture: ComponentFixture<ComboboxSettingsComponent>;
  let comboboxServiceMock: any;

  beforeEach(async () => {
    comboboxServiceMock = {
      loadOptions: vi.fn(),
      getOptions: vi.fn().mockReturnValue(
        signal([
          {
            id: '1',
            category: ComboboxCategory.CUSTOMER_INDUSTRY,
            value: 'Tecnologia',
            label: 'Tecnologia & Software',
            orderIndex: 0,
            isDefault: true,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]),
      ),
      getAllOptions: vi.fn().mockReturnValue(
        signal([
          {
            id: '1',
            category: ComboboxCategory.CUSTOMER_INDUSTRY,
            value: 'Tecnologia',
            label: 'Tecnologia & Software',
            orderIndex: 0,
            isDefault: true,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]),
      ),
      createOption: vi.fn().mockReturnValue(of({})),
      updateOption: vi.fn().mockReturnValue(of({})),
      deleteOption: vi.fn().mockReturnValue(of({ success: true })),
      resetCategory: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [ComboboxSettingsComponent, NoopAnimationsModule],
      providers: [
        { provide: ComboboxOptionsService, useValue: comboboxServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComboboxSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load initial options', () => {
    expect(component).toBeTruthy();
    expect(comboboxServiceMock.loadOptions).toHaveBeenCalled();
  });

  it('should switch selected category', () => {
    component.selectCategory(ComboboxCategory.PRODUCT_CATEGORY);
    expect(component.selectedCategory()).toBe(ComboboxCategory.PRODUCT_CATEGORY);
  });
});
