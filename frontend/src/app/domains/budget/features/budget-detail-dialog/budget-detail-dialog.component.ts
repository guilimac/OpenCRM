import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { BudgetDetail } from '../../models/budget.model';

export interface BudgetDetailDialogData {
  budget: BudgetDetail;
  customerName?: string;
}

@Component({
  selector: 'app-budget-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
  ],
  template: `
    <div class="proposal-container">
      <!-- Toolbar (hidden during print) -->
      <div class="proposal-toolbar no-print">
        <div class="status-group">
          <span class="status-chip" [class]="'status-' + data.budget.status.toLowerCase()">
            {{ getStatusLabel(data.budget.status) }}
          </span>
          <span class="budget-num">{{ data.budget.budgetNumber }}</span>
        </div>
        <div class="toolbar-actions">
          <button mat-flat-button color="primary" (click)="print()">
            <mat-icon>print</mat-icon>
            <span>Imprimir / Salvar PDF</span>
          </button>
          <button mat-icon-button mat-dialog-close>
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Printable Commercial Document -->
      <div class="printable-document" id="printable-proposal">
        <!-- Document Header -->
        <div class="doc-header">
          <div class="company-brand">
            <img src="/images/opencrm-logo.png" alt="OpenCRM Logo" class="brand-logo" />
            <div class="brand-details">
              <span class="company-name">OpenCRM Enterprise</span>
              <span class="company-sub">Gestão Comercial & Soluções Corporativas</span>
            </div>
          </div>
          <div class="doc-meta">
            <h1 class="doc-title">PROPOSTA COMERCIAL</h1>
            <span class="doc-number">{{ data.budget.budgetNumber }}</span>
            <div class="doc-dates">
              <span><strong>Emissão:</strong> {{ formatDate(data.budget.issueDate) }}</span>
              <span><strong>Validade:</strong> {{ formatDate(data.budget.validUntil) }}</span>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Customer & Title Section -->
        <div class="client-section">
          <div class="info-block">
            <span class="block-label">CLIENTE / CONTA</span>
            <h3 class="client-name">{{ data.customerName || 'Cliente' }}</h3>
            <span class="doc-subtitle">{{ data.budget.title }}</span>
          </div>
        </div>

        <!-- Line Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th class="col-idx">#</th>
              <th class="col-desc">Descrição do Item / Serviço</th>
              <th class="col-qty">Qtd</th>
              <th class="col-price">Preço Unit.</th>
              <th class="col-disc">Desc.</th>
              <th class="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            @for (item of data.budget.items; track item.id; let idx = $index) {
              <tr>
                <td class="col-idx">{{ idx + 1 }}</td>
                <td class="col-desc font-semibold">{{ item.description }}</td>
                <td class="col-qty">{{ item.quantity }}</td>
                <td class="col-price">{{ formatCurrency(item.unitPrice) }}</td>
                <td class="col-disc">{{ item.discountPercent ? item.discountPercent + '%' : '-' }}</td>
                <td class="col-total font-semibold">{{ formatCurrency(item.total) }}</td>
              </tr>
            }
          </tbody>
        </table>

        <!-- Totals & Summary Block -->
        <div class="summary-section">
          <div class="terms-block">
            @if (data.budget.paymentTerms) {
              <div class="term-item">
                <span class="term-label">Condições de Pagamento:</span>
                <span class="term-val">{{ data.budget.paymentTerms }}</span>
              </div>
            }
            @if (data.budget.notes) {
              <div class="term-item">
                <span class="term-label">Observações & Termos Gerais:</span>
                <p class="term-text">{{ data.budget.notes }}</p>
              </div>
            }
          </div>

          <div class="totals-table">
            <div class="total-row">
              <span class="tot-lbl">Subtotal dos Itens:</span>
              <span class="tot-val">{{ formatCurrency(data.budget.subtotal) }}</span>
            </div>
            @if (data.budget.discountAmount > 0) {
              <div class="total-row discount-row">
                <span class="tot-lbl">Desconto Global:</span>
                <span class="tot-val">- {{ formatCurrency(data.budget.discountAmount) }}</span>
              </div>
            }
            <div class="total-row net-total-row">
              <span class="tot-lbl">Valor Total:</span>
              <span class="tot-val">{{ formatCurrency(data.budget.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Signature Lines -->
        <div class="signature-section">
          <div class="sig-box">
            <div class="sig-line"></div>
            <span class="sig-label">Representante Comercial</span>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <span class="sig-label">De Acordo do Cliente</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .proposal-container {
        display: flex;
        flex-direction: column;
        max-width: 820px;
        width: 100%;
      }

      .proposal-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
        background: var(--mat-sys-surface, #ffffff);
      }

      .status-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .status-chip {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .status-draft {
        background: #9ca3af22;
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

      .budget-num {
        font-family: monospace;
        font-weight: 600;
        font-size: 0.9375rem;
      }

      .toolbar-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* Printable Document Styling */
      .printable-document {
        padding: 2.5rem 3rem;
        background: #ffffff;
        color: #1f2937;
        font-family: system-ui, -apple-system, sans-serif;
      }

      .doc-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
      }

      .company-brand {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }

      .brand-logo {
        height: 48px;
        width: auto;
      }

      .brand-details {
        display: flex;
        flex-direction: column;
      }

      .company-name {
        font-size: 1.15rem;
        font-weight: 700;
        color: #111827;
      }

      .company-sub {
        font-size: 0.775rem;
        color: #6b7280;
      }

      .doc-meta {
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .doc-title {
        font-size: 1.25rem;
        font-weight: 800;
        margin: 0;
        color: #2563eb;
        letter-spacing: 0.05em;
      }

      .doc-number {
        font-family: monospace;
        font-weight: 700;
        font-size: 1rem;
        color: #4b5563;
        margin: 0.15rem 0 0.5rem 0;
      }

      .doc-dates {
        display: flex;
        flex-direction: column;
        font-size: 0.8125rem;
        color: #4b5563;
        gap: 0.15rem;
      }

      .client-section {
        margin: 1.5rem 0;
      }

      .block-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: #9ca3af;
        letter-spacing: 0.06em;
      }

      .client-name {
        font-size: 1.2rem;
        font-weight: 700;
        margin: 0.2rem 0;
        color: #111827;
      }

      .doc-subtitle {
        font-size: 0.9375rem;
        color: #4b5563;
      }

      /* Items Table */
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
        font-size: 0.875rem;
      }

      .items-table th {
        background: #f8fafc;
        border-bottom: 2px solid #e2e8f0;
        padding: 0.75rem;
        text-align: left;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #475569;
      }

      .items-table td {
        padding: 0.75rem;
        border-bottom: 1px solid #f1f5f9;
      }

      .col-idx {
        width: 40px;
        text-align: center;
        color: #94a3b8;
      }

      .col-qty {
        width: 60px;
        text-align: center;
      }

      .col-price {
        width: 110px;
        text-align: right;
      }

      .col-disc {
        width: 70px;
        text-align: center;
      }

      .col-total {
        width: 120px;
        text-align: right;
      }

      /* Summary Section */
      .summary-section {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 2rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
      }

      .terms-block {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .term-item {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .term-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
      }

      .term-val {
        font-size: 0.875rem;
        font-weight: 500;
        color: #334155;
      }

      .term-text {
        margin: 0;
        font-size: 0.8125rem;
        color: #64748b;
        line-height: 1.4;
      }

      .totals-table {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: #f8fafc;
        padding: 1.25rem;
        border-radius: 8px;
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        color: #475569;
      }

      .discount-row {
        color: #ef4444;
      }

      .net-total-row {
        border-top: 2px solid #cbd5e1;
        padding-top: 0.6rem;
        margin-top: 0.2rem;
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
      }

      /* Signatures */
      .signature-section {
        display: flex;
        justify-content: space-between;
        margin-top: 3.5rem;
        padding-top: 1.5rem;
      }

      .sig-box {
        width: 240px;
        text-align: center;
      }

      .sig-line {
        border-top: 1px solid #94a3b8;
        margin-bottom: 0.5rem;
      }

      .sig-label {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      @media print {
        .no-print {
          display: none !important;
        }
        .proposal-container {
          max-width: 100% !important;
        }
        .printable-document {
          padding: 0 !important;
        }
      }
    `,
  ],
})
export class BudgetDetailDialogComponent {
  data = inject<BudgetDetailDialogData>(MAT_DIALOG_DATA);

  print(): void {
    window.print();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.data.budget.currency || 'BRL',
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
