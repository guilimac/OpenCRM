import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { DashboardViewComponent } from './dashboard-view.component';
import { DashboardEngineService, DEFAULT_PANELS } from '../../services/dashboard-engine.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('DashboardViewComponent', () => {
  let component: DashboardViewComponent;
  let fixture: ComponentFixture<DashboardViewComponent>;
  let mockEngine: any;
  let mockDialog: any;

  beforeEach(async () => {
    mockEngine = {
      loading: signal(false),
      panels: signal([...DEFAULT_PANELS]),
      kpis: signal({
        totalCustomers: 10,
        activeCustomers: 8,
        totalPipelineInBrl: 500000,
        weightedPipelineInBrl: 350000,
        openOpportunitiesCount: 5,
        customerListsCount: 2,
        totalInteractionsCount: 25,
      }),
      refreshData: vi.fn().mockReturnValue(of({})),
      resetToDefaults: vi.fn(),
      movePanel: vi.fn(),
      removePanel: vi.fn(),
      addPanel: vi.fn(),
      savePanels: vi.fn(),
      getEntityMetadataList: vi.fn().mockReturnValue([]),
      computeChartData: vi.fn().mockReturnValue({
        items: [],
        totalValue: 0,
        formattedTotal: '0',
        chartType: 'BAR',
      }),
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of(undefined)),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardViewComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: DashboardEngineService, useValue: mockEngine },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and trigger refreshData on init', () => {
    expect(mockEngine.refreshData).toHaveBeenCalled();
  });

  it('should render KPI values correctly', () => {
    expect(component.kpis().totalCustomers).toBe(10);
    expect(component.kpis().activeCustomers).toBe(8);
  });

  it('should call engine removePanel when removePanel is invoked', () => {
    component.removePanel('pipeline-by-stage');
    expect(mockEngine.removePanel).toHaveBeenCalledWith('pipeline-by-stage');
  });

  it('should call engine movePanel when movePanel is invoked', () => {
    component.movePanel('pipeline-by-stage', 'right');
    expect(mockEngine.movePanel).toHaveBeenCalledWith('pipeline-by-stage', 'right');
  });

  it('should call engine resetToDefaults when resetDefaults is invoked', () => {
    component.resetDefaults();
    expect(mockEngine.resetToDefaults).toHaveBeenCalled();
  });

  it('should open create graph dialog when openAddGraphDialog is called', () => {
    component.openAddGraphDialog();
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
