import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../auth.service';

describe('ForgotPasswordComponent', () => {
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      forgotPassword: vi.fn().mockReturnValue(of({ message: 'Instruções enviadas com sucesso' })),
    };

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should initialize with invalid form', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
    expect(comp.form.valid).toBe(false);
  });

  it('should validate email format', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const comp = fixture.componentInstance;

    comp.form.patchValue({ email: 'invalid-email' });
    expect(comp.form.valid).toBe(false);

    comp.form.patchValue({ email: 'valid@company.com' });
    expect(comp.form.valid).toBe(true);
  });

  it('should submit and display success message', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const comp = fixture.componentInstance;

    comp.form.patchValue({ email: 'user@company.com' });
    comp.onSubmit();

    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('user@company.com');
    expect(comp.isLoading()).toBe(false);
    expect(comp.submittedSuccessfully()).toBe(true);
    expect(comp.successMessage()).toBe('Instruções enviadas com sucesso');
  });

  it('should display error message on API failure', () => {
    mockAuthService.forgotPassword.mockReturnValue(throwError(() => ({ error: { message: 'Erro no servidor' } })));

    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const comp = fixture.componentInstance;

    comp.form.patchValue({ email: 'user@company.com' });
    comp.onSubmit();

    expect(comp.isLoading()).toBe(false);
    expect(comp.errorMessage()).toBe('Erro no servidor');
    expect(comp.submittedSuccessfully()).toBe(false);
  });
});
