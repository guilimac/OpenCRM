import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BudgetListComponent } from './budget-list.component';
import { BudgetApiService } from '../../services/budget-api.service';
import { CustomerApiService } from '../../../customer/services/customer-api.service';
import { BudgetDetail } from '../../models/budget.model';

describe('BudgetListComponent', () => {
  let component: BudgetListComponent;
  let fixture: ComponentFixture<BudgetListComponent>;
  let mockBudgetApi: any;
  let mockCustomerApi: any;
  let mockDialog: any;
  let mockSnackBar: any;

  const mockBudgets: BudgetDetail[] = [
    {
      id: 'b-1',
      budgetNumber: 'ORC-2026-0001',
      title: 'Proposta Modernização',
      customerId: 'cust-1',
      status: 'APPROVED',
      issueDate: '2026-09-01',
      validUntil: '2026-09-30',
      subtotal: 5000,
      discountAmount: 500,
      totalAmount: 4500,
      currency: 'BRL',
      items: [],
      createdAt: '2026-09-01',
      updatedAt: '2026-09-01',
    },
    {
      id: 'b-2',
      budgetNumber: 'ORC-2026-0002',
      title: 'Proposta Suporte',
      customerId: 'cust-1',
      status: 'SENT',
      issueDate: '2026-09-02',
      validUntil: '2026-09-30',
      subtotal: 2000,
      discountAmount: 0,
      totalAmount: 2000,
      currency: 'BRL',
      items: [],
      createdAt: '2026-09-02',
      updatedAt: '2026-09-02',
    },
  ];

  beforeEach(async () => {
    mockBudgetApi = {
      list: vi.fn().mockReturnValue(of(mockBudgets)),
      create: vi.fn().mockReturnValue(of(mockBudgets[0])),
      updateStatus: vi.fn().mockReturnValue(of(mockBudgets[0])),
      delete: vi.fn().mockReturnValue(of({ success: true, message: 'OK' })),
    };

    mockCustomerApi = {
      list: vi.fn().mockReturnValue(of({ data: [{ id: 'cust-1', companyName: 'Empresa Teste' }] })),
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
      imports: [BudgetListComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: BudgetApiService, useValue: mockBudgetApi },
        { provide: CustomerApiService, useValue: mockCustomerApi },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load budgets and calculate metrics properly', () => {
    expect(mockBudgetApi.list).toHaveBeenCalled();
    expect(component.budgets().length).toBe(2);
    expect(component.totalApprovedValue()).toBe(4500);
    expect(component.approvedCount()).toBe(1);
    expect(component.totalInNegotiationValue()).toBe(2000);
    expect(component.inNegotiationCount()).toBe(1);
    expect(component.conversionRate()).toBe(50); // 1 out of 2 = 50%
  });

  it('should filter budgets by status', () => {
    component.selectedStatus = 'APPROVED';
    component.applyFilter();
    expect(component.filteredBudgets().length).toBe(1);
    expect(component.filteredBudgets()[0].budgetNumber).toBe('ORC-2026-0001');
  });

  it('should filter budgets by search term', () => {
    component.searchQuery = 'Suporte';
    component.applyFilter();
    expect(component.filteredBudgets().length).toBe(1);
    expect(component.filteredBudgets()[0].budgetNumber).toBe('ORC-2026-0002');
  });
});
