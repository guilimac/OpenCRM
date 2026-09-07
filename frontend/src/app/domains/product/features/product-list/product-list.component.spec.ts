import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ProductListComponent } from './product-list.component';
import { ProductApiService } from '../../services/product-api.service';
import { ProductItem } from '../../models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let mockProductApi: any;
  let mockDialog: any;
  let mockSnackBar: any;

  const mockProducts: ProductItem[] = [
    {
      id: 'p-1',
      code: 'PRD-01',
      name: 'Licença Cloud',
      category: 'SOFTWARE',
      unitPrice: 150,
      unit: 'mês',
      currency: 'BRL',
      isActive: true,
      createdAt: '2026-09-01',
      updatedAt: '2026-09-01',
    },
    {
      id: 'p-2',
      code: 'SRV-01',
      name: 'Consultoria',
      category: 'SERVICO',
      unitPrice: 200,
      unit: 'hora',
      currency: 'BRL',
      isActive: false,
      createdAt: '2026-09-02',
      updatedAt: '2026-09-02',
    },
  ];

  beforeEach(async () => {
    mockProductApi = {
      list: vi.fn().mockReturnValue(of(mockProducts)),
      create: vi.fn().mockReturnValue(of(mockProducts[0])),
      update: vi.fn().mockReturnValue(of(mockProducts[0])),
      delete: vi.fn().mockReturnValue(of({ success: true, message: 'OK' })),
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of(undefined)),
      }),
    };

    mockSnackBar = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: ProductApiService, useValue: mockProductApi },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load products on init and apply filters', () => {
    expect(mockProductApi.list).toHaveBeenCalled();
    expect(component.products().length).toBe(2);
    expect(component.filteredProducts().length).toBe(2);
  });

  it('should filter products by category', () => {
    component.selectedCategory = 'SOFTWARE';
    component.applyFilter();
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].code).toBe('PRD-01');
  });

  it('should filter products by search query', () => {
    component.searchQuery = 'Consultoria';
    component.applyFilter();
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].code).toBe('SRV-01');
  });
});
