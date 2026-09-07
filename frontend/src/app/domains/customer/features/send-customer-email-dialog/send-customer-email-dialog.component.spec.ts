import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SendCustomerEmailDialogComponent, SendCustomerEmailDialogData } from './send-customer-email-dialog.component';
import { CustomerApiService } from '../../services/customer-api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SendCustomerEmailDialogComponent', () => {
  let component: SendCustomerEmailDialogComponent;
  let fixture: ComponentFixture<SendCustomerEmailDialogComponent>;
  let customerApiMock: any;
  let dialogRefMock: any;
  let snackBarMock: any;

  const mockDialogData: SendCustomerEmailDialogData = {
    customerId: 'cust-1',
    companyName: 'TechCorp Brasil',
    contacts: [
      {
        id: 'cont-1',
        firstName: 'Ana',
        lastName: 'Paula',
        fullName: 'Ana Paula',
        email: 'ana@techcorp.com',
        isPrimary: true,
      },
    ],
  };

  beforeEach(async () => {
    customerApiMock = {
      sendCustomerEmail: vi.fn(),
    };
    dialogRefMock = {
      close: vi.fn(),
    };
    snackBarMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SendCustomerEmailDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: CustomerApiService, useValue: customerApiMock },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SendCustomerEmailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with primary contact selected', () => {
    expect(component.form.get('contactId')?.value).toBe('cont-1');
    expect(component.form.invalid).toBe(true); // subject and body required
  });

  it('should validate required fields', () => {
    component.form.patchValue({ subject: 'Teste', body: 'Mensagem de teste' });
    expect(component.form.valid).toBe(true);
  });

  it('should send email and close dialog on success', () => {
    customerApiMock.sendCustomerEmail.mockReturnValue(of({ success: true }));

    component.form.patchValue({
      subject: 'Proposta',
      body: 'Olá Ana, segue a proposta.',
    });

    component.onSubmit();

    expect(customerApiMock.sendCustomerEmail).toHaveBeenCalledWith('cust-1', {
      contactId: 'cont-1',
      recipientEmail: undefined,
      subject: 'Proposta',
      body: 'Olá Ana, segue a proposta.',
    });
    expect(snackBarMock.open).toHaveBeenCalledWith('E-mail enviado com sucesso!', 'Fechar', expect.any(Object));
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should display error message on API failure', () => {
    customerApiMock.sendCustomerEmail.mockReturnValue(
      throwError(() => ({ error: { message: 'Erro ao conectar no servidor de e-mail' } })),
    );

    component.form.patchValue({
      subject: 'Proposta',
      body: 'Olá Ana.',
    });

    component.onSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(component.errorMessage()).toBe('Erro ao conectar no servidor de e-mail');
  });
});
