import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { ChangePasswordDialogComponent, passwordMatchValidator, differentPasswordValidator } from './change-password-dialog.component';
import { AuthService } from '../../auth.service';
import { FormControl, FormGroup } from '@angular/forms';

describe('ChangePasswordDialogComponent', () => {
  let mockAuthService: any;
  let mockDialogRef: any;
  let mockSnackBar: any;

  beforeEach(async () => {
    mockAuthService = {
      changePassword: vi.fn().mockReturnValue(of({ message: 'Password updated successfully' })),
    };
    mockDialogRef = {
      close: vi.fn(),
    };
    mockSnackBar = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ChangePasswordDialogComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();
  });

  it('should create the component with invalid form initially', () => {
    const fixture = TestBed.createComponent(ChangePasswordDialogComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
    expect(comp.form.valid).toBe(false);
  });

  it('should detect password mismatch', () => {
    const group = new FormGroup(
      {
        newPassword: new FormControl('secret123'),
        confirmPassword: new FormControl('mismatch123'),
      },
      { validators: [passwordMatchValidator] },
    );

    expect(group.hasError('passwordMismatch')).toBe(true);
  });

  it('should detect when new password is same as current password', () => {
    const group = new FormGroup(
      {
        currentPassword: new FormControl('samePassword123'),
        newPassword: new FormControl('samePassword123'),
      },
      { validators: [differentPasswordValidator] },
    );

    expect(group.hasError('samePassword')).toBe(true);
  });

  it('should submit successfully when form is valid', () => {
    const fixture = TestBed.createComponent(ChangePasswordDialogComponent);
    const comp = fixture.componentInstance;

    comp.form.patchValue({
      currentPassword: 'oldPassword123',
      newPassword: 'newSecretPassword456',
      confirmPassword: 'newSecretPassword456',
    });

    expect(comp.form.valid).toBe(true);

    comp.onSubmit();

    expect(mockAuthService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'oldPassword123',
      newPassword: 'newSecretPassword456',
    });
    expect(mockSnackBar.open).toHaveBeenCalledWith('Senha alterada com sucesso!', 'OK', expect.any(Object));
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should handle API error on submit', () => {
    mockAuthService.changePassword.mockReturnValue(throwError(() => ({ error: { message: 'Current password is incorrect' } })));

    const fixture = TestBed.createComponent(ChangePasswordDialogComponent);
    const comp = fixture.componentInstance;

    comp.form.patchValue({
      currentPassword: 'wrongPassword',
      newPassword: 'newSecretPassword456',
      confirmPassword: 'newSecretPassword456',
    });

    comp.onSubmit();

    expect(comp.isLoading()).toBe(false);
    expect(comp.errorMessage()).toBe('Current password is incorrect');
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
