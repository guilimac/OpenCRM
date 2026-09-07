import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerListsComponent } from './customer-lists.component';
import { CustomerApiService } from '../../services/customer-api.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CustomerListItem } from '../../models/customer.model';

describe('CustomerListsComponent', () => {
  let component: CustomerListsComponent;
  let fixture: ComponentFixture<CustomerListsComponent>;
  let customerApiMock: any;
  let dialogMock: any;

  const mockLists: CustomerListItem[] = [
    {
      id: 'list-1',
      name: 'Clientes VIP e Estratégicos',
      description: 'Grandes contas',
      memberCount: 3,
      customerIds: ['c1', 'c2', 'c3'],
      createdAt: '2026-09-07T10:00:00Z',
      updatedAt: '2026-09-07T10:00:00Z',
    },
  ];

  beforeEach(async () => {
    customerApiMock = {
      listCustomerLists: vi.fn().mockReturnValue(of({ data: mockLists, total: 1 })),
    };
    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(null),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [CustomerListsComponent, NoopAnimationsModule],
      providers: [
        { provide: CustomerApiService, useValue: customerApiMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load and render customer lists on init', () => {
    expect(customerApiMock.listCustomerLists).toHaveBeenCalled();
    expect(component.lists().length).toBe(1);
    expect(component.lists()[0].name).toBe('Clientes VIP e Estratégicos');
    expect(component.isLoading()).toBe(false);
  });

  it('should open create list dialog', () => {
    component.openCreateListDialog();
    expect(dialogMock.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: '560px' }),
    );
  });

  it('should open send mass email dialog with selected list', () => {
    component.openSendMassEmailDialog(mockLists[0]);
    expect(dialogMock.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: { list: mockLists[0] },
      }),
    );
  });
});
