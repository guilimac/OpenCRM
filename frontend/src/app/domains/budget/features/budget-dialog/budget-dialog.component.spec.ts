import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BudgetDialogComponent } from './budget-dialog.component';
import { CustomerApiService } from '../../../customer/services/customer-api.service';
import { OpportunityApiService } from '../../../opportunity/services/opportunity-api.service';
import { ProductApiService } from '../../../product/services/product-api.service';

describe('BudgetDialogComponent', () => {
  let component: BudgetDialogComponent;
  let fixture: ComponentFixture<BudgetDialogComponent>;
  let mockDialogRef: any;
  let mockCustomerApi: any;
  let mockOpportunityApi: any;
  let mockProductApi: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn(),
    };

    mockCustomerApi = {
      list: vi.fn().mockReturnValue(of({ data: [{ id: 'c-1', companyName: 'Empresa A' }] })),
    };

    mockOpportunityApi = {
      list: vi.fn().mockReturnValue(of([{ id: 'opp-1', title: 'Oportunidade A' }])),
    };

    mockProductApi = {
      list: vi.fn().mockReturnValue(
        of([
          {
            id: 'p-1',
            code: 'PRD-01',
            name: 'Produto Teste',
            unitPrice: 200,
          },
        ]),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [BudgetDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: CustomerApiService, useValue: mockCustomerApi },
        { provide: OpportunityApiService, useValue: mockOpportunityApi },
        { provide: ProductApiService, useValue: mockProductApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with 1 empty item and calculate item total', () => {
    expect(component.itemsArray.length).toBe(1);

    component.itemsArray.at(0).patchValue({
      description: 'Item Teste',
      quantity: 2,
      unitPrice: 100,
      discountPercent: 10,
    });

    expect(component.getItemTotal(0)).toBe(180); // 200 - 10%
    expect(component.computedSubtotal()).toBe(180);
    expect(component.computedNetTotal()).toBe(180);
  });

  it('should auto-populate description and price when product is selected', () => {
    component.onProductSelected(0, 'p-1');
    const group = component.itemsArray.at(0);
    expect(group.get('description')?.value).toBe('Produto Teste');
    expect(group.get('unitPrice')?.value).toBe(200);
  });

  it('should add and remove items', () => {
    component.addItem();
    expect(component.itemsArray.length).toBe(2);

    component.removeItem(0);
    expect(component.itemsArray.length).toBe(1);
  });
});
