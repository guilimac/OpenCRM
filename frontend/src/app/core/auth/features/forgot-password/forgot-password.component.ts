import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-forgot-password',
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
    <div class="forgot-wrapper">
      <mat-card class="forgot-card card-elevation">
        <mat-card-header class="forgot-header">
          <div class="brand-badge">
            <mat-icon class="brand-icon">mark_email_read</mat-icon>
          </div>
          <mat-card-title class="brand-title">Recuperar Senha</mat-card-title>
          <mat-card-subtitle>Informe seu e-mail corporativo para receber as instruções de redefinição</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (successMessage()) {
            <div class="success-alert" role="status">
              <mat-icon class="alert-icon">check_circle</mat-icon>
              <div>
                <strong>Instruções enviadas!</strong>
                <p class="alert-text">{{ successMessage() }}</p>
              </div>
            </div>
          }

          @if (errorMessage()) {
            <div class="error-alert" role="alert">
              <mat-icon class="alert-icon">error_outline</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          @if (!submittedSuccessfully()) {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="forgot-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>E-mail corporativo</mat-label>
                <input matInput type="email" formControlName="email" placeholder="usuario@empresa.com" />
                <mat-icon matPrefix>email</mat-icon>
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <mat-error>O e-mail é obrigatório</mat-error>
                }
                @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                  <mat-error>Digite um e-mail válido</mat-error>
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
                  Enviar Link de Recuperação
                }
              </button>
            </form>
          }

          <div class="back-footer">
            <a routerLink="/login" class="link-btn">
              <mat-icon class="icon-inline">arrow_back</mat-icon>
              Voltar para o login
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .forgot-wrapper {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 1rem;
    }
    .forgot-card {
      width: 100%;
      max-width: 440px;
      padding: 2rem 1.5rem;
      border-radius: 1rem;
      background: #ffffff;
    }
    :host-context(.dark-theme) .forgot-card {
      background: #1e293b;
    }
    .forgot-header {
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
    .forgot-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
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
    .submit-btn {
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
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
    }
    .link-btn:hover {
      text-decoration: underline;
    }
    .icon-inline {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
  `],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly submittedSuccessfully = signal<boolean>(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email } = this.form.getRawValue();

    this.authService.forgotPassword(email!).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message);
        this.submittedSuccessfully.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.detail || err.error?.message || 'Falha ao solicitar recuperação. Tente novamente.',
        );
      },
    });
  }
}
