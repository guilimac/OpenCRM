import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card card-elevation">
        <mat-card-header class="login-header">
          <div class="brand-badge">
            <mat-icon class="brand-icon">hub</mat-icon>
          </div>
          <mat-card-title class="brand-title">OpenCRM</mat-card-title>
          <mat-card-subtitle>Plataforma de Gestão de Clientes & Vendas</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (errorMessage()) {
            <div class="error-alert" role="alert">
              <mat-icon class="error-icon">error_outline</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
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

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
              />
              <mat-icon matPrefix>lock</mat-icon>
              <button
                type="button"
                mat-icon-button
                matSuffix
                (click)="hidePassword.set(!hidePassword())"
                [attr.aria-label]="hidePassword() ? 'Mostrar senha' : 'Ocultar senha'"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>A senha é obrigatória</mat-error>
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
                Entrar no Sistema
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 1rem;
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 2rem 1.5rem;
      border-radius: 1rem;
      background: #ffffff;
    }
    :host-context(.dark-theme) .login-card {
      background: #1e293b;
    }
    .login-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 2rem;
    }
    .brand-badge {
      width: 48px;
      height: 48px;
      background: #2563eb;
      color: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
    }
    .brand-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
    }
    :host-context(.dark-theme) .brand-title {
      color: #f8fafc;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
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
    .error-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
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
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly hidePassword = signal<boolean>(true);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['demo@opencrm.com', [Validators.required, Validators.email]],
    password: ['Demo@123456', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/pipeline']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.detail || err.error?.message || 'Falha ao autenticar. Verifique suas credenciais.',
        );
      },
    });
  }
}
