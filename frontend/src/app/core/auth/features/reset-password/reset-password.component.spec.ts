import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ResetPasswordComponent, passwordMatchValidator } from './reset-password.component';
import { AuthService } from '../../auth.service';
import { FormControl, FormGroup } from '@angular/forms';

describe('ResetPasswordComponent', () => {
  let mockAuthService: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockAuthService = {
      resetPassword: vi.fn().mockReturnValue(of({ message: 'Senha redefinida com sucesso!' })),
    };
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: vi.fn().mockReturnValue('test-token-xyz'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  });

  it('should read token from query params on init', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.token()).toBe('test-token-xyz');
  });

  it('should detect password mismatch in validator', () => {
    const group = new FormGroup(
      {
        newPassword: new FormControl('secret123'),
        confirmPassword: new FormControl('different123'),
      },
      { validators: [passwordMatchValidator] },
    );

    expect(group.hasError('passwordMismatch')).toBe(true);
  });

  it('should submit successfully and set resetSuccessful state', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.form.patchValue({
      newPassword: 'MyNewSecretPassword123!',
      confirmPassword: 'MyNewSecretPassword123!',
    });

    expect(comp.form.valid).toBe(true);

    comp.onSubmit();

    expect(mockAuthService.resetPassword).toHaveBeenCalledWith({
      token: 'test-token-xyz',
      newPassword: 'MyNewSecretPassword123!',
    });
    expect(comp.isLoading()).toBe(false);
    expect(comp.resetSuccessful()).toBe(true);
  });

  it('should handle API errors during password reset', () => {
    mockAuthService.resetPassword.mockReturnValue(
      throwError(() => ({ error: { detail: 'Token inválido ou expirado' } })),
    );

    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.form.patchValue({
      newPassword: 'MyNewSecretPassword123!',
      confirmPassword: 'MyNewSecretPassword123!',
    });

    comp.onSubmit();

    expect(comp.isLoading()).toBe(false);
    expect(comp.errorMessage()).toBe('Token inválido ou expirado');
    expect(comp.resetSuccessful()).toBe(false);
  });
});
