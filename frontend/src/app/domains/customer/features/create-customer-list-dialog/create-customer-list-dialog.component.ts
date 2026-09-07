import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerApiService } from '../../services/customer-api.service';
import { CustomerSummary } from '../../models/customer.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-create-customer-list-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header flex-row gap-sm">
        <mat-icon color="primary">playlist_add</mat-icon>
        <h2 mat-dialog-title class="m-0">{{ 'CUSTOMER_LISTS.DIALOG_TITLE' | translate }}</h2>
      </div>

      <p class="subtitle">{{ 'CUSTOMER_LISTS.DIALOG_SUBTITLE' | translate }}</p>

      <mat-dialog-content>
        <form [formGroup]="form" class="flex-col gap-sm">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'CUSTOMER_LISTS.LIST_NAME' | translate }}</mat-label>
            <input
              matInput
              formControlName="name"
              placeholder="Ex: Clientes VIP - Q4, Leads Prioritários..."
            />
            @if (form.get('name')?.hasError('required')) {
              <mat-error>{{ 'CUSTOMER_LISTS.VALIDATION_NAME_REQUIRED' | translate }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'CUSTOMER_LISTS.LIST_DESC' | translate }}</mat-label>
            <textarea
              matInput
              rows="2"
              formControlName="description"
              placeholder="Finalidade ou critério da lista..."
            ></textarea>
          </mat-form-field>

          <div class="customers-section">
            <div class="flex-row space-between align-center mb-xs">
              <span class="section-title">{{ 'CUSTOMER_LISTS.SELECT_MEMBERS' | translate }}</span>
              <span class="badge-count">{{ 'CUSTOMER_LISTS.SELECTED_COUNT' | translate:{ count: selectedCustomerIds().length } }}</span>
            </div>

            @if (isLoadingCustomers()) {
              <div class="spinner-inline">
                <mat-spinner diameter="24"></mat-spinner>
                <span>{{ 'COMMON.LOADING' | translate }}</span>
              </div>
            } @else {
              <div class="customer-picker-list">
                @for (cust of availableCustomers(); track cust.id) {
                  <div class="customer-picker-item">
                    <mat-checkbox
                      [checked]="isCustomerSelected(cust.id)"
                      (change)="toggleCustomer(cust.id)"
                    >
                      <span class="fw-500">{{ cust.companyName }}</span>
                      @if (cust.industry) {
                        <span class="industry-tag">({{ cust.industry }})</span>
                      }
                    </mat-checkbox>
                  </div>
                }
                @if (availableCustomers().length === 0) {
                  <p class="empty-hint">{{ 'CUSTOMER.EMPTY_STATE' | translate }}</p>
                }
              </div>
            }
          </div>

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
          {{ 'CUSTOMER_LISTS.CREATE_LIST_BTN' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 450px;
      max-width: 560px;
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
    .flex-col {
      display: flex;
      flex-direction: column;
    }
    .flex-row {
      display: flex;
      flex-direction: row;
    }
    .space-between {
      justify-content: space-between;
    }
    .align-center {
      align-items: center;
    }
    .gap-sm {
      gap: 0.5rem;
    }
    .m-0 {
      margin: 0;
    }
    .mb-xs {
      margin-bottom: 0.35rem;
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
    .section-title {
      font-weight: 600;
      font-size: 0.85rem;
      color: #334155;
    }
    .badge-count {
      font-size: 0.75rem;
      background-color: #eff6ff;
      color: #1d4ed8;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;
    }
    .customers-section {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .customer-picker-list {
      max-height: 180px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .customer-picker-item {
      padding: 0.2rem 0;
    }
    .fw-500 {
      font-weight: 500;
    }
    .industry-tag {
      color: #64748b;
      font-size: 0.8rem;
      margin-left: 0.3rem;
    }
    .spinner-inline {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 0;
      color: #64748b;
      font-size: 0.85rem;
    }
    .empty-hint {
      color: #94a3b8;
      font-size: 0.85rem;
      margin: 0.5rem 0;
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
export class CreateCustomerListDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<CreateCustomerListDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly customerApi = inject(CustomerApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly i18n = inject(I18nService);

  readonly isSubmitting = signal<boolean>(false);
  readonly isLoadingCustomers = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  readonly availableCustomers = signal<CustomerSummary[]>([]);
  readonly selectedCustomerIds = signal<string[]>([]);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  ngOnInit(): void {
    this.customerApi.list({ limit: 100 }).subscribe({
      next: (res) => {
        this.availableCustomers.set(res.data);
        this.isLoadingCustomers.set(false);
      },
      error: () => {
        this.isLoadingCustomers.set(false);
      },
    });
  }

  isCustomerSelected(id: string): boolean {
    return this.selectedCustomerIds().includes(id);
  }

  toggleCustomer(id: string): void {
    const current = this.selectedCustomerIds();
    if (current.includes(id)) {
      this.selectedCustomerIds.set(current.filter((cId) => cId !== id));
    } else {
      this.selectedCustomerIds.set([...current, id]);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload = {
      name: this.form.get('name')!.value!,
      description: this.form.get('description')?.value || undefined,
      customerIds: this.selectedCustomerIds(),
    };

    this.customerApi.createCustomerList(payload).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.snackBar.open(
          this.i18n.t('CUSTOMER_LISTS.LIST_CREATED'),
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
        this.errorMessage.set(err.error?.message || err.message || 'Falha ao criar lista');
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
