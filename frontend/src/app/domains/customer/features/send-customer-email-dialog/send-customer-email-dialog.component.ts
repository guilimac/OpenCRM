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
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header flex-row gap-sm">
        <mat-icon color="primary">email</mat-icon>
        <h2 mat-dialog-title class="m-0">Enviar E-mail Comercial</h2>
      </div>

      <p class="company-badge">Cliente: <strong>{{ data.companyName }}</strong></p>

      <mat-dialog-content>
        <form [formGroup]="form" class="flex-col gap-sm">
          <!-- Recipient selection -->
          @if (data.contacts && data.contacts.length > 0) {
            <mat-form-field appearance="outline">
              <mat-label>Destinatário (Contato)</mat-label>
              <mat-select formControlName="contactId">
                @for (contact of data.contacts; track contact.id) {
                  <mat-option [value]="contact.id">
                    {{ contact.fullName }} ({{ contact.email }})
                    @if (contact.isPrimary) { [Principal] }
                  </mat-option>
                }
                <mat-option value="manual">Outro e-mail personalizado...</mat-option>
              </mat-select>
            </mat-form-field>
          }

          @if (!data.contacts?.length || form.get('contactId')?.value === 'manual') {
            <mat-form-field appearance="outline">
              <mat-label>E-mail do Destinatário</mat-label>
              <input
                matInput
                type="email"
                formControlName="recipientEmail"
                placeholder="nome@empresa.com.br"
              />
              @if (form.get('recipientEmail')?.hasError('email')) {
                <mat-error>Informe um e-mail válido</mat-error>
              }
            </mat-form-field>
          }

          <!-- Subject -->
          <mat-form-field appearance="outline">
            <mat-label>Assunto</mat-label>
            <input
              matInput
              formControlName="subject"
              placeholder="Ex: Proposta Comercial Atualizada"
            />
            @if (form.get('subject')?.hasError('required')) {
              <mat-error>O assunto é obrigatório</mat-error>
            }
          </mat-form-field>

          <!-- Message Body -->
          <mat-form-field appearance="outline">
            <mat-label>Mensagem</mat-label>
            <textarea
              matInput
              rows="6"
              formControlName="body"
              placeholder="Escreva a mensagem aqui..."
            ></textarea>
            @if (form.get('body')?.hasError('required')) {
              <mat-error>A mensagem é obrigatória</mat-error>
            }
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
            <mat-icon class="icon-sm mr-xs">send</mat-icon>
          }
          Enviar E-mail
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 440px;
      max-width: 560px;
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
        this.snackBar.open('E-mail enviado com sucesso!', 'Fechar', {
          duration: 3500,
          panelClass: ['snackbar-success'],
        });
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
