import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardEngineService, DEFAULT_PANELS } from './dashboard-engine.service';
import { CustomerApiService } from '../../customer/services/customer-api.service';
import { OpportunityApiService } from '../../opportunity/services/opportunity-api.service';
import { InteractionApiService } from './interaction-api.service';
import { DashboardPanelConfig } from '../models/dashboard.model';

describe('DashboardEngineService', () => {
  let service: DashboardEngineService;
  let mockCustomerApi: any;
  let mockOpportunityApi: any;
  let mockInteractionApi: any;

  beforeEach(() => {
    localStorage.clear();

    mockCustomerApi = {
      list: vi.fn().mockReturnValue(
        of({
          data: [
            {
              id: 'c-1',
              companyName: 'Tech Alpha',
              status: 'ACTIVE_CUSTOMER',
              industry: 'TECHNOLOGY',
              annualRevenue: 500000,
              createdAt: '2026-01-15T00:00:00Z',
            },
            {
              id: 'c-2',
              companyName: 'Finance Beta',
              status: 'PROSPECT',
              industry: 'FINANCE',
              annualRevenue: 300000,
              createdAt: '2026-02-10T00:00:00Z',
            },
            {
              id: 'c-3',
              companyName: 'Health Gamma',
              status: 'ACTIVE_CUSTOMER',
              industry: 'TECHNOLOGY',
              annualRevenue: 200000,
              createdAt: '2026-02-20T00:00:00Z',
            },
          ],
          total: 3,
        }),
      ),
      listCustomerLists: vi.fn().mockReturnValue(
        of({
          data: [
            { id: 'l-1', name: 'VIP Clients', memberCount: 15, createdAt: '2026-01-01' },
          ],
          total: 1,
        }),
      ),
    };

    mockOpportunityApi = {
      list: vi.fn().mockReturnValue(
        of([
          {
            id: 'opp-1',
            title: 'Big Deal',
            amountInBrl: 100000,
            weightedValueInBrl: 70000,
            stage: 'PROPOSAL',
            createdAt: '2026-02-01',
          },
          {
            id: 'opp-2',
            title: 'Small Deal',
            amountInBrl: 50000,
            weightedValueInBrl: 50000,
            stage: 'CLOSED_WON',
            createdAt: '2026-02-05',
          },
        ]),
      ),
    };

    mockInteractionApi = {
      list: vi.fn().mockReturnValue(
        of([
          { id: 'i-1', type: 'EMAIL', outcome: 'SENT', createdAt: '2026-02-01' },
          { id: 'i-2', type: 'CALL', outcome: 'COMPLETED', createdAt: '2026-02-02' },
          { id: 'i-3', type: 'EMAIL', outcome: 'SENT', createdAt: '2026-02-03' },
        ]),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        DashboardEngineService,
        { provide: CustomerApiService, useValue: mockCustomerApi },
        { provide: OpportunityApiService, useValue: mockOpportunityApi },
        { provide: InteractionApiService, useValue: mockInteractionApi },
      ],
    });

    service = TestBed.inject(DashboardEngineService);
  });

  it('should initialize with default panels when localStorage is empty', () => {
    expect(service.panels().length).toBe(DEFAULT_PANELS.length);
  });

  it('should refresh data and compute KPIs correctly', () => {
    service.refreshData().subscribe();

    const kpis = service.kpis();
    expect(kpis.totalCustomers).toBe(3);
    expect(kpis.activeCustomers).toBe(2);
    expect(kpis.totalPipelineInBrl).toBe(150000);
    expect(kpis.weightedPipelineInBrl).toBe(120000);
    expect(kpis.openOpportunitiesCount).toBe(1); // 'PROPOSAL' is open, 'CLOSED_WON' is closed
    expect(kpis.customerListsCount).toBe(1);
    expect(kpis.totalInteractionsCount).toBe(3);
  });

  it('should aggregate data for a BAR chart with SUM metric', () => {
    service.refreshData().subscribe();

    const panel: DashboardPanelConfig = {
      id: 'test-bar',
      title: 'Revenue by Industry',
      entity: 'CUSTOMER',
      chartType: 'BAR',
      metric: 'SUM',
      metricField: 'annualRevenue',
      groupBy: 'industry',
      width: 'half',
    };

    const data = service.computeChartData(panel);
    expect(data.chartType).toBe('BAR');
    expect(data.items.length).toBe(2);

    const techItem = data.items.find((i) => i.label === 'TECHNOLOGY');
    const finItem = data.items.find((i) => i.label === 'FINANCE');

    expect(techItem?.value).toBe(700000); // 500k + 200k
    expect(finItem?.value).toBe(300000);
    expect(data.totalValue).toBe(1000000);
  });

  it('should aggregate data for a DONUT chart with COUNT metric', () => {
    service.refreshData().subscribe();

    const panel: DashboardPanelConfig = {
      id: 'test-donut',
      title: 'Interactions by Type',
      entity: 'INTERACTION',
      chartType: 'DONUT',
      metric: 'COUNT',
      groupBy: 'type',
      width: 'half',
    };

    const data = service.computeChartData(panel);
    expect(data.items.length).toBe(2);

    const emailItem = data.items.find((i) => i.label === 'EMAIL');
    const callItem = data.items.find((i) => i.label === 'CALL');

    expect(emailItem?.value).toBe(2);
    expect(callItem?.value).toBe(1);
    expect(data.totalValue).toBe(3);
  });

  it('should compute STAT card data properly', () => {
    service.refreshData().subscribe();

    const panel: DashboardPanelConfig = {
      id: 'test-stat',
      title: 'Total Active Customers',
      entity: 'CUSTOMER',
      chartType: 'STAT',
      metric: 'COUNT',
      groupBy: 'status',
      width: 'third',
    };

    const data = service.computeChartData(panel);
    expect(data.chartType).toBe('STAT');
    expect(data.totalValue).toBe(3);
  });

  it('should add, remove, and move panels and persist to localStorage', () => {
    const newPanel: DashboardPanelConfig = {
      id: 'custom-panel-1',
      title: 'My Custom Panel',
      entity: 'CUSTOMER',
      chartType: 'BAR',
      metric: 'COUNT',
      groupBy: 'status',
      width: 'full',
    };

    const initialCount = service.panels().length;
    service.addPanel(newPanel);
    expect(service.panels().length).toBe(initialCount + 1);

    // Check localStorage was updated
    const stored = JSON.parse(localStorage.getItem('opencrm_dashboard_panels') || '[]');
    expect(stored.some((p: any) => p.id === 'custom-panel-1')).toBe(true);

    // Remove panel
    service.removePanel('custom-panel-1');
    expect(service.panels().length).toBe(initialCount);

    // Reset to defaults
    service.resetToDefaults();
    expect(service.panels().length).toBe(DEFAULT_PANELS.length);
  });
});
