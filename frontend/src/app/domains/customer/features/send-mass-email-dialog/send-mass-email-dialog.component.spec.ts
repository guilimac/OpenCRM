import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SendMassEmailDialogComponent, SendMassEmailDialogData } from './send-mass-email-dialog.component';
import { CustomerApiService } from '../../services/customer-api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SendMassEmailDialogComponent', () => {
  let component: SendMassEmailDialogComponent;
  let fixture: ComponentFixture<SendMassEmailDialogComponent>;
  let customerApiMock: any;
  let dialogRefMock: any;
  let snackBarMock: any;

  const mockDialogData: SendMassEmailDialogData = {
    list: {
      id: 'list-1',
      name: 'Clientes Estratégicos',
      description: 'Contas Tier 1',
      memberCount: 5,
      customerIds: ['c1', 'c2', 'c3', 'c4', 'c5'],
      createdAt: '2026-09-07T10:00:00Z',
      updatedAt: '2026-09-07T10:00:00Z',
    },
  };

  beforeEach(async () => {
    if (!document.execCommand) {
      (document as any).execCommand = vi.fn();
    }

    customerApiMock = {
      sendMassEmail: vi.fn(),
    };
    dialogRefMock = {
      close: vi.fn(),
    };
    snackBarMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SendMassEmailDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: CustomerApiService, useValue: customerApiMock },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SendMassEmailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component with invalid initial form state', () => {
    expect(component).toBeTruthy();
    expect(component.form.invalid).toBe(true);
  });

  it('should insert dynamic variable tag into html editor', () => {
    component.insertTag('{{firstName}}');
    expect(component.form.get('body')?.value).toContain('{{firstName}}');
  });

  it('should submit mass email successfully and set results', () => {
    const mockResult = {
      totalRecipients: 5,
      sentCount: 5,
      failedCount: 0,
      errors: [],
    };
    customerApiMock.sendMassEmail.mockReturnValue(of({ data: mockResult }));

    component.form.patchValue({
      subject: 'Novidade Exclusiva',
      body: '<p>Olá <strong>{{firstName}}</strong></p>',
    });

    component.onSubmit();

    expect(customerApiMock.sendMassEmail).toHaveBeenCalledWith('list-1', {
      subject: 'Novidade Exclusiva',
      body: '<p>Olá <strong>{{firstName}}</strong></p>',
    });
    expect(component.sendResult()).toEqual(mockResult);
    expect(snackBarMock.open).toHaveBeenCalled();
  });

  it('should handle submission error', () => {
    customerApiMock.sendMassEmail.mockReturnValue(
      throwError(() => ({ error: { message: 'Serviço temporariamente indisponível' } })),
    );

    component.form.patchValue({
      subject: 'Assunto',
      body: '<p>Mensagem</p>',
    });

    component.onSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(component.errorMessage()).toBe('Serviço temporariamente indisponível');
  });
});
