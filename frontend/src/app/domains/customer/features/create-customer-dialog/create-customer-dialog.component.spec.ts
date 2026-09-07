import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCustomerDialogComponent } from './create-customer-dialog.component';
import { CustomerApiService } from '../../services/customer-api.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateCustomerDialogComponent', () => {
  let component: CreateCustomerDialogComponent;
  let fixture: ComponentFixture<CreateCustomerDialogComponent>;
  let customerApiMock: any;
  let dialogRefMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    customerApiMock = {
      create: vi.fn(),
    };
    dialogRefMock = {
      close: vi.fn(),
    };
    snackBarMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CreateCustomerDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: CustomerApiService, useValue: customerApiMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCustomerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created with invalid initial form state', () => {
    expect(component).toBeTruthy();
    expect(component.form.valid).toBe(false);
  });

  it('should validate required companyName', () => {
    component.form.patchValue({ companyName: 'Nexus Tech' });
    expect(component.form.valid).toBe(true);
  });

  it('should submit customer data with primary contact and close dialog', () => {
    const mockCreated = { id: 'cust-123', companyName: 'Nexus Tech' };
    customerApiMock.create.mockReturnValue(of(mockCreated));

    component.form.patchValue({
      companyName: 'Nexus Tech',
      industry: 'Tecnologia',
      website: 'https://nexus.tech',
      status: 'ACTIVE_CUSTOMER',
      annualRevenue: 500000,
      employeeCount: 25,
      contactFirstName: 'Mariana',
      contactLastName: 'Souza',
      contactEmail: 'mariana@nexus.tech',
      contactPhone: '+55 11 99999-1111',
      contactTitle: 'CTO',
    });

    component.onSubmit();

    expect(customerApiMock.create).toHaveBeenCalledWith({
      companyName: 'Nexus Tech',
      industry: 'Tecnologia',
      website: 'https://nexus.tech',
      status: 'ACTIVE_CUSTOMER',
      annualRevenue: 500000,
      employeeCount: 25,
      primaryContact: {
        firstName: 'Mariana',
        lastName: 'Souza',
        email: 'mariana@nexus.tech',
        phone: '+55 11 99999-1111',
        title: 'CTO',
      },
    });

    expect(snackBarMock.open).toHaveBeenCalledWith('Cliente cadastrado com sucesso!', 'Fechar', expect.any(Object));
    expect(dialogRefMock.close).toHaveBeenCalledWith(mockCreated);
  });

  it('should display error message on API failure', () => {
    customerApiMock.create.mockReturnValue(
      throwError(() => ({ error: { message: 'Company name already exists' } })),
    );

    component.form.patchValue({ companyName: 'Duplicate Corp' });
    component.onSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(component.errorMessage()).toBe('Company name already exists');
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
});
