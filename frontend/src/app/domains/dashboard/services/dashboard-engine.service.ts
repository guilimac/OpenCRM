import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CustomerApiService } from '../../customer/services/customer-api.service';
import { OpportunityApiService } from '../../opportunity/services/opportunity-api.service';
import { InteractionApiService } from './interaction-api.service';
import { ProductApiService } from '../../product/services/product-api.service';
import { BudgetApiService } from '../../budget/services/budget-api.service';
import { CustomerSummary, CustomerListItem } from '../../customer/models/customer.model';
import { OpportunityItem } from '../../opportunity/models/opportunity.model';
import { InteractionItem } from '../models/interaction.model';
import { ProductItem } from '../../product/models/product.model';
import { BudgetDetail } from '../../budget/models/budget.model';
import {
  DashboardPanelConfig,
  ChartWidgetData,
  ChartSeriesItem,
  DashboardSummaryKpis,
  EntityMetadata,
} from '../models/dashboard.model';

const STORAGE_KEY = 'opencrm_dashboard_panels';

export const DEFAULT_PANELS: DashboardPanelConfig[] = [
  {
    id: 'pipeline-by-stage',
    title: 'Pipeline por Estágio (R$)',
    entity: 'OPPORTUNITY',
    chartType: 'BAR',
    metric: 'SUM',
    metricField: 'amountInBrl',
    groupBy: 'stage',
    width: 'half',
    icon: 'bar_chart',
  },
  {
    id: 'customers-by-status',
    title: 'Clientes por Status',
    entity: 'CUSTOMER',
    chartType: 'DONUT',
    metric: 'COUNT',
    groupBy: 'status',
    width: 'half',
    icon: 'pie_chart',
  },
  {
    id: 'kpi-pipeline-total',
    title: 'Pipeline Total',
    entity: 'OPPORTUNITY',
    chartType: 'STAT',
    metric: 'SUM',
    metricField: 'amountInBrl',
    groupBy: 'stage',
    width: 'third',
    icon: 'monetization_on',
  },
  {
    id: 'kpi-active-customers',
    title: 'Clientes Ativos',
    entity: 'CUSTOMER',
    chartType: 'STAT',
    metric: 'COUNT',
    groupBy: 'status',
    width: 'third',
    icon: 'people',
  },
  {
    id: 'kpi-customer-lists',
    title: 'Listas e Segmentos',
    entity: 'CUSTOMER_LIST',
    chartType: 'STAT',
    metric: 'COUNT',
    groupBy: 'name',
    width: 'third',
    icon: 'list_alt',
  },
  {
    id: 'customers-by-industry',
    title: 'Clientes por Setor / Indústria',
    entity: 'CUSTOMER',
    chartType: 'BAR',
    metric: 'COUNT',
    groupBy: 'industry',
    width: 'half',
    icon: 'domain',
  },
  {
    id: 'interactions-by-type',
    title: 'Atividades e Contatos por Tipo',
    entity: 'INTERACTION',
    chartType: 'DONUT',
    metric: 'COUNT',
    groupBy: 'type',
    width: 'half',
    icon: 'forum',
  },
  {
    id: 'customer-growth-trend',
    title: 'Aquisição de Clientes (Linha do Tempo)',
    entity: 'CUSTOMER',
    chartType: 'LINE',
    metric: 'COUNT',
    groupBy: 'createdMonth',
    width: 'full',
    icon: 'trending_up',
  },
  {
    id: 'opportunities-table-breakdown',
    title: 'Visão Geral do Funil de Oportunidades',
    entity: 'OPPORTUNITY',
    chartType: 'TABLE',
    metric: 'SUM',
    metricField: 'amountInBrl',
    groupBy: 'stage',
    width: 'full',
    icon: 'table_chart',
  },
];

const COLOR_PALETTE = [
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#0284c7', // Sky
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Cyan
  '#84cc16', // Lime
  '#e11d48', // Rose
];

@Injectable({ providedIn: 'root' })
export class DashboardEngineService {
  private readonly customerApi = inject(CustomerApiService);
  private readonly opportunityApi = inject(OpportunityApiService);
  private readonly interactionApi = inject(InteractionApiService);
  private readonly productApi = inject(ProductApiService);
  private readonly budgetApi = inject(BudgetApiService);

  public readonly loading = signal<boolean>(false);
  public readonly panels = signal<DashboardPanelConfig[]>([]);
  public readonly kpis = signal<DashboardSummaryKpis>({
    totalCustomers: 0,
    activeCustomers: 0,
    totalPipelineInBrl: 0,
    weightedPipelineInBrl: 0,
    openOpportunitiesCount: 0,
    customerListsCount: 0,
    totalInteractionsCount: 0,
  });

