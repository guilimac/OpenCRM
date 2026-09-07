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
import { MatMenuModule } from '@angular/material/menu';
import { BudgetApiService } from '../../services/budget-api.service';
import { CustomerApiService } from '../../../customer/services/customer-api.service';
import { BudgetDetail, BudgetStatus } from '../../models/budget.model';
import { CustomerSummary } from '../../../customer/models/customer.model';
import { BudgetDialogComponent } from '../budget-dialog/budget-dialog.component';
import { BudgetDetailDialogComponent } from '../budget-detail-dialog/budget-detail-dialog.component';

@Component({
  selector: 'app-budget-list',
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
    MatMenuModule,
  ],
  template: `
    <div class="budget-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-titles">
          <div class="header-badge">
            <mat-icon>request_quote</mat-icon>
            <span>Gestão Comercial</span>
          </div>
          <h1 class="page-title">Orçamentos & Propostas</h1>
          <p class="page-subtitle">
            Crie propostas comerciais formais, acompanhe status de negociação e gere documentos de fechamento.
          </p>
        </div>

        <button mat-flat-button color="primary" class="new-btn" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          <span>Novo Orçamento</span>
        </button>
      </div>

      <!-- KPI Ribbon for Budgets -->
      <div class="kpi-ribbon">
        <div class="kpi-card highlight-blue">
          <div class="kpi-icon-badge blue">
            <mat-icon>request_quote</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Propostas Emitidas</span>
            <span class="kpi-num">{{ budgets().length }}</span>
            <span class="kpi-sub">Total de orçamentos gerados</span>
          </div>
        </div>

        <div class="kpi-card highlight-emerald">
          <div class="kpi-icon-badge emerald">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Volume Aprovado</span>
            <span class="kpi-num">{{ formatCurrency(totalApprovedValue()) }}</span>
            <span class="kpi-sub">{{ approvedCount() }} propostas fechadas</span>
          </div>
        </div>

        <div class="kpi-card highlight-amber">
          <div class="kpi-icon-badge amber">
            <mat-icon>send</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Em Negociação</span>
            <span class="kpi-num">{{ formatCurrency(totalInNegotiationValue()) }}</span>
            <span class="kpi-sub">{{ inNegotiationCount() }} orçamentos enviados</span>
          </div>
        </div>

        <div class="kpi-card highlight-purple">
          <div class="kpi-icon-badge purple">
            <mat-icon>percent</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Taxa de Conversão</span>
            <span class="kpi-num">{{ conversionRate() }}%</span>
            <span class="kpi-sub">Aprovados vs Total</span>
          </div>
        </div>
      </div>

      <!-- Filter Toolbar -->
      <div class="filters-card">
        <div class="search-field-wrapper">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            class="search-input"
            placeholder="Pesquisar por número ou título da proposta..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilter()"
          />
          @if (searchQuery) {
            <button mat-icon-button class="clear-btn" (click)="searchQuery = ''; applyFilter()">
              <mat-icon>clear</mat-icon>
            </button>
          }
        </div>

        <div class="status-filter-wrapper">
          <mat-form-field appearance="outline" class="status-select">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilter()">
              <mat-option value="">Todos os status</mat-option>
              <mat-option value="DRAFT">Rascunho</mat-option>
              <mat-option value="SENT">Enviado</mat-option>
              <mat-option value="APPROVED">Aprovado</mat-option>
              <mat-option value="REJECTED">Recusado</mat-option>
              <mat-option value="EXPIRED">Expirado</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Budgets Table -->
      <div class="table-card">
        @if (filteredBudgets().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">request_quote</mat-icon>
            <h3>Nenhum orçamento encontrado</h3>
            <p>Elabore sua primeira proposta comercial para apresentar soluções aos seus clientes.</p>
            <button mat-flat-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Criar Primeiro Orçamento
            </button>
          </div>
        } @else {
          <div class="table-responsive">
            <table mat-table [dataSource]="filteredBudgets()" class="budget-table">
              <!-- Number Column -->
              <ng-container matColumnDef="number">
                <th mat-header-cell *matHeaderCellDef>Número</th>
                <td mat-cell *matCellDef="let b">
                  <span class="budget-num-badge">{{ b.budgetNumber }}</span>
                </td>
              </ng-container>

              <!-- Title & Customer Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Proposta / Cliente</th>
                <td mat-cell *matCellDef="let b">
                  <div class="title-cell">
                    <span class="budget-title">{{ b.title }}</span>
                    <span class="budget-customer">{{ getCustomerName(b.customerId) }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Validity Column -->
              <ng-container matColumnDef="validUntil">
                <th mat-header-cell *matHeaderCellDef>Validade</th>
                <td mat-cell *matCellDef="let b">
                  <span class="validity-date">{{ formatDate(b.validUntil) }}</span>
                </td>
              </ng-container>

              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Valor Total</th>
                <td mat-cell *matCellDef="let b" class="amount-cell">
                  <strong>{{ formatCurrency(b.totalAmount) }}</strong>
                  <span class="item-count">({{ b.items?.length || 0 }} itens)</span>
                </td>
              </ng-container>

              <!-- Status Column with interactive quick-change menu -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let b">
                  <button
                    mat-button
                    [matMenuTriggerFor]="statusMenu"
                    class="status-btn"
                    [class]="'status-' + b.status.toLowerCase()"
                  >
                    <span>{{ getStatusLabel(b.status) }}</span>
                    <mat-icon class="status-arrow">expand_more</mat-icon>
                  </button>

                  <mat-menu #statusMenu="matMenu">
                    <button mat-menu-item (click)="updateStatus(b, 'DRAFT')">
                      <mat-icon>edit_note</mat-icon>
                      <span>Rascunho</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(b, 'SENT')">
                      <mat-icon>send</mat-icon>
                      <span>Enviado</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(b, 'APPROVED')">
                      <mat-icon>check_circle</mat-icon>
                      <span>Aprovado</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(b, 'REJECTED')">
                      <mat-icon>cancel</mat-icon>
                      <span>Recusado</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(b, 'EXPIRED')">
                      <mat-icon>timer_off</mat-icon>
                      <span>Expirado</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="actions-th">Ações</th>
                <td mat-cell *matCellDef="let b" class="actions-td">
                  <button
                    mat-icon-button
                    color="primary"
                    matTooltip="Visualizar Proposta / Imprimir PDF"
                    (click)="openProposalView(b)"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    matTooltip="Excluir orçamento"
                    (click)="deleteBudget(b)"
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
      .budget-page {
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

      /* KPI Ribbon */
      .kpi-ribbon {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      .kpi-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.25rem;
        background: var(--mat-sys-surface, #ffffff);
        border: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
        border-radius: 14px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      }

      .kpi-icon-badge {
        width: 46px;
        height: 46px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .kpi-icon-badge mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .kpi-icon-badge.blue {
        background: #2563eb16;
        color: #2563eb;
      }

      .kpi-icon-badge.emerald {
        background: #10b98116;
        color: #059669;
      }

      .kpi-icon-badge.amber {
        background: #f59e0b16;
        color: #d97706;
      }

      .kpi-icon-badge.purple {
        background: #8b5cf616;
        color: #8b5cf6;
      }

      .kpi-info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .kpi-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--mat-sys-outline, #6b7280);
      }

      .kpi-num {
        font-size: 1.3rem;
        font-weight: 700;
        line-height: 1.25;
        color: var(--mat-sys-on-surface, #111827);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .kpi-sub {
        font-size: 0.75rem;
        color: var(--mat-sys-outline, #9ca3af);
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

      .status-filter-wrapper {
        width: 200px;
      }

      .status-select {
        width: 100%;
        margin-bottom: -1.25em;
      }

      /* Table Card */
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

      .budget-table {
        width: 100%;
      }

      .budget-num-badge {
        font-family: monospace;
        font-size: 0.8125rem;
        font-weight: 700;
        background: var(--mat-sys-surface-variant, #f1f5f9);
        color: #2563eb;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
      }

      .title-cell {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        padding: 0.5rem 0;
      }

      .budget-title {
        font-weight: 600;
        color: var(--mat-sys-on-surface, #111827);
        font-size: 0.9375rem;
      }

      .budget-customer {
        font-size: 0.8rem;
        color: var(--mat-sys-outline, #6b7280);
      }

      .validity-date {
        font-size: 0.8125rem;
        color: var(--mat-sys-outline, #4b5563);
      }

      .amount-cell {
        white-space: nowrap;
      }

      .item-count {
        font-size: 0.75rem;
        color: var(--mat-sys-outline, #9ca3af);
        margin-left: 0.35rem;
      }

      /* Status Buttons */
      .status-btn {
        height: 28px;
        line-height: 28px;
        padding: 0 0.6rem;
        font-size: 0.75rem;
        font-weight: 700;
        border-radius: 9999px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .status-arrow {
        font-size: 16px;
        width: 16px;
        height: 16px;
        margin-left: 0.2rem;
      }

      .status-draft {
        background: #9ca3af18;
        color: #4b5563;
      }

      .status-sent {
        background: #2563eb18;
        color: #2563eb;
      }

      .status-approved {
        background: #10b98118;
        color: #059669;
      }

      .status-rejected {
        background: #ef444418;
        color: #ef4444;
      }

      .status-expired {
        background: #f59e0b18;
        color: #d97706;
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
export class BudgetListComponent implements OnInit {
  private readonly budgetApi = inject(BudgetApiService);
  private readonly customerApi = inject(CustomerApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  displayedColumns = ['number', 'title', 'validUntil', 'amount', 'status', 'actions'];

  budgets = signal<BudgetDetail[]>([]);
  filteredBudgets = signal<BudgetDetail[]>([]);
  customersMap = signal<Map<string, string>>(new Map());

  searchQuery = '';
  selectedStatus = '';

  ngOnInit(): void {
    this.loadCustomers();
    this.loadBudgets();
  }

  loadCustomers(): void {
    this.customerApi.list({ limit: 1000 }).subscribe((res) => {
      const map = new Map<string, string>();
      (res.data || []).forEach((c) => map.set(c.id, c.companyName));
      this.customersMap.set(map);
    });
  }

  loadBudgets(): void {
    this.budgetApi.list().subscribe({
      next: (list) => {
        this.budgets.set(list);
        this.applyFilter();
      },
      error: () => {
        this.snackBar.open('Erro ao carregar orçamentos', 'Fechar', { duration: 4000 });
      },
    });
  }

  applyFilter(): void {
    let result = this.budgets();

    if (this.selectedStatus) {
      result = result.filter((b) => b.status === this.selectedStatus);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.budgetNumber.toLowerCase().includes(q) ||
          b.title.toLowerCase().includes(q) ||
          this.getCustomerName(b.customerId).toLowerCase().includes(q),
      );
    }

    this.filteredBudgets.set(result);
  }

  // Summary Metrics
  totalApprovedValue(): number {
    return this.budgets()
      .filter((b) => b.status === 'APPROVED')
      .reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  }

  approvedCount(): number {
    return this.budgets().filter((b) => b.status === 'APPROVED').length;
  }

  totalInNegotiationValue(): number {
    return this.budgets()
      .filter((b) => b.status === 'SENT')
      .reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  }

  inNegotiationCount(): number {
    return this.budgets().filter((b) => b.status === 'SENT').length;
  }

  conversionRate(): number {
    const total = this.budgets().length;
    if (total === 0) return 0;
    const approved = this.approvedCount();
    return Math.round((approved / total) * 100);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(BudgetDialogComponent, {
      width: '960px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.budgetApi.create(res).subscribe({
          next: (created) => {
            this.snackBar.open(`Orçamento ${created.budgetNumber} gerado com sucesso!`, 'OK', {
              duration: 3500,
            });
            this.loadBudgets();
          },
          error: (err) => {
            const msg = err.error?.message || 'Erro ao criar orçamento';
            this.snackBar.open(msg, 'Fechar', { duration: 4000 });
          },
        });
      }
    });
  }

  openProposalView(budget: BudgetDetail): void {
    this.dialog.open(BudgetDetailDialogComponent, {
      width: '880px',
      maxWidth: '95vw',
      data: {
        budget,
        customerName: this.getCustomerName(budget.customerId),
      },
    });
  }

  updateStatus(budget: BudgetDetail, status: BudgetStatus): void {
    this.budgetApi.updateStatus(budget.id, status).subscribe({
      next: () => {
        this.snackBar.open(`Status atualizado para ${this.getStatusLabel(status)}`, 'OK', {
          duration: 3000,
        });
        this.loadBudgets();
      },
      error: () => {
        this.snackBar.open('Erro ao atualizar status do orçamento', 'Fechar', { duration: 4000 });
      },
    });
  }

  deleteBudget(budget: BudgetDetail): void {
    if (confirm(`Deseja realmente excluir o orçamento "${budget.budgetNumber}"?`)) {
      this.budgetApi.delete(budget.id).subscribe({
        next: () => {
          this.snackBar.open('Orçamento removido com sucesso', 'OK', { duration: 3000 });
          this.loadBudgets();
        },
        error: () => {
          this.snackBar.open('Erro ao remover orçamento', 'Fechar', { duration: 4000 });
        },
      });
    }
  }

  getCustomerName(customerId: string): string {
    return this.customersMap().get(customerId) || 'Cliente';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'Rascunho',
      SENT: 'Enviado',
      APPROVED: 'Aprovado',
      REJECTED: 'Recusado',
      EXPIRED: 'Expirado',
    };
    return map[status] || status;
  }
}
