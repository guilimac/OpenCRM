export type DashboardEntityType =
  | 'CUSTOMER'
  | 'OPPORTUNITY'
  | 'CUSTOMER_LIST'
  | 'INTERACTION';

export type DashboardChartType = 'BAR' | 'DONUT' | 'LINE' | 'STAT' | 'TABLE';

export type DashboardMetricType = 'COUNT' | 'SUM' | 'AVG';

export type DashboardPanelWidth = 'third' | 'half' | 'full';

export interface DashboardPanelConfig {
  id: string;
  title: string;
  entity: DashboardEntityType;
  chartType: DashboardChartType;
  metric: DashboardMetricType;
  metricField?: string;
  groupBy: string;
  width: DashboardPanelWidth;
  icon?: string;
  colorScheme?: string;
}

export interface ChartSeriesItem {
  label: string;
  value: number;
  formattedValue: string;
  color: string;
  percentage?: number;
}

export interface ChartWidgetData {
  items: ChartSeriesItem[];
  totalValue: number;
  formattedTotal: string;
  singleStatValue?: string;
  singleStatSubtitle?: string;
  chartType: DashboardChartType;
}

export interface DashboardSummaryKpis {
  totalCustomers: number;
  activeCustomers: number;
  totalPipelineInBrl: number;
  weightedPipelineInBrl: number;
  openOpportunitiesCount: number;
  customerListsCount: number;
  totalInteractionsCount: number;
}

export interface EntityDimensionOption {
  value: string;
  labelKey: string;
}

export interface EntityMetricFieldOption {
  value: string;
  labelKey: string;
  allowedMetrics: DashboardMetricType[];
}

export interface EntityMetadata {
  entity: DashboardEntityType;
  labelKey: string;
  icon: string;
  groupByOptions: EntityDimensionOption[];
  metricFieldOptions: EntityMetricFieldOption[];
}
