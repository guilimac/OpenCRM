import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-signup',
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
    <div class="signup-wrapper">
      <mat-card class="signup-card card-elevation">
        <mat-card-header class="signup-header">
          <div class="brand-badge">
            <img src="/images/opencrm-logo.png" alt="OpenCRM Logo" class="brand-logo-img" />
          </div>
          <mat-card-title class="brand-title">Criar Conta no OpenCRM</mat-card-title>
          <mat-card-subtitle>Comece a gerenciar clientes e oportunidades hoje mesmo</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (errorMessage()) {
            <div class="error-alert" role="alert">
              <mat-icon class="error-icon">error_outline</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="signup-form">
            <div class="name-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Nome</mat-label>
                <input matInput formControlName="firstName" placeholder="Seu nome" />
                <mat-icon matPrefix>person</mat-icon>
                @if (form.get('firstName')?.hasError('required') && form.get('firstName')?.touched) {
                  <mat-error>Obrigatório</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Sobrenome</mat-label>
                <input matInput formControlName="lastName" placeholder="Seu sobrenome" />
                @if (form.get('lastName')?.hasError('required') && form.get('lastName')?.touched) {
                  <mat-error>Obrigatório</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome da Empresa (opcional)</mat-label>
              <input matInput formControlName="organizationName" placeholder="Ex: Minha Empresa Ltda" />
              <mat-icon matPrefix>business</mat-icon>
            </mat-form-field>

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
                placeholder="Mínimo 6 caracteres"
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
              @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                <mat-error>A senha deve ter pelo menos 6 caracteres</mat-error>
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
                Cadastrar e Acessar
              }
            </button>
          </form>

          <div class="login-footer">
            <span>Já tem uma conta?</span>
            <a routerLink="/login" class="link-btn">Faça login</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .signup-wrapper {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 1rem;
    }
    .signup-card {
      width: 100%;
      max-width: 480px;
      padding: 2rem 1.5rem;
      border-radius: 1rem;
      background: #ffffff;
    }
    :host-context(.dark-theme) .signup-card {
      background: #1e293b;
    }
    .signup-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .brand-badge {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .brand-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .brand-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
    }
    :host-context(.dark-theme) .brand-title {
      color: #f8fafc;
    }
    .signup-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .name-row {
      display: flex;
      gap: 0.75rem;
    }
    .half-width {
      flex: 1;
    }
    .full-width {
      width: 100%;
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
    .login-footer {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }
    .link-btn {
      color: #2563eb;
      font-weight: 600;
      text-decoration: none;
    }
    .link-btn:hover {
      text-decoration: underline;
    }
  `],
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly hidePassword = signal<boolean>(true);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    organizationName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();

    this.authService
      .register({
        firstName: raw.firstName!,
        lastName: raw.lastName!,
        organizationName: raw.organizationName || undefined,
        email: raw.email!,
        password: raw.password!,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.error?.detail || err.error?.message || 'Falha ao cadastrar usuário. Tente novamente.',
          );
        },
      });
  }
}
