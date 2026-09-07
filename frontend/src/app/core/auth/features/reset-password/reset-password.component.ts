import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!newPassword || !confirmPassword) return null;
  return newPassword === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="reset-wrapper">
      <mat-card class="reset-card card-elevation">
        <mat-card-header class="reset-header">
          <div class="brand-badge">
            <mat-icon class="brand-icon">password</mat-icon>
          </div>
          <mat-card-title class="brand-title">Redefinir Senha</mat-card-title>
          <mat-card-subtitle>Escolha uma nova senha segura para acessar sua conta</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (!token()) {
            <div class="error-alert" role="alert">
              <mat-icon class="alert-icon">error_outline</mat-icon>
              <div>
                <strong>Link de recuperação inválido</strong>
                <p class="alert-text">Nenhum código de recuperação foi encontrado. Por favor, solicite um novo link.</p>
              </div>
            </div>
            <div class="back-footer">
              <a routerLink="/forgot-password" class="link-btn">Solicitar novo link</a>
            </div>
          } @else if (resetSuccessful()) {
            <div class="success-alert" role="status">
              <mat-icon class="alert-icon">check_circle</mat-icon>
              <div>
                <strong>Senha alterada com sucesso!</strong>
                <p class="alert-text">Sua nova senha foi gravada. Você já pode fazer login na sua conta.</p>
              </div>
            </div>
            <a mat-flat-button color="primary" routerLink="/login" class="full-width action-btn">
              Ir para o Login
            </a>
          } @else {
            @if (errorMessage()) {
              <div class="error-alert" role="alert">
                <mat-icon class="alert-icon">error_outline</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="reset-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nova senha</mat-label>
                <input
                  matInput
                  [type]="hideNewPassword() ? 'password' : 'text'"
                  formControlName="newPassword"
                  placeholder="Mínimo 6 caracteres"
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
                  <mat-error>A senha deve ter pelo menos 6 caracteres</mat-error>
                }
              </mat-form-field>

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

              <button
                mat-flat-button
                color="primary"
                type="submit"
                class="full-width submit-btn"
                [disabled]="form.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="spinner-btn"></mat-spinner>
                } @else {
                  Redefinir e Salvar Senha
                }
              </button>
            </form>

            <div class="back-footer">
              <a routerLink="/login" class="link-btn">Voltar para o login</a>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reset-wrapper {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 1rem;
    }
    .reset-card {
      width: 100%;
      max-width: 440px;
      padding: 2rem 1.5rem;
      border-radius: 1rem;
      background: #ffffff;
    }
    :host-context(.dark-theme) .reset-card {
      background: #1e293b;
    }
    .reset-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .brand-badge {
      width: 48px;
      height: 48px;
      background: #eff6ff;
      color: #2563eb;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
    }
    :host-context(.dark-theme) .brand-badge {
      background: #1e3a8a;
      color: #93c5fd;
    }
    .brand-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #0f172a;
    }
    :host-context(.dark-theme) .brand-title {
      color: #f8fafc;
    }
    .reset-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .full-width {
      width: 100%;
    }
    .success-alert {
      background-color: #f0fdf4;
      border-left: 4px solid #22c55e;
      color: #15803d;
      padding: 0.75rem 1rem;
      border-radius: 0.25rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    .error-alert {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 0.25rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    .alert-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .alert-text {
      margin: 0.25rem 0 0;
      font-size: 0.8rem;
    }
    .submit-btn, .action-btn {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }
    .spinner-btn {
      display: inline-block;
      margin: 0 auto;
    }
    .back-footer {
      display: flex;
      justify-content: center;
      margin-top: 1.5rem;
    }
    .link-btn {
      color: #2563eb;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.875rem;
    }
    .link-btn:hover {
      text-decoration: underline;
    }
  `],
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly token = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly resetSuccessful = signal<boolean>(false);

  readonly hideNewPassword = signal<boolean>(true);
  readonly hideConfirmPassword = signal<boolean>(true);

  readonly form = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordMatchValidator] },
  );

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');
    if (tokenParam) {
      this.token.set(tokenParam);
    }
  }

  onSubmit(): void {
    const currentToken = this.token();
    if (this.form.invalid || !currentToken) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { newPassword } = this.form.getRawValue();

    this.authService
      .resetPassword({
        token: currentToken,
        newPassword: newPassword!,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.resetSuccessful.set(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.error?.detail || err.error?.message || 'Falha ao redefinir senha. O token pode ter expirado.',
          );
        },
      });
  }
}
