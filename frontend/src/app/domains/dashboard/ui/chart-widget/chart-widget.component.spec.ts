import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartWidgetComponent } from './chart-widget.component';
import { DashboardPanelConfig, ChartWidgetData } from '../../models/dashboard.model';

describe('ChartWidgetComponent', () => {
  let component: ChartWidgetComponent;
  let fixture: ComponentFixture<ChartWidgetComponent>;

  const mockPanel: DashboardPanelConfig = {
    id: 'test-panel',
    title: 'Pipeline por Estágio',
    entity: 'OPPORTUNITY',
    chartType: 'BAR',
    metric: 'SUM',
    metricField: 'amountInBrl',
    groupBy: 'stage',
    width: 'half',
  };

  const mockBarData: ChartWidgetData = {
    items: [
      { label: 'PROPOSAL', value: 150000, formattedValue: 'R$ 150.000', color: '#2563eb', percentage: 75 },
      { label: 'DISCOVERY', value: 50000, formattedValue: 'R$ 50.000', color: '#0d9488', percentage: 25 },
    ],
    totalValue: 200000,
    formattedTotal: 'R$ 200.000',
    chartType: 'BAR',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartWidgetComponent);
    component = fixture.componentInstance;
  });

  it('should calculate bar width percentage based on max value', () => {
    fixture.componentRef.setInput('panel', mockPanel);
    fixture.componentRef.setInput('data', mockBarData);
    fixture.detectChanges();

    expect(component.getBarWidthPercentage(150000)).toBe(100);
    expect(component.getBarWidthPercentage(75000)).toBe(50);
  });

  it('should calculate donut segments properly', () => {
    const donutData: ChartWidgetData = {
      ...mockBarData,
      chartType: 'DONUT',
    };
    fixture.componentRef.setInput('panel', { ...mockPanel, chartType: 'DONUT' });
    fixture.componentRef.setInput('data', donutData);
    fixture.detectChanges();

    const segments = component.donutSegments();
    expect(segments.length).toBe(2);
    expect(segments[0].percentage).toBe(75);
    expect(segments[1].percentage).toBe(25);
  });

  it('should calculate line points and SVG paths for LINE charts', () => {
    const lineData: ChartWidgetData = {
      ...mockBarData,
      chartType: 'LINE',
    };
    fixture.componentRef.setInput('panel', { ...mockPanel, chartType: 'LINE' });
    fixture.componentRef.setInput('data', lineData);
    fixture.detectChanges();

    const points = component.linePoints();
    expect(points.length).toBe(2);
    expect(component.linePath()).toContain('M ');
    expect(component.lineAreaPath()).toContain('Z');
  });

  it('should recognize empty state when no items exist', () => {
    const emptyData: ChartWidgetData = {
      items: [],
      totalValue: 0,
      formattedTotal: '0',
      chartType: 'BAR',
    };
    fixture.componentRef.setInput('panel', mockPanel);
    fixture.componentRef.setInput('data', emptyData);
    fixture.detectChanges();

    expect(component.isEmpty()).toBe(true);
  });
});
