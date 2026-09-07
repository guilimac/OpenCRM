import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { DashboardEngineService } from '../../services/dashboard-engine.service';
import { ChartWidgetComponent } from '../../ui/chart-widget/chart-widget.component';
import { CreateGraphDialogComponent } from '../create-graph-dialog/create-graph-dialog.component';
import { DashboardPanelConfig } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    ChartWidgetComponent,
  ],
  template: `
    <div class="dashboard-page">
      <!-- HEADER & ACTIONS TOOLBAR -->
      <div class="dashboard-header">
        <div class="header-titles">
          <div class="header-badge">
            <mat-icon>insights</mat-icon>
            <span>Analytics 360&deg;</span>
          </div>
          <h1 class="page-title">Dashboard Analítico</h1>
          <p class="page-subtitle">
            Monitore o desempenho comercial e crie gráficos dinâmicos personalizados para todas as entidades do CRM.
          </p>
        </div>

        <div class="header-actions">
          <button
            mat-stroked-button
            class="action-btn-secondary"
            (click)="refreshData()"
            [disabled]="loading()"
            matTooltip="Atualizar dados de todas as entidades"
          >
            <mat-icon [class.spin]="loading()">refresh</mat-icon>
            <span>Atualizar</span>
          </button>

          <button
            mat-stroked-button
            class="action-btn-secondary"
            (click)="resetDefaults()"
            matTooltip="Restaurar layout original dos painéis"
          >
            <mat-icon>restart_alt</mat-icon>
            <span>Restaurar Padrão</span>
          </button>

          <button
            mat-flat-button
            color="primary"
            class="action-btn-primary"
            (click)="openAddGraphDialog()"
          >
            <mat-icon>add_chart</mat-icon>
            <span>Adicionar Gráfico</span>
          </button>
        </div>
      </div>

      <!-- TOP METRIC KPI CARDS -->
      <div class="kpi-ribbon">
        <!-- 1. Pipeline Total -->
        <div class="kpi-card highlight-blue">
          <div class="kpi-icon-badge blue">
            <mat-icon>monetization_on</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Pipeline Total</span>
            <span class="kpi-num">{{ formatCurrency(kpis().totalPipelineInBrl) }}</span>
            <span class="kpi-sub">{{ kpis().openOpportunitiesCount }} oportunidades abertas</span>
          </div>
        </div>

        <!-- 2. Receita Ponderada -->
        <div class="kpi-card highlight-indigo">
          <div class="kpi-icon-badge indigo">
            <mat-icon>query_stats</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Receita Ponderada</span>
            <span class="kpi-num">{{ formatCurrency(kpis().weightedPipelineInBrl) }}</span>
            <span class="kpi-sub">Probabilidade do funil</span>
          </div>
        </div>

        <!-- 3. Clientes Ativos -->
        <div class="kpi-card highlight-teal">
          <div class="kpi-icon-badge teal">
            <mat-icon>groups</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Clientes Ativos</span>
            <span class="kpi-num">{{ kpis().activeCustomers }}</span>
            <span class="kpi-sub">De {{ kpis().totalCustomers }} clientes totais</span>
          </div>
        </div>

        <!-- 4. Listas Segmentadas -->
        <div class="kpi-card highlight-purple">
          <div class="kpi-icon-badge purple">
            <mat-icon>list_alt</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Listas de Clientes</span>
            <span class="kpi-num">{{ kpis().customerListsCount }}</span>
            <span class="kpi-sub">Segmentos configurados</span>
          </div>
        </div>

        <!-- 5. Total de Atividades -->
        <div class="kpi-card highlight-amber">
          <div class="kpi-icon-badge amber">
            <mat-icon>forum</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Atividades Registradas</span>
            <span class="kpi-num">{{ kpis().totalInteractionsCount }}</span>
            <span class="kpi-sub">E-mails, reuniões e contatos</span>
          </div>
        </div>
      </div>

      <!-- MAIN PANELS GRID (Grafana style) -->
      @if (panels().length === 0) {
        <div class="empty-dashboard-container">
          <mat-icon class="empty-board-icon">dashboard_customize</mat-icon>
          <h3>Nenhum gráfico configurado no momento</h3>
          <p>Você pode adicionar gráficos customizados ou restaurar os painéis analíticos padrão.</p>
          <div class="empty-board-actions">
            <button mat-flat-button color="primary" (click)="openAddGraphDialog()">
              <mat-icon>add_chart</mat-icon>
              Criar Primeiro Gráfico
            </button>
            <button mat-stroked-button (click)="resetDefaults()">
              <mat-icon>restart_alt</mat-icon>
              Restaurar Padrões
            </button>
          </div>
        </div>
      } @else {
        <div class="panels-grid">
          @for (panel of panels(); track panel.id; let idx = $index) {
            <div
              class="panel-card-wrapper"
              [class.width-third]="panel.width === 'third'"
              [class.width-half]="panel.width === 'half'"
              [class.width-full]="panel.width === 'full'"
            >
              <mat-card class="panel-card">
                <!-- Panel Header -->
                <div class="panel-header">
                  <div class="panel-title-group">
                    <mat-icon class="panel-type-icon">{{ panel.icon || 'bar_chart' }}</mat-icon>
                    <span class="panel-title" [title]="panel.title">{{ panel.title }}</span>
                    <span class="panel-entity-badge" [class]="'entity-' + panel.entity.toLowerCase()">
                      {{ getEntityShortName(panel.entity) }}
                    </span>
                  </div>

                  <!-- Panel Controls -->
                  <div class="panel-actions">
                    <button
                      mat-icon-button
                      class="panel-ctrl-btn"
                      (click)="movePanel(panel.id, 'left')"
                      [disabled]="idx === 0"
                      matTooltip="Mover para a esquerda"
                    >
                      <mat-icon>chevron_left</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      class="panel-ctrl-btn"
                      (click)="movePanel(panel.id, 'right')"
                      [disabled]="idx === panels().length - 1"
                      matTooltip="Mover para a direita"
                    >
                      <mat-icon>chevron_right</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      class="panel-ctrl-btn"
                      (click)="openEditGraphDialog(panel)"
                      matTooltip="Editar gráfico"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      class="panel-ctrl-btn delete-btn"
                      (click)="removePanel(panel.id)"
                      matTooltip="Remover painel"
                    >
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                </div>

                <!-- Panel Body -->
                <mat-card-content class="panel-content">
                  <app-chart-widget
                    [panel]="panel"
                    [data]="getPanelData(panel)"
                  ></app-chart-widget>
                </mat-card-content>
              </mat-card>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .dashboard-page {
        padding: 1.5rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 1600px;
        margin: 0 auto;
      }

      /* Header */
      .dashboard-header {
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
        max-width: 600px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .action-btn-primary {
        border-radius: 10px;
        font-weight: 600;
        padding: 0 1.25rem;
        height: 42px;
      }

      .action-btn-secondary {
        border-radius: 10px;
        height: 42px;
        font-weight: 500;
      }

      .spin {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        100% {
          transform: rotate(360deg);
        }
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
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
      }

      .kpi-icon-badge {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .kpi-icon-badge mat-icon {
        font-size: 26px;
        width: 26px;
        height: 26px;
      }

      .kpi-icon-badge.blue {
        background: #2563eb18;
        color: #2563eb;
      }

      .kpi-icon-badge.indigo {
        background: #4f46e518;
        color: #4f46e5;
      }

      .kpi-icon-badge.teal {
        background: #0d948818;
        color: #0d9488;
      }

      .kpi-icon-badge.purple {
        background: #8b5cf618;
        color: #8b5cf6;
      }

      .kpi-icon-badge.amber {
        background: #f59e0b18;
        color: #d97706;
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
        font-size: 1.35rem;
        font-weight: 700;
        line-height: 1.25;
        color: var(--mat-sys-on-surface, #111827);
        letter-spacing: -0.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .kpi-sub {
        font-size: 0.75rem;
        color: var(--mat-sys-outline, #9ca3af);
        margin-top: 0.15rem;
      }

      /* Panels Grid */
      .panels-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1.25rem;
      }

      .panel-card-wrapper {
        flex: 1 1 100%;
        min-width: 280px;
        transition: all 0.3s ease;
      }

      .panel-card-wrapper.width-third {
        flex: 1 1 calc(33.333% - 1rem);
      }

      .panel-card-wrapper.width-half {
        flex: 1 1 calc(50% - 1rem);
      }

      .panel-card-wrapper.width-full {
        flex: 1 1 100%;
      }

      @media (max-width: 1024px) {
        .panel-card-wrapper.width-third,
        .panel-card-wrapper.width-half {
          flex: 1 1 calc(50% - 0.75rem);
        }
      }

      @media (max-width: 720px) {
        .panel-card-wrapper.width-third,
        .panel-card-wrapper.width-half,
        .panel-card-wrapper.width-full {
          flex: 1 1 100%;
        }
      }

      .panel-card {
        height: 100%;
        border-radius: 14px;
        border: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
        background: var(--mat-sys-surface, #ffffff);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
      }

      .panel-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        border-color: #cbd5e1;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.9rem 1.25rem;
        border-bottom: 1px solid var(--mat-sys-outline-variant, #f3f4f6);
        background: var(--mat-sys-surface, #ffffff);
      }

      .panel-title-group {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        overflow: hidden;
      }

      .panel-type-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #2563eb;
        flex-shrink: 0;
      }

      .panel-title {
        font-weight: 600;
        font-size: 0.9375rem;
        color: var(--mat-sys-on-surface, #1f2937);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .panel-entity-badge {
        font-size: 0.6875rem;
        font-weight: 600;
        padding: 0.15rem 0.45rem;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        flex-shrink: 0;
      }

      .entity-customer {
        background: #0d948815;
        color: #0d9488;
      }

      .entity-opportunity {
        background: #2563eb15;
        color: #2563eb;
      }

      .entity-customer_list {
        background: #8b5cf615;
        color: #8b5cf6;
      }

      .entity-interaction {
        background: #f59e0b15;
        color: #d97706;
      }

      .panel-actions {
        display: flex;
        align-items: center;
        gap: 0.2rem;
      }

      .panel-ctrl-btn {
        width: 28px;
        height: 28px;
        line-height: 28px;
        color: var(--mat-sys-outline, #9ca3af);
      }

      .panel-ctrl-btn mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .panel-ctrl-btn:hover {
        color: var(--mat-sys-on-surface, #1f2937);
      }

      .delete-btn:hover {
        color: #ef4444;
      }

      .panel-content {
        padding: 1.25rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      /* Empty Dashboard */
      .empty-dashboard-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 1.5rem;
        text-align: center;
        background: var(--mat-sys-surface, #ffffff);
        border: 2px dashed var(--mat-sys-outline-variant, #e5e7eb);
        border-radius: 16px;
      }

      .empty-board-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #2563eb;
        opacity: 0.4;
        margin-bottom: 1rem;
      }

      .empty-dashboard-container h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
      }

      .empty-dashboard-container p {
        color: var(--mat-sys-outline, #6b7280);
        margin: 0 0 1.5rem 0;
      }

      .empty-board-actions {
        display: flex;
        gap: 1rem;
      }
    `,
  ],
})
export class DashboardViewComponent implements OnInit {
  private readonly engine = inject(DashboardEngineService);
  private readonly dialog = inject(MatDialog);

