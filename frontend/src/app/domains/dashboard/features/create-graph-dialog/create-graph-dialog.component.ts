import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { DashboardEngineService } from '../../services/dashboard-engine.service';
import { ChartWidgetComponent } from '../../ui/chart-widget/chart-widget.component';
import {
  DashboardPanelConfig,
  DashboardEntityType,
  DashboardChartType,
  DashboardMetricType,
  DashboardPanelWidth,
  ChartWidgetData,
} from '../../models/dashboard.model';

export interface CreateGraphDialogData {
  existingPanel?: DashboardPanelConfig;
}

@Component({
  selector: 'app-create-graph-dialog',
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
    MatRadioModule,
    MatChipsModule,
    MatDividerModule,
    ChartWidgetComponent,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-title-group">
          <div class="icon-avatar">
            <mat-icon>add_chart</mat-icon>
          </div>
          <div>
            <h2 mat-dialog-title class="dialog-title">
              {{ isEditing ? 'Editar Gráfico / Painel' : 'Criar Novo Painel Analítico' }}
            </h2>
            <p class="dialog-subtitle">
              Configure métricas, dimensões e o tipo de visualização com pré-visualização em tempo real.
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="builder-layout">
          <!-- LEFT / TOP FORM CONTROLS -->
          <form [formGroup]="form" class="builder-form">
            <!-- 1. Title -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Título do Painel</mat-label>
              <input
                matInput
                formControlName="title"
                placeholder="Ex: Pipeline por Estágio, Clientes por Setor..."
              />
              <mat-icon matPrefix>title</mat-icon>
            </mat-form-field>

            <!-- 2. Entity Selector -->
            <div class="section-group">
              <label class="section-label">1. Entidade de Dados (Data Source)</label>
              <div class="entity-cards-grid">
                @for (meta of entityMetadataList; track meta.entity) {
                  <button
                    type="button"
                    class="entity-card"
                    [class.selected]="form.value.entity === meta.entity"
                    (click)="selectEntity(meta.entity)"
                  >
                    <mat-icon class="entity-icon">{{ meta.icon }}</mat-icon>
                    <span class="entity-name">{{ getEntityDisplayName(meta.entity) }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- 3. Group By and Metric Grid -->
            <div class="form-row-2col">
              <!-- Group By Dimension -->
              <mat-form-field appearance="outline">
                <mat-label>Dimensão (Agrupar por)</mat-label>
                <mat-select formControlName="groupBy">
                  @for (dim of currentDimensions(); track dim.value) {
                    <mat-option [value]="dim.value">
                      {{ getDimensionDisplayName(dim.value) }}
                    </mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>category</mat-icon>
              </mat-form-field>

              <!-- Metric Type -->
              <mat-form-field appearance="outline">
                <mat-label>Cálculo da Métrica</mat-label>
                <mat-select formControlName="metric" (selectionChange)="onMetricChange($event.value)">
                  <mat-option value="COUNT">Contagem (Total de Registros)</mat-option>
                  <mat-option value="SUM" [disabled]="!supportsSumAvg()">Soma de Valores</mat-option>
                  <mat-option value="AVG" [disabled]="!supportsSumAvg()">Média de Valores</mat-option>
                </mat-select>
                <mat-icon matPrefix>calculate</mat-icon>
              </mat-form-field>
            </div>

            <!-- Metric Field (if SUM or AVG) -->
            @if (form.value.metric === 'SUM' || form.value.metric === 'AVG') {
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Campo Numérico</mat-label>
                <mat-select formControlName="metricField">
                  @for (fld of currentMetricFields(); track fld.value) {
                    <mat-option [value]="fld.value">
                      {{ getMetricFieldDisplayName(fld.value) }}
                    </mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>attach_money</mat-icon>
              </mat-form-field>
            }

            <!-- 4. Chart Type Picker -->
            <div class="section-group">
              <label class="section-label">2. Tipo de Visualização</label>
              <div class="chart-type-grid">
                @for (type of availableChartTypes; track type.value) {
                  <button
                    type="button"
                    class="chart-type-card"
                    [class.selected]="form.value.chartType === type.value"
                    (click)="selectChartType(type.value)"
                  >
                    <mat-icon class="chart-type-icon">{{ type.icon }}</mat-icon>
                    <span class="chart-type-title">{{ type.label }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- 5. Panel Width -->
            <div class="section-group">
              <label class="section-label">3. Largura do Painel no Grid</label>
              <div class="width-picker-row">
                <button
                  type="button"
                  class="width-btn"
                  [class.selected]="form.value.width === 'third'"
                  (click)="form.patchValue({ width: 'third' })"
                >
                  <span class="width-badge">1/3</span>
                  <span>Compacto</span>
                </button>
                <button
                  type="button"
                  class="width-btn"
                  [class.selected]="form.value.width === 'half'"
                  (click)="form.patchValue({ width: 'half' })"
                >
                  <span class="width-badge">1/2</span>
                  <span>Médio</span>
                </button>
                <button
                  type="button"
                  class="width-btn"
                  [class.selected]="form.value.width === 'full'"
                  (click)="form.patchValue({ width: 'full' })"
                >
                  <span class="width-badge">Full</span>
                  <span>Largura Total</span>
                </button>
              </div>
            </div>
          </form>

          <!-- RIGHT / PREVIEW SECTION (Live Grafana-Style Rendering) -->
          <div class="preview-section">
            <div class="preview-header">
              <div class="preview-badge">
                <span class="pulse-dot"></span>
                <span>Pré-visualização em Tempo Real</span>
              </div>
              <span class="preview-type-tag">
                {{ form.value.chartType }} &bull; {{ form.value.entity }}
              </span>
            </div>

            <div class="preview-card">
              <div class="preview-card-header">
                <span class="preview-card-title">{{ form.value.title || 'Título do Painel' }}</span>
                <mat-icon class="preview-card-icon">{{ getPreviewIcon() }}</mat-icon>
              </div>
              <div class="preview-card-body">
                <app-chart-widget
                  [panel]="currentConfig()"
                  [data]="previewData()"
                ></app-chart-widget>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="form.invalid"
          (click)="savePanel()"
        >
          <mat-icon>check</mat-icon>
          {{ isEditing ? 'Atualizar Painel' : 'Adicionar ao Dashboard' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        display: flex;
        flex-direction: column;
        max-width: 980px;
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

      .header-title-group {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .icon-avatar {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: #2563eb18;
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
        margin: 0.25rem 0 0 0;
        font-size: 0.8125rem;
        color: var(--mat-sys-outline, #6b7280);
      }

      .dialog-content {
        padding: 1.5rem;
        overflow-y: auto;
        max-height: calc(90vh - 150px);
      }

      .builder-layout {
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        gap: 1.75rem;
      }

      @media (max-width: 860px) {
        .builder-layout {
          grid-template-columns: 1fr;
        }
      }

      .builder-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .section-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .section-label {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface, #374151);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      /* Entity Selector Cards */
      .entity-cards-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
      }

      .entity-card {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.65rem 0.85rem;
        border-radius: 10px;
        border: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
        background: var(--mat-sys-surface, #ffffff);
        color: var(--mat-sys-on-surface, #374151);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
      }

      .entity-card:hover {
        border-color: #2563eb;
        background: #2563eb08;
      }

      .entity-card.selected {
        border-color: #2563eb;
        background: #2563eb12;
        color: #2563eb;
        font-weight: 600;
      }

      .entity-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .entity-name {
        font-size: 0.8125rem;
      }

      .form-row-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      /* Chart Type Cards */
      .chart-type-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }

      .chart-type-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.75rem 0.5rem;
        border-radius: 10px;
        border: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
        background: var(--mat-sys-surface, #ffffff);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .chart-type-card:hover {
        border-color: #2563eb;
        background: #2563eb08;
      }

      .chart-type-card.selected {
        border-color: #2563eb;
        background: #2563eb14;
        color: #2563eb;
      }

      .chart-type-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .chart-type-title {
        font-size: 0.75rem;
        font-weight: 500;
      }

      /* Width picker */
      .width-picker-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 0.5rem;
      }

      .width-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.55rem;
        border-radius: 8px;
        border: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
        background: var(--mat-sys-surface, #ffffff);
        cursor: pointer;
        font-size: 0.8125rem;
        transition: all 0.2s ease;
      }

      .width-btn:hover {
        border-color: #2563eb;
      }

      .width-btn.selected {
        border-color: #2563eb;
        background: #2563eb12;
        color: #2563eb;
        font-weight: 600;
      }

      .width-badge {
        font-size: 0.7rem;
        padding: 0.1rem 0.35rem;
        background: var(--mat-sys-surface-variant, #f3f4f6);
        border-radius: 4px;
      }

      /* Preview Section */
      .preview-section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .preview-badge {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--mat-sys-outline, #6b7280);
      }

      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #10b981;
        box-shadow: 0 0 0 2px #10b98133;
      }

      .preview-type-tag {
        font-size: 0.7rem;
        color: var(--mat-sys-outline, #9ca3af);
        background: var(--mat-sys-surface-variant, #f3f4f6);
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
      }

      .preview-card {
        background: var(--mat-sys-surface, #ffffff);
        border: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
        border-radius: 14px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        min-height: 280px;
      }

      .preview-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--mat-sys-outline-variant, #f3f4f6);
      }

      .preview-card-title {
        font-weight: 600;
        font-size: 0.9375rem;
        color: var(--mat-sys-on-surface, #1f2937);
      }

      .preview-card-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--mat-sys-outline, #9ca3af);
      }

      .preview-card-body {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dialog-actions {
        padding: 0.85rem 1.5rem;
        border-top: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
      }

      .w-full {
        width: 100%;
      }
    `,
  ],
})
export class CreateGraphDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateGraphDialogComponent>);
  private readonly data = inject<CreateGraphDialogData>(MAT_DIALOG_DATA, { optional: true });
  private readonly engine = inject(DashboardEngineService);

  readonly isEditing = !!this.data?.existingPanel;
  readonly entityMetadataList = this.engine.getEntityMetadataList();

  readonly availableChartTypes: { value: DashboardChartType; label: string; icon: string }[] = [
    { value: 'BAR', label: 'Barras', icon: 'bar_chart' },
    { value: 'DONUT', label: 'Rosca', icon: 'pie_chart' },
    { value: 'LINE', label: 'Tendência', icon: 'show_chart' },
    { value: 'STAT', label: 'Cartão KPI', icon: 'numbers' },
    { value: 'TABLE', label: 'Tabela', icon: 'table_rows' },
  ];

  form: FormGroup = this.fb.group({
    id: [this.data?.existingPanel?.id || `panel-${Date.now()}`],
    title: [this.data?.existingPanel?.title || '', [Validators.required, Validators.minLength(2)]],
    entity: [this.data?.existingPanel?.entity || 'OPPORTUNITY', Validators.required],
    groupBy: [this.data?.existingPanel?.groupBy || 'stage', Validators.required],
    metric: [this.data?.existingPanel?.metric || 'COUNT', Validators.required],
    metricField: [this.data?.existingPanel?.metricField || 'amountInBrl'],
    chartType: [this.data?.existingPanel?.chartType || 'BAR', Validators.required],
    width: [this.data?.existingPanel?.width || 'half', Validators.required],
  });

  // Reactive computed state for preview
  formState = signal<DashboardPanelConfig>(this.form.value);

  constructor() {
    this.form.valueChanges.subscribe((val) => {
      this.formState.set(val);
    });

    if (!this.data?.existingPanel) {
      this.updateDefaultTitle();
    }
  }

  currentConfig = computed<DashboardPanelConfig>(() => {
    const s = this.formState();
    return {
      id: s.id || 'preview-id',
      title: s.title || 'Título do Painel',
      entity: s.entity || 'OPPORTUNITY',
      chartType: s.chartType || 'BAR',
      metric: s.metric || 'COUNT',
      metricField: s.metricField,
      groupBy: s.groupBy || 'stage',
      width: s.width || 'half',
      icon: this.getPreviewIcon(),
    };
  });

  previewData = computed<ChartWidgetData>(() => {
    const config = this.currentConfig();
    return this.engine.computeChartData(config);
  });

  currentDimensions = computed(() => {
    const entity = this.formState().entity;
    const meta = this.entityMetadataList.find((m) => m.entity === entity);
    return meta ? meta.groupByOptions : [];
  });

  currentMetricFields = computed(() => {
    const entity = this.formState().entity;
    const meta = this.entityMetadataList.find((m) => m.entity === entity);
    return meta ? meta.metricFieldOptions.filter((f) => f.allowedMetrics.includes(this.formState().metric)) : [];
  });

  supportsSumAvg(): boolean {
    const entity = this.form.value.entity;
    const meta = this.entityMetadataList.find((m) => m.entity === entity);
    return !!meta && meta.metricFieldOptions.some((f) => f.allowedMetrics.includes('SUM'));
  }

  selectEntity(entity: DashboardEntityType): void {
    this.form.patchValue({ entity });
    const meta = this.entityMetadataList.find((m) => m.entity === entity);
    if (meta && meta.groupByOptions.length > 0) {
      this.form.patchValue({ groupBy: meta.groupByOptions[0].value });
    }

    // Adjust metric if not supported
    if (!this.supportsSumAvg() && this.form.value.metric !== 'COUNT') {
      this.form.patchValue({ metric: 'COUNT', metricField: undefined });
    } else if (meta && meta.metricFieldOptions.length > 0) {
      const field = meta.metricFieldOptions.find((f) => f.allowedMetrics.includes(this.form.value.metric));
      if (field) {
        this.form.patchValue({ metricField: field.value });
      }
    }

    this.updateDefaultTitle();
  }

  onMetricChange(metric: DashboardMetricType): void {
    if (metric === 'COUNT') {
      this.form.patchValue({ metricField: undefined });
    } else {
      const entity = this.form.value.entity;
      const meta = this.entityMetadataList.find((m) => m.entity === entity);
      const firstValidField = meta?.metricFieldOptions.find((f) => f.allowedMetrics.includes(metric));
      if (firstValidField) {
        this.form.patchValue({ metricField: firstValidField.value });
      }
    }
    this.updateDefaultTitle();
  }

  selectChartType(chartType: DashboardChartType): void {
    this.form.patchValue({ chartType });
  }

  getPreviewIcon(): string {
    const chartType = this.formState().chartType;
    if (chartType === 'BAR') return 'bar_chart';
    if (chartType === 'DONUT') return 'pie_chart';
    if (chartType === 'LINE') return 'show_chart';
    if (chartType === 'STAT') return 'numbers';
    return 'table_rows';
  }

  getEntityDisplayName(entity: DashboardEntityType): string {
    switch (entity) {
      case 'OPPORTUNITY':
        return 'Oportunidades & Pipeline';
      case 'CUSTOMER':
        return 'Clientes & Contas';
      case 'CUSTOMER_LIST':
        return 'Listas de Segmentação';
      case 'INTERACTION':
        return 'Atividades & Interações';
      case 'BUDGET':
        return 'Orçamentos & Propostas';
      case 'PRODUCT':
        return 'Produtos & Serviços';
    }
  }

  getDimensionDisplayName(dim: string): string {
    const map: Record<string, string> = {
      stage: 'Estágio do Funil',
      currency: 'Moeda da Oportunidade',
      status: 'Status',
      industry: 'Setor / Indústria',
      name: 'Nome da Lista',
      type: 'Tipo de Atividade',
      outcome: 'Desfecho / Resultado',
      category: 'Categoria do Produto',
      unit: 'Unidade de Medida',
      createdMonth: 'Mês de Criação',
    };
    return map[dim] || dim;
  }

  getMetricFieldDisplayName(fld: string): string {
    const map: Record<string, string> = {
      amountInBrl: 'Valor Convertido em Reais (R$)',
      amount: 'Valor Original da Oportunidade',
      weightedValueInBrl: 'Receita Ponderada em Reais (R$)',
      annualRevenue: 'Faturamento Anual (R$)',
      employeeCount: 'Número de Funcionários',
      memberCount: 'Quantidade de Membros na Lista',
      totalAmount: 'Valor Total do Orçamento (R$)',
      subtotal: 'Subtotal dos Itens (R$)',
      unitPrice: 'Preço Unitário (R$)',
    };
    return map[fld] || fld;
  }

  private updateDefaultTitle(): void {
    if (this.isEditing) return;
    const entity = this.form.value.entity;
    const groupBy = this.form.value.groupBy;
    const metric = this.form.value.metric;

    let title = '';
    const entName =
      entity === 'CUSTOMER'
        ? 'Clientes'
        : entity === 'OPPORTUNITY'
        ? 'Oportunidades'
        : entity === 'CUSTOMER_LIST'
        ? 'Listas'
        : entity === 'BUDGET'
        ? 'Orçamentos'
        : entity === 'PRODUCT'
        ? 'Produtos'
        : 'Interações';
    const dimName = this.getDimensionDisplayName(groupBy);

    if (metric === 'SUM') {
      title = `Valor Total de ${entName} por ${dimName}`;
    } else if (metric === 'AVG') {
      title = `Média de ${entName} por ${dimName}`;
    } else {
      title = `${entName} por ${dimName}`;
    }

    this.form.patchValue({ title }, { emitEvent: true });
  }

  savePanel(): void {
    if (this.form.invalid) return;
    const panelConfig: DashboardPanelConfig = {
      ...this.form.value,
      icon: this.getPreviewIcon(),
    };
    this.dialogRef.close(panelConfig);
  }
}