  // Cached raw datasets
  private rawCustomers: CustomerSummary[] = [];
  private rawOpportunities: OpportunityItem[] = [];
  private rawCustomerLists: CustomerListItem[] = [];
  private rawInteractions: InteractionItem[] = [];
  private rawProducts: ProductItem[] = [];
  private rawBudgets: BudgetDetail[] = [];

  constructor() {
    this.loadPanels();
  }

  public loadPanels(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.panels.set(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse dashboard panels from localStorage, using defaults.', e);
    }
    this.panels.set([...DEFAULT_PANELS]);
  }

  public savePanels(panels: DashboardPanelConfig[]): void {
    this.panels.set(panels);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(panels));
    } catch (e) {
      console.error('Failed to save dashboard panels to localStorage', e);
    }
  }

  public addPanel(panel: DashboardPanelConfig): void {
    const current = this.panels();
    this.savePanels([...current, panel]);
  }

  public removePanel(id: string): void {
    const current = this.panels();
    this.savePanels(current.filter((p) => p.id !== id));
  }

  public movePanel(id: string, direction: 'left' | 'right'): void {
    const current = [...this.panels()];
    const index = current.findIndex((p) => p.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;

    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;

    this.savePanels(current);
  }

  public resetToDefaults(): void {
    this.savePanels([...DEFAULT_PANELS]);
  }

  public refreshData() {
    this.loading.set(true);

    return forkJoin({
      customers: this.customerApi.list({ limit: 1000 }).pipe(
        map((res) => res.data || []),
        catchError(() => of([] as CustomerSummary[])),
      ),
      opportunities: this.opportunityApi.list().pipe(
        catchError(() => of([] as OpportunityItem[])),
      ),
      customerLists: this.customerApi.listCustomerLists().pipe(
        map((res) => res.data || []),
        catchError(() => of([] as CustomerListItem[])),
      ),
      interactions: this.interactionApi.list().pipe(
        catchError(() => of([] as InteractionItem[])),
      ),
      products: this.productApi.list().pipe(
        catchError(() => of([] as ProductItem[])),
      ),
      budgets: this.budgetApi.list().pipe(
        catchError(() => of([] as BudgetDetail[])),
      ),
    }).pipe(
      tap(({ customers, opportunities, customerLists, interactions, products, budgets }) => {
        this.rawCustomers = customers;
        this.rawOpportunities = opportunities;
        this.rawCustomerLists = customerLists;
        this.rawInteractions = interactions;
        this.rawProducts = products;
        this.rawBudgets = budgets;

        this.updateKpis();
        this.loading.set(false);
      }),
    );
  }

  private updateKpis(): void {
    const totalCustomers = this.rawCustomers.length;
    const activeCustomers = this.rawCustomers.filter(
      (c) => c.status === 'ACTIVE_CUSTOMER',
    ).length;

    const totalPipelineInBrl = this.rawOpportunities.reduce(
      (acc, opp) => acc + (Number(opp.amountInBrl) || 0),
      0,
    );

    const weightedPipelineInBrl = this.rawOpportunities.reduce(
      (acc, opp) => acc + (Number(opp.weightedValueInBrl) || 0),
      0,
    );

    const openOpportunitiesCount = this.rawOpportunities.filter(
      (opp) => opp.stage !== 'CLOSED_WON' && opp.stage !== 'CLOSED_LOST',
    ).length;

    const customerListsCount = this.rawCustomerLists.length;
    const totalInteractionsCount = this.rawInteractions.length;

    this.kpis.set({
      totalCustomers,
      activeCustomers,
      totalPipelineInBrl: Math.round(totalPipelineInBrl * 100) / 100,
      weightedPipelineInBrl: Math.round(weightedPipelineInBrl * 100) / 100,
      openOpportunitiesCount,
      customerListsCount,
      totalInteractionsCount,
    });
  }

  public getEntityMetadataList(): EntityMetadata[] {
    return [
      {
        entity: 'OPPORTUNITY',
        labelKey: 'dashboard.entities.opportunity',
        icon: 'trending_up',
        groupByOptions: [
          { value: 'stage', labelKey: 'dashboard.dimensions.stage' },
          { value: 'currency', labelKey: 'dashboard.dimensions.currency' },
          { value: 'createdMonth', labelKey: 'dashboard.dimensions.createdMonth' },
        ],
        metricFieldOptions: [
          { value: 'count', labelKey: 'dashboard.metrics.count', allowedMetrics: ['COUNT'] },
          { value: 'amountInBrl', labelKey: 'dashboard.metrics.amountInBrl', allowedMetrics: ['SUM', 'AVG'] },
          { value: 'weightedValueInBrl', labelKey: 'dashboard.metrics.weightedValueInBrl', allowedMetrics: ['SUM', 'AVG'] },
        ],
      },
      {
        entity: 'CUSTOMER',
        labelKey: 'dashboard.entities.customer',
        icon: 'people',
        groupByOptions: [
          { value: 'status', labelKey: 'dashboard.dimensions.status' },
          { value: 'industry', labelKey: 'dashboard.dimensions.industry' },
          { value: 'createdMonth', labelKey: 'dashboard.dimensions.createdMonth' },
        ],
        metricFieldOptions: [
          { value: 'count', labelKey: 'dashboard.metrics.count', allowedMetrics: ['COUNT'] },
          { value: 'annualRevenue', labelKey: 'dashboard.metrics.annualRevenue', allowedMetrics: ['SUM', 'AVG'] },
          { value: 'employeeCount', labelKey: 'dashboard.metrics.employeeCount', allowedMetrics: ['SUM', 'AVG'] },
        ],
      },
      {
        entity: 'CUSTOMER_LIST',
        labelKey: 'dashboard.entities.customerList',
        icon: 'list_alt',
        groupByOptions: [
          { value: 'name', labelKey: 'dashboard.dimensions.name' },
          { value: 'createdMonth', labelKey: 'dashboard.dimensions.createdMonth' },
        ],
        metricFieldOptions: [
          { value: 'count', labelKey: 'dashboard.metrics.count', allowedMetrics: ['COUNT'] },
          { value: 'memberCount', labelKey: 'dashboard.metrics.memberCount', allowedMetrics: ['SUM', 'AVG'] },
        ],
      },
      {
        entity: 'INTERACTION',
        labelKey: 'dashboard.entities.interaction',
        icon: 'forum',
        groupByOptions: [
          { value: 'type', labelKey: 'dashboard.dimensions.type' },
          { value: 'outcome', labelKey: 'dashboard.dimensions.outcome' },
          { value: 'createdMonth', labelKey: 'dashboard.dimensions.createdMonth' },
        ],
        metricFieldOptions: [
          { value: 'count', labelKey: 'dashboard.metrics.count', allowedMetrics: ['COUNT'] },
        ],
      },
      {
        entity: 'BUDGET',
        labelKey: 'dashboard.entities.budget',
        icon: 'request_quote',
        groupByOptions: [
          { value: 'status', labelKey: 'dashboard.dimensions.status' },
          { value: 'createdMonth', labelKey: 'dashboard.dimensions.createdMonth' },
        ],
        metricFieldOptions: [
          { value: 'count', labelKey: 'dashboard.metrics.count', allowedMetrics: ['COUNT'] },
          { value: 'totalAmount', labelKey: 'dashboard.metrics.totalAmount', allowedMetrics: ['SUM', 'AVG'] },
          { value: 'subtotal', labelKey: 'dashboard.metrics.subtotal', allowedMetrics: ['SUM', 'AVG'] },
        ],
      },
      {
        entity: 'PRODUCT',
        labelKey: 'dashboard.entities.product',
        icon: 'inventory_2',
        groupByOptions: [
          { value: 'category', labelKey: 'dashboard.dimensions.category' },
          { value: 'unit', labelKey: 'dashboard.dimensions.unit' },
          { value: 'createdMonth', labelKey: 'dashboard.dimensions.createdMonth' },
        ],
        metricFieldOptions: [
          { value: 'count', labelKey: 'dashboard.metrics.count', allowedMetrics: ['COUNT'] },
          { value: 'unitPrice', labelKey: 'dashboard.metrics.unitPrice', allowedMetrics: ['SUM', 'AVG'] },
        ],
      },
    ];
  }

  public computeChartData(panel: DashboardPanelConfig): ChartWidgetData {
    const rawItems = this.getEntityData(panel.entity);

    // If STAT Card
    if (panel.chartType === 'STAT') {
      return this.computeStatCard(panel, rawItems);
    }

    // Grouping & Aggregating
    const groups = new Map<string, { sum: number; count: number }>();

    for (const item of rawItems) {
      const groupKey = this.extractGroupKey(item, panel.groupBy);
      const metricVal = this.extractMetricValue(item, panel.metricField);

      const curr = groups.get(groupKey) || { sum: 0, count: 0 };
      curr.sum += metricVal;
      curr.count += 1;
      groups.set(groupKey, curr);
    }

    let items: ChartSeriesItem[] = [];
    let totalValue = 0;

    groups.forEach((data, label) => {
      let val = 0;
      if (panel.metric === 'COUNT') {
        val = data.count;
      } else if (panel.metric === 'SUM') {
        val = Math.round(data.sum * 100) / 100;
      } else if (panel.metric === 'AVG') {
        val = data.count > 0 ? Math.round((data.sum / data.count) * 100) / 100 : 0;
      }

      totalValue += val;
      items.push({
        label,
        value: val,
        formattedValue: this.formatValue(val, panel.metricField),
        color: '', // Assigned below
      });
    });

    // Sort items
    if (panel.groupBy === 'createdMonth') {
      items.sort((a, b) => a.label.localeCompare(b.label));
    } else {
      items.sort((a, b) => b.value - a.value);
    }

    // Calculate percentages & assign colors
    items = items.map((item, idx) => ({
      ...item,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      percentage: totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0,
    }));

    return {
      items,
      totalValue,
      formattedTotal: this.formatValue(totalValue, panel.metricField),
      chartType: panel.chartType,
    };
  }

  private computeStatCard(panel: DashboardPanelConfig, rawItems: any[]): ChartWidgetData {
    let statVal = 0;

    if (panel.metric === 'COUNT') {
      statVal = rawItems.length;
    } else {
      const sum = rawItems.reduce(
        (acc, item) => acc + this.extractMetricValue(item, panel.metricField),
        0,
      );
      if (panel.metric === 'SUM') {
        statVal = Math.round(sum * 100) / 100;
      } else if (panel.metric === 'AVG') {
        statVal = rawItems.length > 0 ? Math.round((sum / rawItems.length) * 100) / 100 : 0;
      }
    }

    const formatted = this.formatValue(statVal, panel.metricField);

    return {
      items: [],
      totalValue: statVal,
      formattedTotal: formatted,
      singleStatValue: formatted,
      singleStatSubtitle: `${rawItems.length} registros analisados`,
      chartType: 'STAT',
    };
  }

  private getEntityData(entity: string): any[] {
    switch (entity) {
      case 'CUSTOMER':
        return this.rawCustomers;
      case 'OPPORTUNITY':
        return this.rawOpportunities;
      case 'CUSTOMER_LIST':
        return this.rawCustomerLists;
      case 'INTERACTION':
        return this.rawInteractions;
      case 'BUDGET':
        return this.rawBudgets;
      case 'PRODUCT':
        return this.rawProducts;
      default:
        return [];
    }
  }

  private extractGroupKey(item: any, groupBy: string): string {
    if (!item) return '(Não definido)';

    if (groupBy === 'createdMonth') {
      const dateStr = item.createdAt;
      if (!dateStr) return '(Sem data)';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '(Sem data)';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    }

    const val = item[groupBy];
    if (val === null || val === undefined || val === '') {
      return '(Não informado)';
    }
    return String(val);
  }

  private extractMetricValue(item: any, metricField?: string): number {
    if (!item || !metricField || metricField === 'count') return 1;
    const raw = Number(item[metricField]);
    return isNaN(raw) ? 0 : raw;
  }

  public formatValue(value: number, metricField?: string): string {
    const isCurrency =
      metricField === 'amountInBrl' ||
      metricField === 'amount' ||
      metricField === 'weightedValueInBrl' ||
      metricField === 'annualRevenue' ||
      metricField === 'totalAmount' ||
      metricField === 'subtotal' ||
      metricField === 'unitPrice';

    if (isCurrency) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
      }).format(value);
    }

    return new Intl.NumberFormat('pt-BR').format(value);
  }

  // Testing helper
  public setMockData(data: {
    customers?: CustomerSummary[];
    opportunities?: OpportunityItem[];
    customerLists?: CustomerListItem[];
    interactions?: InteractionItem[];
    products?: ProductItem[];
    budgets?: BudgetDetail[];
  }) {
    if (data.customers) this.rawCustomers = data.customers;
    if (data.opportunities) this.rawOpportunities = data.opportunities;
    if (data.customerLists) this.rawCustomerLists = data.customerLists;
    if (data.interactions) this.rawInteractions = data.interactions;
    if (data.products) this.rawProducts = data.products;
    if (data.budgets) this.rawBudgets = data.budgets;
    this.updateKpis();
  }
}
