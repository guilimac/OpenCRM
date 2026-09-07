import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerListComponent } from './customer-list.component';
import { CustomerStore } from '../../state/customer.store';
import { CustomerApiService } from '../../services/customer-api.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CustomerSummary } from '../../models/customer.model';

describe('CustomerListComponent', () => {
  let component: CustomerListComponent;
  let fixture: ComponentFixture<CustomerListComponent>;
  let customerStoreMock: any;
  let customerApiMock: any;
  let dialogMock: any;

  const mockCustomer: CustomerSummary = {
    id: 'cust-1',
    companyName: 'Banco Dinâmico',
    status: 'ACTIVE_CUSTOMER',
    industry: 'Financeiro',
    website: 'https://bancodinamico.com.br',
    annualRevenue: 50000000,
    employeeCount: 450,
    contactCount: 2,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  };

  beforeEach(async () => {
    customerStoreMock = {
      customers: vi.fn().mockReturnValue([mockCustomer]),
      total: vi.fn().mockReturnValue(1),
      page: vi.fn().mockReturnValue(1),
      limit: vi.fn().mockReturnValue(10),
      search: vi.fn().mockReturnValue(''),
      statusFilter: vi.fn().mockReturnValue(''),
      isLoading: vi.fn().mockReturnValue(false),
      loadCustomers: vi.fn(),
      setSearch: vi.fn(),
      setStatusFilter: vi.fn(),
      setPage: vi.fn(),
      setLimit: vi.fn(),
    };

    customerApiMock = {
      getById: vi.fn().mockReturnValue(of({ ...mockCustomer, orgId: 'org-1', contacts: [] })),
    };

    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(mockCustomer),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [CustomerListComponent, NoopAnimationsModule],
      providers: [
        { provide: CustomerStore, useValue: customerStoreMock },
        { provide: CustomerApiService, useValue: customerApiMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and load customers', () => {
    expect(component).toBeTruthy();
    expect(customerStoreMock.loadCustomers).toHaveBeenCalled();
  });

  it('should open create customer dialog and reload on completion', () => {
    component.openCreateCustomerDialog();

    expect(dialogMock.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: '600px', disableClose: true }),
    );
    expect(customerStoreMock.loadCustomers).toHaveBeenCalledTimes(2); // init + after dialog closed
  });

  it('should open send email dialog', () => {
    component.openSendEmailDialog(mockCustomer);

    expect(customerApiMock.getById).toHaveBeenCalledWith('cust-1');
    expect(dialogMock.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        width: '520px',
        data: expect.objectContaining({
          customerId: 'cust-1',
          companyName: 'Banco Dinâmico',
        }),
      }),
    );
  });
});
