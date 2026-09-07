import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomerApiService } from '../../../customer/services/customer-api.service';
import { OpportunityApiService } from '../../../opportunity/services/opportunity-api.service';
import { ProductApiService } from '../../../product/services/product-api.service';
import { CustomerSummary } from '../../../customer/models/customer.model';
import { OpportunityItem } from '../../../opportunity/models/opportunity.model';
import { ProductItem } from '../../../product/models/product.model';

export interface BudgetDialogData {
  preselectedCustomerId?: string;
  preselectedOpportunityId?: string;
}

@Component({
  selector: 'app-budget-dialog',
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
    MatTooltipModule,
  ],
  template: `
    <div class="budget-dialog-container">
      <div class="dialog-header">
        <div class="title-with-icon">
          <div class="header-icon-box">
            <mat-icon>request_quote</mat-icon>
          </div>
          <div>
            <h2 mat-dialog-title class="dialog-title">Novo Orçamento & Proposta Comercial</h2>
            <p class="dialog-subtitle">
              Monte propostas personalizadas com produtos do catálogo, descontos e condições comerciais.
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="form" class="budget-form">
          <!-- General Proposal Info -->
          <div class="form-section">
            <span class="section-title">1. Dados da Proposta & Cliente</span>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Título da Proposta</mat-label>
              <input
                matInput
                formControlName="title"
                placeholder="Ex: Proposta de Implantação OpenCRM & Treinamento"
              />
              <mat-icon matPrefix>description</mat-icon>
            </mat-form-field>

            <div class="form-row-2col">
              <!-- Customer Selector -->
              <mat-form-field appearance="outline">
                <mat-label>Cliente / Conta</mat-label>
                <mat-select formControlName="customerId">
                  @for (c of customers(); track c.id) {
                    <mat-option [value]="c.id">{{ c.companyName }}</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>business</mat-icon>
              </mat-form-field>

              <!-- Optional Opportunity Link -->
              <mat-form-field appearance="outline">
                <mat-label>Oportunidade de Vendas (Opcional)</mat-label>
                <mat-select formControlName="opportunityId">
                  <mat-option [value]="null">Nenhuma vinculada</mat-option>
                  @for (opp of opportunities(); track opp.id) {
                    <mat-option [value]="opp.id">{{ opp.title }}</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>trending_up</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-row-2col">
              <mat-form-field appearance="outline">
                <mat-label>Data de Emissão</mat-label>
                <input matInput type="date" formControlName="issueDate" />
                <mat-icon matPrefix>calendar_today</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Validade da Proposta</mat-label>
                <input matInput type="date" formControlName="validUntil" />
                <mat-icon matPrefix>event</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Items Builder Section -->
          <div class="form-section">
            <div class="section-header-row">
              <span class="section-title">2. Itens do Orçamento</span>
              <button
                type="button"
                mat-stroked-button
                color="primary"
                class="add-item-btn"
                (click)="addItem()"
              >
                <mat-icon>add</mat-icon>
                Adicionar Item
              </button>
            </div>

            <div class="items-table-container">
              @if (itemsArray.length === 0) {
                <div class="empty-items-notice">
                  <mat-icon>playlist_add</mat-icon>
                  <span>Nenhum item adicionado. Clique no botão acima para adicionar produtos ou serviços.</span>
                </div>
              } @else {
                <div formArrayName="items" class="items-list">
                  @for (itemGroup of itemsArray.controls; track itemGroup; let idx = $index) {
                    <div [formGroupName]="idx" class="item-card-row">
                      <div class="item-grid">
                        <!-- Product catalog picker -->
                        <mat-form-field appearance="outline" class="col-product">
                          <mat-label>Selecionar do Catálogo</mat-label>
                          <mat-select
                            formControlName="productId"
                            (selectionChange)="onProductSelected(idx, $event.value)"
                          >
                            <mat-option [value]="null">Item personalizado</mat-option>
                            @for (p of catalogProducts(); track p.id) {
                              <mat-option [value]="p.id">
                                {{ p.code }} - {{ p.name }} ({{ formatCurrency(p.unitPrice) }})
                              </mat-option>
                            }
                          </mat-select>
                        </mat-form-field>

                        <!-- Description -->
                        <mat-form-field appearance="outline" class="col-desc">
                          <mat-label>Descrição do Item</mat-label>
                          <input matInput formControlName="description" placeholder="Ex: Licença ou Serviço" />
                        </mat-form-field>

                        <!-- Quantity -->
                        <mat-form-field appearance="outline" class="col-qty">
                          <mat-label>Qtd</mat-label>
                          <input matInput type="number" min="1" formControlName="quantity" />
                        </mat-form-field>

                        <!-- Unit Price -->
                        <mat-form-field appearance="outline" class="col-price">
                          <mat-label>Preço Unit.</mat-label>
                          <input matInput type="number" min="0" step="0.01" formControlName="unitPrice" />
                        </mat-form-field>

                        <!-- Discount % -->
                        <mat-form-field appearance="outline" class="col-disc">
                          <mat-label>Desc (%)</mat-label>
                          <input matInput type="number" min="0" max="100" formControlName="discountPercent" />
                        </mat-form-field>

                        <!-- Total display & delete button -->
                        <div class="col-total-action">
                          <div class="row-total">
                            <span class="tot-label">Total:</span>
                            <span class="tot-value">{{ formatCurrency(getItemTotal(idx)) }}</span>
                          </div>
                          <button
                            type="button"
                            mat-icon-button
                            color="warn"
                            (click)="removeItem(idx)"
                            matTooltip="Remover este item"
                          >
                            <mat-icon>delete_outline</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Commercial Terms & Financial Summary -->
          <div class="bottom-split-grid">
            <div class="terms-fields">
              <span class="section-title">3. Condições Comerciais</span>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Condições de Pagamento</mat-label>
                <input
                  matInput
                  formControlName="paymentTerms"
                  placeholder="Ex: 30 dias líquido ou 50% na entrada + 50% na entrega"
                />
                <mat-icon matPrefix>credit_card</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Observações / Termos Gerais</mat-label>
                <textarea
                  matInput
                  rows="2"
                  formControlName="notes"
                  placeholder="Notas adicionais sobre escopo, prazos ou garantias..."
                ></textarea>
                <mat-icon matPrefix>notes</mat-icon>
              </mat-form-field>
            </div>

            <!-- Financial Live Summary -->
            <div class="totals-summary-card">
              <div class="summary-header">
                <mat-icon>monetization_on</mat-icon>
                <span>Resumo Financeiro</span>
              </div>

              <div class="summary-line">
                <span>Subtotal dos Itens:</span>
                <strong>{{ formatCurrency(computedSubtotal()) }}</strong>
              </div>

              <div class="summary-line">
                <span>Desconto Global (R$):</span>
                <div class="discount-input-wrap">
                  <input
                    type="number"
                    min="0"
                    formControlName="discountAmount"
                    class="discount-input"
                  />
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="summary-line grand-total">
                <span>VALOR TOTAL:</span>
                <span class="total-highlight">{{ formatCurrency(computedNetTotal()) }}</span>
              </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="form.invalid || itemsArray.length === 0"
          (click)="save()"
        >
          <mat-icon>check</mat-icon>
          Gerar Orçamento
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .budget-dialog-container {
        display: flex;
        flex-direction: column;
        max-width: 960px;
        width: 100%;
        max-height: 90vh;
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
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: #2563eb14;
        color: #2563eb;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dialog-title {
        margin: 0;
        font-size: 1.25rem;
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
        max-height: calc(90vh - 150px);
      }

      .budget-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .form-section {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .section-title {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--mat-sys-on-surface, #374151);
      }

      .section-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .add-item-btn {
        border-radius: 8px;
        font-size: 0.8125rem;
      }

      .form-row-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      @media (max-width: 720px) {
        .form-row-2col {
          grid-template-columns: 1fr;
        }
      }

      .w-full {
        width: 100%;
      }

      /* Items List */
      .items-table-container {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .empty-items-notice {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 2rem;
        border: 2px dashed var(--mat-sys-outline-variant, #e5e7eb);
        border-radius: 12px;
        color: var(--mat-sys-outline, #6b7280);
        font-size: 0.875rem;
      }

      .items-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .item-card-row {
        background: var(--mat-sys-surface, #ffffff);
        border: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
        border-radius: 10px;
        padding: 0.75rem 1rem 0.25rem 1rem;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
      }

      .item-grid {
        display: grid;
        grid-template-columns: 1.5fr 2fr 0.75fr 1fr 0.8fr 1.3fr;
        gap: 0.75rem;
        align-items: center;
      }

      @media (max-width: 840px) {
        .item-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      .col-total-action {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding-bottom: 1.25rem;
      }

      .row-total {
        display: flex;
        flex-direction: column;
      }

      .tot-label {
        font-size: 0.7rem;
        color: var(--mat-sys-outline, #6b7280);
        text-transform: uppercase;
      }

      .tot-value {
        font-weight: 700;
        font-size: 0.9375rem;
        color: #111827;
      }

      /* Bottom split grid */
      .bottom-split-grid {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 1.5rem;
      }

      @media (max-width: 760px) {
        .bottom-split-grid {
          grid-template-columns: 1fr;
        }
      }

      .terms-fields {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .totals-summary-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        height: fit-content;
      }

      .summary-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        font-weight: 700;
        color: #2563eb;
      }

      .summary-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
        color: #475569;
      }

      .discount-input-wrap {
        width: 100px;
      }

      .discount-input {
        width: 100%;
        padding: 0.35rem 0.5rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 0.875rem;
        text-align: right;
        outline: none;
      }

      .discount-input:focus {
        border-color: #2563eb;
      }

      .grand-total {
        font-size: 1.1rem;
        font-weight: 800;
        color: #0f172a;
        margin-top: 0.25rem;
      }

      .total-highlight {
        color: #2563eb;
        font-size: 1.25rem;
      }

      .dialog-actions {
        padding: 0.85rem 1.5rem;
        border-top: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
      }
    `,
  ],
})
export class BudgetDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<BudgetDialogComponent>);
  private readonly data = inject<BudgetDialogData>(MAT_DIALOG_DATA, { optional: true });

  private readonly customerApi = inject(CustomerApiService);
  private readonly opportunityApi = inject(OpportunityApiService);
  private readonly productApi = inject(ProductApiService);

  customers = signal<CustomerSummary[]>([]);
  opportunities = signal<OpportunityItem[]>([]);
  catalogProducts = signal<ProductItem[]>([]);

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    customerId: [this.data?.preselectedCustomerId || '', Validators.required],
    opportunityId: [this.data?.preselectedOpportunityId || null],
    issueDate: [new Date().toISOString().split('T')[0], Validators.required],
    validUntil: [
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      Validators.required,
    ],
    items: this.fb.array([]),
    discountAmount: [0, [Validators.min(0)]],
    paymentTerms: ['30 dias líquido'],
    notes: ['Valores válidos por 30 dias.'],
  });

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.customerApi.list({ limit: 1000 }).subscribe((res) => this.customers.set(res.data || []));
    this.opportunityApi.list().subscribe((res) => this.opportunities.set(res || []));
    this.productApi.list({ isActive: true }).subscribe((res) => this.catalogProducts.set(res || []));

    // Pre-populate one item by default
    this.addItem();
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      productId: [null],
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
    });
    this.itemsArray.push(itemGroup);
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  onProductSelected(index: number, productId: string | null): void {
    if (!productId) return;
    const prod = this.catalogProducts().find((p) => p.id === productId);
    if (prod) {
      const group = this.itemsArray.at(index);
      group.patchValue({
        description: prod.name,
        unitPrice: prod.unitPrice,
      });
    }
  }

  getItemTotal(index: number): number {
    const group = this.itemsArray.at(index);
    if (!group) return 0;
    const qty = Number(group.get('quantity')?.value) || 0;
    const price = Number(group.get('unitPrice')?.value) || 0;
    const disc = Number(group.get('discountPercent')?.value) || 0;
    const total = qty * price * (1 - disc / 100);
    return Math.round(total * 100) / 100;
  }

  computedSubtotal(): number {
    let sum = 0;
    for (let i = 0; i < this.itemsArray.length; i++) {
      sum += this.getItemTotal(i);
    }
    return Math.round(sum * 100) / 100;
  }

  computedNetTotal(): number {
    const sub = this.computedSubtotal();
    const disc = Number(this.form.get('discountAmount')?.value) || 0;
    return Math.max(0, Math.round((sub - disc) * 100) / 100);
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  }

  save(): void {
    if (this.form.invalid || this.itemsArray.length === 0) return;
    this.dialogRef.close(this.form.value);
  }
}
