import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerApiService } from '../../services/customer-api.service';
import { CreateCustomerForm } from '../../models/customer.model';

@Component({
  selector: 'app-create-customer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header flex-row gap-sm">
        <mat-icon color="primary">domain_add</mat-icon>
        <h2 mat-dialog-title class="m-0">Novo Cliente & Conta</h2>
      </div>
      <p class="subtitle">Cadastre os dados cadastrais da empresa e o contato comercial principal.</p>

      <mat-dialog-content>
        <form [formGroup]="form" class="flex-col gap-sm">
          <div class="section-heading">Dados da Empresa</div>

          <!-- Company Name -->
          <mat-form-field appearance="outline">
            <mat-label>Razão Social / Nome da Empresa</mat-label>
            <input
              matInput
              formControlName="companyName"
              placeholder="Ex: TechCorp Brasil Soluções Ltda"
            />
            @if (form.get('companyName')?.hasError('required')) {
              <mat-error>O nome da empresa é obrigatório</mat-error>
            }
          </mat-form-field>

          <div class="grid-2col">
            <!-- Industry -->
            <mat-form-field appearance="outline">
              <mat-label>Setor de Atuação</mat-label>
              <mat-select formControlName="industry">
                <mat-option value="">Não especificado</mat-option>
                <mat-option value="Tecnologia">Tecnologia</mat-option>
                <mat-option value="Financeiro">Financeiro / Bancos</mat-option>
                <mat-option value="Varejo">Varejo & E-commerce</mat-option>
                <mat-option value="Agronegócio">Agronegócio</mat-option>
                <mat-option value="Saúde">Saúde & Farmacêutica</mat-option>
                <mat-option value="Indústria">Indústria & Manufatura</mat-option>
                <mat-option value="Serviços">Serviços Corporativos</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Status -->
            <mat-form-field appearance="outline">
              <mat-label>Status Inicial</mat-label>
              <mat-select formControlName="status">
                <mat-option value="LEAD">Lead</mat-option>
                <mat-option value="PROSPECT">Prospect</mat-option>
                <mat-option value="ACTIVE_CUSTOMER">Cliente Ativo</mat-option>
                <mat-option value="CHURNED">Cancelado</mat-option>
                <mat-option value="INACTIVE">Inativo</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="grid-2col">
            <!-- Website -->
            <mat-form-field appearance="outline">
              <mat-label>Website</mat-label>
              <input
                matInput
                formControlName="website"
                placeholder="https://empresa.com.br"
              />
            </mat-form-field>

            <!-- Annual Revenue -->
            <mat-form-field appearance="outline">
              <mat-label>Faturamento Anual (R$)</mat-label>
              <input
                matInput
                type="number"
                formControlName="annualRevenue"
                placeholder="0.00"
              />
            </mat-form-field>
          </div>

          <!-- Employee count -->
          <mat-form-field appearance="outline">
            <mat-label>Número de Colaboradores</mat-label>
            <input
              matInput
              type="number"
              formControlName="employeeCount"
              placeholder="Ex: 50"
            />
          </mat-form-field>

          <mat-divider class="my-sm"></mat-divider>

          <div class="section-heading">Contato Principal (Opcional)</div>

          <div class="grid-2col">
            <mat-form-field appearance="outline">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="contactFirstName" placeholder="Ex: Carlos" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Sobrenome</mat-label>
              <input matInput formControlName="contactLastName" placeholder="Ex: Silva" />
            </mat-form-field>
          </div>

          <div class="grid-2col">
            <mat-form-field appearance="outline">
              <mat-label>E-mail do Contato</mat-label>
              <input
                matInput
                type="email"
                formControlName="contactEmail"
                placeholder="carlos@empresa.com.br"
              />
              @if (form.get('contactEmail')?.hasError('email')) {
                <mat-error>Informe um e-mail válido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Telefone / WhatsApp</mat-label>
              <input
                matInput
                formControlName="contactPhone"
                placeholder="+55 11 99999-9999"
              />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Cargo / Função</mat-label>
            <input
              matInput
              formControlName="contactTitle"
              placeholder="Ex: Diretor de Tecnologia, Gerente de Compras"
            />
          </mat-form-field>

          @if (errorMessage()) {
            <div class="error-alert">
              <mat-icon class="icon-sm">error</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="gap-sm">
        <button mat-button type="button" (click)="onCancel()" [disabled]="isSubmitting()">
          Cancelar
        </button>
        <button
          mat-flat-button
          color="primary"
          (click)="onSubmit()"
          [disabled]="form.invalid || isSubmitting()"
        >
          @if (isSubmitting()) {
            <mat-spinner diameter="18" class="mr-sm"></mat-spinner>
          } @else {
            <mat-icon class="icon-sm mr-xs">check</mat-icon>
          }
          Salvar Cliente
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
      max-width: 650px;
    }
    .dialog-header {
      align-items: center;
      margin-bottom: 0.25rem;
    }
    .subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0 0 1rem;
    }
    .section-heading {
      font-weight: 600;
      font-size: 0.85rem;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
    }
    :host-context(.dark-theme) .section-heading {
      color: #60a5fa;
    }
    .grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .flex-col {
      display: flex;
      flex-direction: column;
    }
    .flex-row {
      display: flex;
      flex-direction: row;
    }
    .gap-sm {
      gap: 0.5rem;
    }
    .m-0 {
      margin: 0;
    }
    .my-sm {
      margin: 0.75rem 0;
    }
    .mr-xs {
      margin-right: 0.25rem;
    }
    .mr-sm {
      margin-right: 0.5rem;
    }
    .icon-sm {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      vertical-align: middle;
    }
    .error-alert {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.8rem;
      background-color: #fef2f2;
      border: 1px solid #f87171;
      border-radius: 6px;
      color: #b91c1c;
      font-size: 0.85rem;
    }
  `],
})
export class CreateCustomerDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CreateCustomerDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly customerApi = inject(CustomerApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    industry: [''],
    website: [''],
    status: ['LEAD'],
    annualRevenue: [null as number | null],
    employeeCount: [null as number | null],
    contactFirstName: [''],
    contactLastName: [''],
    contactEmail: ['', [Validators.email]],
    contactPhone: [''],
    contactTitle: [''],
  });

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const fv = this.form.value;

    const payload: CreateCustomerForm = {
      companyName: fv.companyName!.trim(),
      industry: fv.industry || undefined,
      website: fv.website?.trim() || undefined,
      status: fv.status || 'LEAD',
      annualRevenue: fv.annualRevenue ? Number(fv.annualRevenue) : undefined,
      employeeCount: fv.employeeCount ? Number(fv.employeeCount) : undefined,
    };

    // If contact email and firstName provided, include primaryContact
    if (fv.contactEmail?.trim() && fv.contactFirstName?.trim()) {
      payload.primaryContact = {
        firstName: fv.contactFirstName.trim(),
        lastName: fv.contactLastName?.trim() || '',
        email: fv.contactEmail.trim(),
        phone: fv.contactPhone?.trim() || undefined,
        title: fv.contactTitle?.trim() || undefined,
      };
    }

    this.customerApi.create(payload).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.snackBar.open('Cliente cadastrado com sucesso!', 'Fechar', {
          duration: 3500,
          panelClass: ['snackbar-success'],
        });
        this.dialogRef.close(created);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.error?.message || err.message || 'Falha ao cadastrar cliente',
        );
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
