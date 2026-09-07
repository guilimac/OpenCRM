import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../auth.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!newPassword || !confirmPassword) return null;
  return newPassword === confirmPassword ? null : { passwordMismatch: true };
};

export const differentPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const currentPassword = control.get('currentPassword')?.value;
  const newPassword = control.get('newPassword')?.value;

  if (!currentPassword || !newPassword) return null;
  return currentPassword !== newPassword ? null : { samePassword: true };
};

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="dialog-icon-badge">
          <mat-icon>lock_reset</mat-icon>
        </div>
        <h2 mat-dialog-title class="dialog-title">Alterar Senha</h2>
        <p class="dialog-subtitle">Atualize sua senha de acesso ao OpenCRM com segurança</p>
      </div>

      <mat-dialog-content class="dialog-content">
        @if (errorMessage()) {
          <div class="error-alert" role="alert">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" id="changePasswordForm" class="dialog-form">
          <!-- Senha Atual -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Senha atual</mat-label>
            <input
              matInput
              [type]="hideCurrentPassword() ? 'password' : 'text'"
              formControlName="currentPassword"
              placeholder="Digite sua senha atual"
            />
            <mat-icon matPrefix>key</mat-icon>
            <button
              type="button"
              mat-icon-button
              matSuffix
              (click)="hideCurrentPassword.set(!hideCurrentPassword())"
              [attr.aria-label]="hideCurrentPassword() ? 'Mostrar senha' : 'Ocultar senha'"
            >
              <mat-icon>{{ hideCurrentPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('currentPassword')?.hasError('required') && form.get('currentPassword')?.touched) {
              <mat-error>A senha atual é obrigatória</mat-error>
            }
          </mat-form-field>

          <!-- Nova Senha -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nova senha</mat-label>
            <input
              matInput
              [type]="hideNewPassword() ? 'password' : 'text'"
              formControlName="newPassword"
              placeholder="Mínimo de 6 caracteres"
            />
            <mat-icon matPrefix>lock</mat-icon>
            <button
              type="button"
              mat-icon-button
              matSuffix
              (click)="hideNewPassword.set(!hideNewPassword())"
              [attr.aria-label]="hideNewPassword() ? 'Mostrar senha' : 'Ocultar senha'"
            >
              <mat-icon>{{ hideNewPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('newPassword')?.hasError('required') && form.get('newPassword')?.touched) {
              <mat-error>A nova senha é obrigatória</mat-error>
            }
            @if (form.get('newPassword')?.hasError('minlength') && form.get('newPassword')?.touched) {
              <mat-error>A nova senha deve ter pelo menos 6 caracteres</mat-error>
            }
            @if (form.hasError('samePassword') && form.get('newPassword')?.touched) {
              <mat-error>A nova senha deve ser diferente da atual</mat-error>
            }
          </mat-form-field>

          <!-- Confirmar Nova Senha -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmar nova senha</mat-label>
            <input
              matInput
              [type]="hideConfirmPassword() ? 'password' : 'text'"
              formControlName="confirmPassword"
              placeholder="Repita a nova senha"
            />
            <mat-icon matPrefix>lock_clock</mat-icon>
            <button
              type="button"
              mat-icon-button
              matSuffix
              (click)="hideConfirmPassword.set(!hideConfirmPassword())"
              [attr.aria-label]="hideConfirmPassword() ? 'Mostrar senha' : 'Ocultar senha'"
            >
              <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('confirmPassword')?.hasError('required') && form.get('confirmPassword')?.touched) {
              <mat-error>A confirmação de senha é obrigatória</mat-error>
            }
            @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
              <mat-error>As senhas não conferem</mat-error>
            }
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()" [disabled]="isLoading()">
          Cancelar
        </button>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          form="changePasswordForm"
          [disabled]="form.invalid || isLoading()"
        >
          @if (isLoading()) {
            <mat-spinner diameter="18" class="spinner-inline"></mat-spinner>
          } @else {
            Salvar Nova Senha
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0.5rem;
    }
    .dialog-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 1rem;
    }
    .dialog-icon-badge {
      width: 44px;
      height: 44px;
      background: #eff6ff;
      color: #2563eb;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }
    :host-context(.dark-theme) .dialog-icon-badge {
      background: #1e3a8a;
      color: #93c5fd;
    }
    .dialog-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
    }
    .dialog-subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0.25rem 0 0;
    }
    .dialog-content {
      padding: 0 0.5rem;
      overflow-x: hidden;
    }
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 0.5rem;
    }
    .full-width {
      width: 100%;
    }
    .error-alert {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      color: #991b1b;
      padding: 0.65rem 0.85rem;
      border-radius: 0.25rem;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }
    .error-icon {
      font-size: 1.15rem;
      width: 1.15rem;
      height: 1.15rem;
    }
    .dialog-actions {
      padding: 1rem 0.5rem 0.5rem;
      gap: 0.5rem;
    }
    .spinner-inline {
      display: inline-block;
      margin: 0 auto;
    }
  `],
})
export class ChangePasswordDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<ChangePasswordDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly hideCurrentPassword = signal<boolean>(true);
  readonly hideNewPassword = signal<boolean>(true);
  readonly hideConfirmPassword = signal<boolean>(true);

  readonly form = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordMatchValidator, differentPasswordValidator] },
  );

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { currentPassword, newPassword } = this.form.getRawValue();

    this.authService
      .changePassword({
        currentPassword: currentPassword!,
        newPassword: newPassword!,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.snackBar.open('Senha alterada com sucesso!', 'OK', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.error?.detail || err.error?.message || 'Falha ao alterar senha. Verifique os dados.',
          );
        },
      });
  }
}
