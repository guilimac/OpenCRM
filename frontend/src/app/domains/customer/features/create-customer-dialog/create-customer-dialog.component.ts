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
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerApiService } from '../../services/customer-api.service';
import { CreateCustomerForm } from '../../models/customer.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

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
    TranslatePipe,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header flex-row gap-sm">
        <mat-icon color="primary">domain_add</mat-icon>
        <h2 mat-dialog-title class="m-0">{{ 'CUSTOMER.DIALOG_TITLE' | translate }}</h2>
      </div>
      <p class="subtitle">{{ 'CUSTOMER.DIALOG_SUBTITLE' | translate }}</p>

      <mat-dialog-content>
        <form [formGroup]="form" class="flex-col gap-sm">
          <div class="section-heading">{{ 'CUSTOMER.COMPANY_INFO' | translate }}</div>

          <!-- Company Name -->
          <mat-form-field appearance="outline">
            <mat-label>{{ 'CUSTOMER.COMPANY_NAME' | translate }}</mat-label>
            <input
              matInput
              formControlName="companyName"
              placeholder="Ex: TechCorp Brasil Soluções Ltda"
            />
            @if (form.get('companyName')?.hasError('required')) {
              <mat-error>{{ 'CUSTOMER.VALIDATION_NAME_REQUIRED' | translate }}</mat-error>
            }
          </mat-form-field>

          <div class="grid-2col">
            <!-- Industry -->
            <mat-form-field appearance="outline">
              <mat-label>{{ 'CUSTOMER.INDUSTRY' | translate }}</mat-label>
              <mat-select formControlName="industry">
                <mat-option value="">—</mat-option>
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
              <mat-label>{{ 'CUSTOMER.INITIAL_STATUS' | translate }}</mat-label>
              <mat-select formControlName="status">
                <mat-option value="LEAD">{{ 'CUSTOMER.STATUS_LEAD' | translate }}</mat-option>
                <mat-option value="PROSPECT">{{ 'CUSTOMER.STATUS_PROSPECT' | translate }}</mat-option>
                <mat-option value="ACTIVE_CUSTOMER">{{ 'CUSTOMER.STATUS_ACTIVE_CUSTOMER' | translate }}</mat-option>
                <mat-option value="CHURNED">{{ 'CUSTOMER.STATUS_CHURNED' | translate }}</mat-option>
                <mat-option value="INACTIVE">{{ 'CUSTOMER.STATUS_INACTIVE' | translate }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="grid-2col">
            <!-- Website -->
            <mat-form-field appearance="outline">
              <mat-label>{{ 'CUSTOMER.WEBSITE' | translate }}</mat-label>
              <input
                matInput
                formControlName="website"
                placeholder="https://empresa.com.br"
              />
            </mat-form-field>

            <!-- Annual Revenue -->
            <mat-form-field appearance="outline">
              <mat-label>{{ 'CUSTOMER.ANNUAL_REVENUE' | translate }}</mat-label>
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
            <mat-label>{{ 'CUSTOMER.EMPLOYEE_COUNT' | translate }}</mat-label>
            <input
              matInput
              type="number"
              formControlName="employeeCount"
              placeholder="Ex: 50"
            />
          </mat-form-field>

          <mat-divider class="my-sm"></mat-divider>

          <div class="section-heading">{{ 'CUSTOMER.PRIMARY_CONTACT' | translate }}</div>

          <div class="grid-2col">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'CUSTOMER.FIRST_NAME' | translate }}</mat-label>
              <input matInput formControlName="contactFirstName" placeholder="Ex: Carlos" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'CUSTOMER.LAST_NAME' | translate }}</mat-label>
              <input matInput formControlName="contactLastName" placeholder="Ex: Silva" />
            </mat-form-field>
          </div>

          <div class="grid-2col">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'CUSTOMER.EMAIL' | translate }}</mat-label>
              <input
                matInput
                type="email"
                formControlName="contactEmail"
                placeholder="carlos@empresa.com.br"
              />
              @if (form.get('contactEmail')?.hasError('email')) {
                <mat-error>{{ 'CUSTOMER.VALIDATION_EMAIL_INVALID' | translate }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'CUSTOMER.PHONE' | translate }}</mat-label>
              <input
                matInput
                formControlName="contactPhone"
                placeholder="+55 11 99999-9999"
              />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'CUSTOMER.JOB_TITLE' | translate }}</mat-label>
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
          {{ 'COMMON.CANCEL' | translate }}
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
          {{ 'CUSTOMER.SAVE_CUSTOMER' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      width: min(640px, calc(95vw - 3rem));
      box-sizing: border-box;
      padding: 0.5rem;
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
  private readonly i18n = inject(I18nService);

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
        this.snackBar.open(
          this.i18n.t('CUSTOMER.CUSTOMER_SAVED'),
          this.i18n.t('COMMON.CLOSE'),
          {
            duration: 3500,
            panelClass: ['snackbar-success'],
          },
        );
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
