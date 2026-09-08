import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  ComboboxCategory,
  ComboboxOptionItem,
} from '../../models/combobox-settings.model';

export interface ComboboxOptionDialogData {
  category: ComboboxCategory;
  categoryTitle: string;
  option?: ComboboxOptionItem;
}

@Component({
  selector: 'app-combobox-option-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    TranslatePipe,
  ],
  template: `
    <div class="option-dialog-container">
      <div class="dialog-header">
        <div class="title-with-icon">
          <div class="header-icon-box">
            <mat-icon>{{ isEditing ? 'edit' : 'add_circle' }}</mat-icon>
          </div>
          <div>
            <h2 mat-dialog-title class="dialog-title">
              {{ isEditing ? ('SETTINGS.EDIT_OPTION' | translate) : ('SETTINGS.NEW_OPTION' | translate) }}
            </h2>
            <p class="dialog-subtitle">
              {{ data.categoryTitle }}
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="form" class="option-form">
          <!-- Internal Value / Key -->
          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.OPTION_VALUE' | translate }}</mat-label>
            <input
              matInput
              formControlName="value"
              placeholder="Ex: TECNOLOGIA_CLOUD, 45_DIAS"
              [readonly]="isEditing"
            />
            <mat-icon matPrefix>vpn_key</mat-icon>
            <mat-hint>
              {{ isEditing ? ('SETTINGS.VALUE_READONLY_HINT' | translate) : ('SETTINGS.VALUE_HINT' | translate) }}
            </mat-hint>
            @if (form.get('value')?.hasError('required') && form.get('value')?.touched) {
              <mat-error>{{ 'SETTINGS.REQUIRED_FIELD' | translate }}</mat-error>
            }
          </mat-form-field>

          <!-- Display Label -->
          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.OPTION_LABEL' | translate }}</mat-label>
            <input
              matInput
              formControlName="label"
              placeholder="Ex: Tecnologia Cloud & SaaS"
            />
            <mat-icon matPrefix>label</mat-icon>
            <mat-hint>{{ 'SETTINGS.LABEL_HINT' | translate }}</mat-hint>
            @if (form.get('label')?.hasError('required') && form.get('label')?.touched) {
              <mat-error>{{ 'SETTINGS.REQUIRED_FIELD' | translate }}</mat-error>
            }
          </mat-form-field>

          <!-- Order Index and Status -->
          <div class="form-row-split">
            <mat-form-field appearance="outline" class="order-field">
              <mat-label>{{ 'SETTINGS.ORDER_INDEX' | translate }}</mat-label>
              <input
                matInput
                type="number"
                min="0"
                formControlName="orderIndex"
              />
              <mat-icon matPrefix>format_list_numbered</mat-icon>
            </mat-form-field>

            <div class="active-toggle-box">
              <mat-slide-toggle formControlName="isActive" color="primary">
                {{ form.get('isActive')?.value ? ('COMMON.ACTIVE' | translate) : ('COMMON.INACTIVE' | translate) }}
              </mat-slide-toggle>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button mat-dialog-close>
          {{ 'COMMON.CANCEL' | translate }}
        </button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="form.invalid"
          (click)="save()"
        >
          <mat-icon>save</mat-icon>
          {{ 'COMMON.SAVE' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .option-dialog-container {
      width: 100%;
      min-width: 440px;
      max-width: 520px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid var(--mat-sys-outline-variant, #e0e2ec);
    }

    .title-with-icon {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .header-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--mat-sys-primary-container, #eaddff);
      color: var(--mat-sys-on-primary-container, #21005d);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface, #1d1b20);
    }

    .dialog-subtitle {
      margin: 4px 0 0 0;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant, #49454f);
    }

    .dialog-content {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .option-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 8px;
    }

    .form-row-split {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .order-field {
      flex: 1;
    }

    .active-toggle-box {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: var(--mat-sys-surface-container-low, #f7f2fa);
      border-radius: 8px;
      height: 56px;
      box-sizing: border-box;
      margin-bottom: 22px;
    }

    .dialog-actions {
      padding: 16px 24px 24px 24px;
      border-top: 1px solid var(--mat-sys-outline-variant, #e0e2ec);
      gap: 12px;
    }

    @media (max-width: 600px) {
      .option-dialog-container {
        min-width: 100%;
      }
      .form-row-split {
        flex-direction: column;
        align-items: stretch;
      }
      .active-toggle-box {
        margin-bottom: 0;
      }
    }
  `],
})
export class ComboboxOptionDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ComboboxOptionDialogComponent>);
  readonly data: ComboboxOptionDialogData = inject(MAT_DIALOG_DATA);

  readonly isEditing = !!this.data.option;

  readonly form: FormGroup = this.fb.group({
    value: [
      this.data.option?.value || '',
      [Validators.required, Validators.pattern(/^[A-Za-z0-9_\-\.\sáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$/)],
    ],
    label: [this.data.option?.label || '', [Validators.required]],
    orderIndex: [this.data.option?.orderIndex ?? 0, [Validators.min(0)]],
    isActive: [this.data.option?.isActive ?? true],
  });

  save(): void {
    if (this.form.invalid) return;
    const formVal = this.form.getRawValue();
    this.dialogRef.close({
      value: formVal.value.trim(),
      label: formVal.label.trim(),
      orderIndex: Number(formVal.orderIndex),
      isActive: Boolean(formVal.isActive),
    });
  }
}
