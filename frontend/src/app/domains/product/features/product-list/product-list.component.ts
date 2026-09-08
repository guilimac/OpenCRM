import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductApiService } from '../../services/product-api.service';
import { ProductItem } from '../../models/product.model';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';
import { ComboboxOptionsService } from '../../../../core/services/combobox-options.service';
import { ComboboxCategory } from '../../../settings/models/combobox-settings.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="product-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-titles">
          <div class="header-badge">
            <mat-icon>inventory_2</mat-icon>
            <span>Catálogo Comercial</span>
          </div>
          <h1 class="page-title">Produtos & Serviços</h1>
          <p class="page-subtitle">
            Gerencie o catálogo de soluções, licenças e serviços para composição ágil de propostas e orçamentos.
          </p>
        </div>

        <button mat-flat-button color="primary" class="new-btn" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          <span>Novo Item</span>
        </button>
      </div>

      <!-- Filters Toolbar -->
      <div class="filters-card">
        <div class="search-field-wrapper">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            class="search-input"
            placeholder="Pesquisar por código, nome ou descrição..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilter()"
          />
          @if (searchQuery) {
            <button mat-icon-button class="clear-btn" (click)="searchQuery = ''; applyFilter()">
              <mat-icon>clear</mat-icon>
            </button>
          }
        </div>

        <div class="category-filter-wrapper">
          <mat-form-field appearance="outline" class="category-select">
            <mat-label>Categoria</mat-label>
            <mat-select [(ngModel)]="selectedCategory" (selectionChange)="applyFilter()">
              <mat-option value="">Todas as categorias</mat-option>
              @for (cat of categories(); track cat.id) {
                <mat-option [value]="cat.value">{{ cat.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Products Table -->
      <div class="table-card">
        @if (filteredProducts().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">inventory_2</mat-icon>
            <h3>Nenhum produto ou serviço encontrado</h3>
            <p>Cadastre novos itens no catálogo para utilizá-los na montagem de orçamentos.</p>
            <button mat-flat-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Cadastrar Primeiro Item
            </button>
          </div>
        } @else {
          <div class="table-responsive">
            <table mat-table [dataSource]="filteredProducts()" class="product-table">
              <!-- Code Column -->
              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef>Código / SKU</th>
                <td mat-cell *matCellDef="let p">
                  <span class="code-badge">{{ p.code }}</span>
                </td>
              </ng-container>

              <!-- Name & Description Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nome & Descrição</th>
                <td mat-cell *matCellDef="let p">
                  <div class="name-cell">
                    <span class="product-name">{{ p.name }}</span>
                    @if (p.description) {
                      <span class="product-desc">{{ p.description }}</span>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Categoria</th>
                <td mat-cell *matCellDef="let p">
                  <span class="category-chip" [class]="'cat-' + p.category.toLowerCase()">
                    {{ getCategoryLabel(p.category) }}
                  </span>
                </td>
              </ng-container>

              <!-- Unit Price Column -->
              <ng-container matColumnDef="unitPrice">
                <th mat-header-cell *matHeaderCellDef>Preço Unitário</th>
                <td mat-cell *matCellDef="let p" class="price-cell">
                  <strong>{{ formatPrice(p.unitPrice) }}</strong>
                  <span class="unit-tag">/ {{ p.unit }}</span>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let p">
                  <span class="status-indicator" [class.active]="p.isActive">
                    {{ p.isActive ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="actions-th">Ações</th>
                <td mat-cell *matCellDef="let p" class="actions-td">
                  <button
                    mat-icon-button
                    color="primary"
                    matTooltip="Editar item"
                    (click)="openEditDialog(p)"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    matTooltip="Excluir item"
                    (click)="deleteProduct(p)"
                  >
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .product-page {
        padding: 1.5rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .header-titles {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #2563eb;
        background: #2563eb12;
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
        width: fit-content;
      }

      .header-badge mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0;
        color: var(--mat-sys-on-surface, #111827);
        letter-spacing: -0.02em;
      }

      .page-subtitle {
        font-size: 0.875rem;
        color: var(--mat-sys-outline, #6b7280);
        margin: 0;
        max-width: 650px;
      }

      .new-btn {
        height: 42px;
        border-radius: 10px;
        font-weight: 600;
        padding: 0 1.25rem;
      }

      /* Filter Card */
      .filters-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        background: var(--mat-sys-surface, #ffffff);
        padding: 0.75rem 1rem;
        border-radius: 12px;
        border: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
      }

      .search-field-wrapper {
        flex: 1;
        min-width: 250px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--mat-sys-surface-variant, #f3f4f6);
        border-radius: 8px;
        padding: 0 0.75rem;
        height: 44px;
      }

      .search-icon {
        color: var(--mat-sys-outline, #9ca3af);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .search-input {
        border: none;
        background: transparent;
        outline: none;
        width: 100%;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface, #1f2937);
      }

      .clear-btn {
        width: 28px;
        height: 28px;
        line-height: 28px;
      }

      .clear-btn mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .category-filter-wrapper {
        width: 220px;
      }

      .category-select {
        width: 100%;
        margin-bottom: -1.25em;
      }

      /* Table */
      .table-card {
        background: var(--mat-sys-surface, #ffffff);
        border: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      }

      .table-responsive {
        overflow-x: auto;
      }

      .product-table {
        width: 100%;
      }

      .code-badge {
        font-family: monospace;
        font-size: 0.8125rem;
        font-weight: 600;
        background: var(--mat-sys-surface-variant, #f1f5f9);
        color: var(--mat-sys-on-surface, #334155);
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
      }

      .name-cell {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        padding: 0.5rem 0;
      }

      .product-name {
        font-weight: 600;
        color: var(--mat-sys-on-surface, #111827);
        font-size: 0.9375rem;
      }

      .product-desc {
        font-size: 0.775rem;
        color: var(--mat-sys-outline, #6b7280);
      }

      .category-chip {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .cat-software {
        background: #2563eb14;
        color: #2563eb;
      }

      .cat-servico {
        background: #0d948814;
        color: #0d9488;
      }

      .cat-consultoria {
        background: #8b5cf614;
        color: #8b5cf6;
      }

      .cat-produto {
        background: #f59e0b14;
        color: #d97706;
      }

      .cat-suporte {
        background: #10b98114;
        color: #059669;
      }

      .price-cell {
        white-space: nowrap;
      }

      .unit-tag {
        font-size: 0.75rem;
        color: var(--mat-sys-outline, #6b7280);
        margin-left: 0.25rem;
      }

      .status-indicator {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
        background: #ef444414;
        color: #ef4444;
      }

      .status-indicator.active {
        background: #10b98114;
        color: #059669;
      }

      .actions-th {
        text-align: right;
      }

      .actions-td {
        text-align: right;
        white-space: nowrap;
      }

      /* Empty State */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
      }

      .empty-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        color: #2563eb;
        opacity: 0.4;
        margin-bottom: 0.75rem;
      }

      .empty-state h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.15rem;
      }

      .empty-state p {
        margin: 0 0 1.25rem 0;
        color: var(--mat-sys-outline, #6b7280);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class ProductListComponent implements OnInit {
  private readonly productApi = inject(ProductApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly comboboxService = inject(ComboboxOptionsService);

  readonly categories = this.comboboxService.getOptions(ComboboxCategory.PRODUCT_CATEGORY);

  displayedColumns = ['code', 'name', 'category', 'unitPrice', 'status', 'actions'];

  products = signal<ProductItem[]>([]);
  filteredProducts = signal<ProductItem[]>([]);
  searchQuery = '';
  selectedCategory = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productApi.list().subscribe({
      next: (items) => {
        this.products.set(items);
        this.applyFilter();
      },
      error: () => {
        this.snackBar.open('Erro ao carregar catálogo de produtos', 'Fechar', { duration: 4000 });
      },
    });
  }

  applyFilter(): void {
    let result = this.products();

    if (this.selectedCategory) {
      result = result.filter((p) => p.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)),
      );
    }

    this.filteredProducts.set(result);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.productApi.create(res).subscribe({
          next: () => {
            this.snackBar.open('Produto cadastrado com sucesso!', 'OK', { duration: 3000 });
            this.loadProducts();
          },
          error: (err) => {
            const msg = err.error?.message || 'Erro ao cadastrar produto';
            this.snackBar.open(msg, 'Fechar', { duration: 4000 });
          },
        });
      }
    });
  }

  openEditDialog(product: ProductItem): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { product },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.productApi.update(product.id, res).subscribe({
          next: () => {
            this.snackBar.open('Produto atualizado com sucesso!', 'OK', { duration: 3000 });
            this.loadProducts();
          },
          error: (err) => {
            const msg = err.error?.message || 'Erro ao atualizar produto';
            this.snackBar.open(msg, 'Fechar', { duration: 4000 });
          },
        });
      }
    });
  }

  deleteProduct(product: ProductItem): void {
    if (confirm(`Deseja realmente excluir o item "${product.name}"?`)) {
      this.productApi.delete(product.id).subscribe({
        next: () => {
          this.snackBar.open('Item removido com sucesso', 'OK', { duration: 3000 });
          this.loadProducts();
        },
        error: (err) => {
          const msg = err.error?.message || 'Erro ao remover produto';
          this.snackBar.open(msg, 'Fechar', { duration: 4000 });
        },
      });
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price || 0);
  }

  getCategoryLabel(category: string): string {
    const map: Record<string, string> = {
      PRODUTO: 'Produto',
      SERVICO: 'Serviço',
      SOFTWARE: 'Software',
      CONSULTORIA: 'Consultoria',
      SUPORTE: 'Suporte',
    };
    return map[category] || category;
  }
}