  readonly loading = this.engine.loading;
  readonly panels = this.engine.panels;
  readonly kpis = this.engine.kpis;

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.engine.refreshData().subscribe();
  }

  resetDefaults(): void {
    this.engine.resetToDefaults();
  }

  movePanel(id: string, direction: 'left' | 'right'): void {
    this.engine.movePanel(id, direction);
  }

  removePanel(id: string): void {
    this.engine.removePanel(id);
  }

  getPanelData(panel: DashboardPanelConfig) {
    return this.engine.computeChartData(panel);
  }

  openAddGraphDialog(): void {
    const dialogRef = this.dialog.open(CreateGraphDialogComponent, {
      width: '940px',
      maxWidth: '95vw',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((newPanel: DashboardPanelConfig | undefined) => {
      if (newPanel) {
        this.engine.addPanel(newPanel);
      }
    });
  }

  openEditGraphDialog(panel: DashboardPanelConfig): void {
    const dialogRef = this.dialog.open(CreateGraphDialogComponent, {
      width: '940px',
      maxWidth: '95vw',
      data: { existingPanel: panel },
    });

    dialogRef.afterClosed().subscribe((updatedPanel: DashboardPanelConfig | undefined) => {
      if (updatedPanel) {
        const updatedList = this.panels().map((p) =>
          p.id === panel.id ? updatedPanel : p,
        );
        this.engine.savePanels(updatedList);
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  getEntityShortName(entity: string): string {
    switch (entity) {
      case 'CUSTOMER':
        return 'Clientes';
      case 'OPPORTUNITY':
        return 'Pipeline';
      case 'CUSTOMER_LIST':
        return 'Listas';
      case 'INTERACTION':
        return 'Atividades';
      default:
        return entity;
    }
  }
}
