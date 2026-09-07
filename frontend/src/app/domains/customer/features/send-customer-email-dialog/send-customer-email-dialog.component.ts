import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerApiService } from '../../services/customer-api.service';
import { ContactItem } from '../../models/customer.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { HtmlEditorComponent } from '../../../../shared/ui/html-editor/html-editor.component';

export interface SendCustomerEmailDialogData {
  customerId: string;
  companyName: string;
  contacts?: ContactItem[];
}

@Component({
  selector: 'app-send-customer-email-dialog',
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
    MatProgressSpinnerModule,
    TranslatePipe,
    HtmlEditorComponent,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header flex-row gap-sm">
        <mat-icon color="primary">email</mat-icon>
        <h2 mat-dialog-title class="m-0">{{ 'EMAIL.DIALOG_TITLE' | translate }}</h2>
      </div>

      <p class="company-badge">{{ 'EMAIL.CUSTOMER_LABEL' | translate }} <strong>{{ data.companyName }}</strong></p>

      <mat-dialog-content>
        <form [formGroup]="form" class="flex-col gap-sm">
          <!-- Recipient selection -->
          @if (data.contacts && data.contacts.length > 0) {
            <mat-form-field appearance="outline">
              <mat-label>{{ 'EMAIL.RECIPIENT_LABEL' | translate }}</mat-label>
              <mat-select formControlName="contactId">
                @for (contact of data.contacts; track contact.id) {
                  <mat-option [value]="contact.id">
                    {{ contact.fullName }} ({{ contact.email }})
                    @if (contact.isPrimary) { [{{ 'CUSTOMER.PRIMARY_CONTACT' | translate }}] }
                  </mat-option>
                }
                <mat-option value="manual">{{ 'EMAIL.CUSTOM_EMAIL' | translate }}</mat-option>
              </mat-select>
            </mat-form-field>
          }

          @if (!data.contacts?.length || form.get('contactId')?.value === 'manual') {
            <mat-form-field appearance="outline">
              <mat-label>{{ 'EMAIL.RECIPIENT_EMAIL' | translate }}</mat-label>
              <input
                matInput
                type="email"
                formControlName="recipientEmail"
                placeholder="nome@empresa.com.br"
              />
              @if (form.get('recipientEmail')?.hasError('email')) {
                <mat-error>{{ 'CUSTOMER.VALIDATION_EMAIL_INVALID' | translate }}</mat-error>
              }
            </mat-form-field>
          }

          <!-- Subject -->
          <mat-form-field appearance="outline">
            <mat-label>{{ 'EMAIL.SUBJECT' | translate }}</mat-label>
            <input
              matInput
              formControlName="subject"
              placeholder="Ex: Proposta Comercial Atualizada"
            />
            @if (form.get('subject')?.hasError('required')) {
              <mat-error>{{ 'EMAIL.VALIDATION_SUBJECT_REQUIRED' | translate }}</mat-error>
            }
          </mat-form-field>

          <!-- Message Body with HTML Editor -->
          <div class="field-container">
            <label class="field-label">{{ 'EMAIL.MESSAGE' | translate }} *</label>
            <app-html-editor
              formControlName="body"
              [placeholder]="'EMAIL.MESSAGE_PLACEHOLDER' | translate"
              minHeight="170px"
              maxHeight="320px"
            ></app-html-editor>
            @if (form.get('body')?.hasError('required') && form.get('body')?.touched) {
              <div class="field-error">{{ 'EMAIL.VALIDATION_BODY_REQUIRED' | translate }}</div>
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
            <mat-icon class="icon-sm mr-xs">send</mat-icon>
          }
          {{ 'EMAIL.SEND_BTN' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 580px;
      max-width: 720px;
    }
    .dialog-header {
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .company-badge {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0 0 1rem;
    }
    .field-container {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 0.5rem;
    }
    .field-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: #475569;
    }
    :host-context(.dark-theme) .field-label {
      color: #94a3b8;
    }
    .field-error {
      font-size: 0.75rem;
      color: #dc2626;
      margin-top: 0.2rem;
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
export class SendCustomerEmailDialogComponent {
  readonly data: SendCustomerEmailDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SendCustomerEmailDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly customerApi = inject(CustomerApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly i18n = inject(I18nService);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    contactId: [''],
    recipientEmail: ['', [Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(2)]],
    body: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor() {
    // Default to primary contact if available
    const primary = this.data.contacts?.find((c) => c.isPrimary) || this.data.contacts?.[0];
    if (primary) {
      this.form.patchValue({ contactId: primary.id });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const contactIdVal = this.form.get('contactId')?.value;
    const recipientEmailVal = this.form.get('recipientEmail')?.value;

    const payload = {
      contactId: contactIdVal !== 'manual' && contactIdVal ? contactIdVal : undefined,
      recipientEmail: (contactIdVal === 'manual' || !this.data.contacts?.length) && recipientEmailVal
        ? recipientEmailVal
        : undefined,
      subject: this.form.get('subject')!.value!,
      body: this.form.get('body')!.value!,
    };

    this.customerApi.sendCustomerEmail(this.data.customerId, payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackBar.open(
          this.i18n.t('EMAIL.SEND_SUCCESS'),
          this.i18n.t('COMMON.CLOSE'),
          {
            duration: 3500,
            panelClass: ['snackbar-success'],
          },
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || err.message || 'Falha ao enviar e-mail');
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
