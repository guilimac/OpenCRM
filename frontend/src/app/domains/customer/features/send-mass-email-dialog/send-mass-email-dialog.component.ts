import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerApiService } from '../../services/customer-api.service';
import { CustomerListItem, MassEmailResult } from '../../models/customer.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

export interface SendMassEmailDialogData {
  list: CustomerListItem;
}

@Component({
  selector: 'app-send-mass-email-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header flex-row gap-sm">
        <mat-icon color="primary">campaign</mat-icon>
        <h2 mat-dialog-title class="m-0">{{ 'EMAIL.MASS_DIALOG_TITLE' | translate }}</h2>
      </div>

      <div class="list-info-banner flex-row space-between align-center">
        <div>
          <span class="list-name">{{ data.list.name }}</span>
          <p class="list-desc">{{ data.list.description || ('COMMON.NO_DESCRIPTION' | translate) }}</p>
        </div>
        <span class="member-badge">
          <mat-icon class="icon-xs">group</mat-icon>
          {{ 'CUSTOMER_LISTS.MEMBERS_COUNT' | translate:{ count: data.list.memberCount } }}
        </span>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="flex-col gap-sm">
          <!-- Variables helper -->
          <div class="variables-bar">
            <span class="vars-label">{{ 'EMAIL.DYNAMIC_VARS_LABEL' | translate }}</span>
            <div class="chips-row">
              @for (tag of templateTags; track tag) {
                <button
                  type="button"
                  class="var-chip"
                  (click)="insertTag(tag)"
                  title="Inserir {{ tag }} no texto"
                >
                  {{ tag }}
                </button>
              }
            </div>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'EMAIL.SUBJECT' | translate }}</mat-label>
            <input
              matInput
              formControlName="subject"
              placeholder="Ex: Comunicado especial para {{ '{{companyName}}' }}"
            />
            @if (form.get('subject')?.hasError('required')) {
              <mat-error>{{ 'EMAIL.VALIDATION_SUBJECT_REQUIRED' | translate }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'EMAIL.BODY_LABEL' | translate }}</mat-label>
            <textarea
              #bodyArea
              matInput
              rows="7"
              formControlName="body"
              placeholder="Olá {{ '{{contactName}}' }}, temos uma novidade para a {{ '{{companyName}}' }}..."
            ></textarea>
            @if (form.get('body')?.hasError('required')) {
              <mat-error>{{ 'EMAIL.VALIDATION_BODY_REQUIRED' | translate }}</mat-error>
            }
          </mat-form-field>

          @if (sendResult()) {
            <div class="success-result">
              <mat-icon class="icon-sm text-green">check_circle</mat-icon>
              <span>
                {{ 'EMAIL.MASS_SUCCESS' | translate:{ count: sendResult()!.sentCount } }}
                @if (sendResult()!.failedCount > 0) {
                  {{ 'EMAIL.FAILURES_COUNT' | translate:{ count: sendResult()!.failedCount } }}
                }
              </span>
            </div>
          }

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
          {{ sendResult() ? ('COMMON.CLOSE' | translate) : ('COMMON.CANCEL' | translate) }}
        </button>
        @if (!sendResult()) {
          <button
            mat-flat-button
            color="primary"
            (click)="onSubmit()"
            [disabled]="form.invalid || isSubmitting() || data.list.memberCount === 0"
          >
            @if (isSubmitting()) {
              <mat-spinner diameter="18" class="mr-sm"></mat-spinner>
            } @else {
              <mat-icon class="icon-sm mr-xs">send</mat-icon>
            }
            {{ 'EMAIL.SEND_MASS_BTN' | translate:{ count: data.list.memberCount } }}
          </button>
        }
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 480px;
      max-width: 600px;
    }
    .dialog-header {
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .list-info-banner {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
    }
    :host-context(.dark-theme) .list-info-banner {
      background: #1e293b;
      border-color: #334155;
    }
    .list-name {
      font-weight: 600;
      font-size: 0.95rem;
    }
    .list-desc {
      color: #64748b;
      font-size: 0.8rem;
      margin: 0.15rem 0 0;
    }
    .member-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: #e0f2fe;
      color: #0369a1;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .variables-bar {
      margin-bottom: 0.5rem;
    }
    .vars-label {
      font-size: 0.75rem;
      color: #64748b;
      display: block;
      margin-bottom: 0.35rem;
    }
    .chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .var-chip {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 0.75rem;
      font-family: monospace;
      color: #0f172a;
      padding: 0.2rem 0.5rem;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    :host-context(.dark-theme) .var-chip {
      background: #334155;
      border-color: #475569;
      color: #e2e8f0;
    }
    .var-chip:hover {
      background: #e2e8f0;
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
    .mr-xs {
      margin-right: 0.25rem;
    }
    .mr-sm {
      margin-right: 0.5rem;
    }
    .icon-xs {
      font-size: 0.9rem;
      width: 0.9rem;
      height: 0.9rem;
      vertical-align: middle;
    }
    .icon-sm {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      vertical-align: middle;
    }
    .text-green {
      color: #16a34a;
    }
    .success-result {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background-color: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 6px;
      color: #15803d;
      font-size: 0.85rem;
      font-weight: 500;
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
export class SendMassEmailDialogComponent {
  readonly data: SendMassEmailDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SendMassEmailDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly customerApi = inject(CustomerApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly i18n = inject(I18nService);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly sendResult = signal<MassEmailResult | null>(null);

  readonly templateTags = [
    '{{companyName}}',
    '{{contactName}}',
    '{{firstName}}',
    '{{email}}',
  ];

  readonly form = this.fb.group({
    subject: ['', [Validators.required, Validators.minLength(2)]],
    body: ['', [Validators.required, Validators.minLength(3)]],
  });

  insertTag(tag: string): void {
    const currentBody = this.form.get('body')?.value || '';
    this.form.patchValue({ body: `${currentBody} ${tag}` });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting() || this.data.list.memberCount === 0) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload = {
      subject: this.form.get('subject')!.value!,
      body: this.form.get('body')!.value!,
    };

    this.customerApi.sendMassEmail(this.data.list.id, payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.sendResult.set(res.data);
        this.snackBar.open(
          this.i18n.t('EMAIL.MASS_SUCCESS', { count: res.data.sentCount }),
          this.i18n.t('COMMON.CLOSE'),
          { duration: 4000, panelClass: ['snackbar-success'] },
        );
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || err.message || 'Falha ao executar disparo em massa');
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(this.sendResult());
  }
}
