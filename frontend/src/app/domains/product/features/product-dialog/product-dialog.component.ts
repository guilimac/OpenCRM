import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProductItem } from '../../models/product.model';

export interface ProductDialogData {
  product?: ProductItem;
}

@Component({
  selector: 'app-product-dialog',
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
    MatSlideToggleModule,
  ],
  template: `
    <div class="product-dialog-container">
      <div class="dialog-header">
        <div class="title-with-icon">
          <div class="header-icon-box">
            <mat-icon>{{ isEditing ? 'edit' : 'inventory_2' }}</mat-icon>
          </div>
          <div>
            <h2 mat-dialog-title class="dialog-title">
              {{ isEditing ? 'Editar Item do Catálogo' : 'Novo Produto ou Serviço' }}
            </h2>
            <p class="dialog-subtitle">
              Cadastre itens para utilização em orçamentos, propostas e controle de catálogo.
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="form" class="product-form">
          <!-- Row 1: Code and Name -->
          <div class="form-row-2col">
            <mat-form-field appearance="outline">
              <mat-label>Código / SKU</mat-label>
              <input matInput formControlName="code" placeholder="Ex: PRD-001, SRV-CLOUD" />
              <mat-icon matPrefix>tag</mat-icon>
              @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
                <mat-error>O código/SKU é obrigatório</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nome do Produto ou Serviço</mat-label>
              <input matInput formControlName="name" placeholder="Ex: Licença OpenCRM Cloud Enterprise" />
              <mat-icon matPrefix>inventory</mat-icon>
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>O nome é obrigatório</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Row 2: Category, Price, Unit -->
          <div class="form-row-3col">
            <mat-form-field appearance="outline">
              <mat-label>Categoria</mat-label>
              <mat-select formControlName="category">
                <mat-option value="PRODUTO">Produto</mat-option>
                <mat-option value="SERVICO">Serviço</mat-option>
                <mat-option value="SOFTWARE">Software / SaaS</mat-option>
                <mat-option value="CONSULTORIA">Consultoria</mat-option>
                <mat-option value="SUPORTE">Suporte & Manutenção</mat-option>
              </mat-select>
              <mat-icon matPrefix>category</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Preço Unitário (R$)</mat-label>
              <input matInput type="number" min="0" step="0.01" formControlName="unitPrice" />
              <mat-icon matPrefix>payments</mat-icon>
              @if (form.get('unitPrice')?.hasError('min')) {
                <mat-error>O preço deve ser positivo</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Unidade de Medida</mat-label>
              <mat-select formControlName="unit">
                <mat-option value="un">Unidade (un)</mat-option>
                <mat-option value="hora">Hora</mat-option>
                <mat-option value="mês">Mês</mat-option>
                <mat-option value="ano">Ano</mat-option>
                <mat-option value="licença">Licença</mat-option>
                <mat-option value="projeto">Projeto</mat-option>
              </mat-select>
              <mat-icon matPrefix>straighten</mat-icon>
            </mat-form-field>
          </div>

          <!-- Description -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Descrição do Item</mat-label>
            <textarea
              matInput
              rows="3"
              formControlName="description"
              placeholder="Descreva detalhes, especificações técnicas ou escopo de entrega..."
            ></textarea>
            <mat-icon matPrefix>description</mat-icon>
          </mat-form-field>

          <!-- Active Toggle -->
          <div class="active-toggle-box">
            <mat-slide-toggle formControlName="isActive" color="primary">
              <span class="toggle-label">Item ativo no catálogo comercial</span>
            </mat-slide-toggle>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="form.invalid"
          (click)="save()"
        >
          <mat-icon>check</mat-icon>
          {{ isEditing ? 'Salvar Alterações' : 'Cadastrar Produto' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .product-dialog-container {
        display: flex;
        flex-direction: column;
        max-width: 680px;
        width: 100%;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem 1rem 1.5rem;
        border-bottom: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
      }

      .title-with-icon {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }

      .header-icon-box {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        background: #2563eb14;
        color: #2563eb;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dialog-title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--mat-sys-on-surface, #111827);
      }

      .dialog-subtitle {
        margin: 0.2rem 0 0 0;
        font-size: 0.8125rem;
        color: var(--mat-sys-outline, #6b7280);
      }

      .dialog-content {
        padding: 1.5rem;
        overflow-y: auto;
      }

      .product-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-row-2col {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 1rem;
      }

      .form-row-3col {
        display: grid;
        grid-template-columns: 1.2fr 1fr 1fr;
        gap: 1rem;
      }

      @media (max-width: 600px) {
        .form-row-2col,
        .form-row-3col {
          grid-template-columns: 1fr;
        }
      }

      .w-full {
        width: 100%;
      }

      .active-toggle-box {
        padding: 0.5rem 0.25rem;
      }

      .toggle-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--mat-sys-on-surface, #374151);
      }

      .dialog-actions {
        padding: 0.85rem 1.5rem;
        border-top: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
      }
    `,
  ],
})
export class ProductDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProductDialogComponent>);
  private readonly data = inject<ProductDialogData>(MAT_DIALOG_DATA, { optional: true });

  readonly isEditing = !!this.data?.product;

  form: FormGroup = this.fb.group({
    code: [this.data?.product?.code || '', [Validators.required, Validators.minLength(2)]],
    name: [this.data?.product?.name || '', [Validators.required, Validators.minLength(2)]],
    category: [this.data?.product?.category || 'PRODUTO', Validators.required],
    unitPrice: [this.data?.product?.unitPrice ?? 0, [Validators.required, Validators.min(0)]],
    unit: [this.data?.product?.unit || 'un', Validators.required],
    description: [this.data?.product?.description || ''],
    isActive: [this.data?.product?.isActive !== undefined ? this.data.product.isActive : true],
  });

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }
}
