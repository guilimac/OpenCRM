import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CreateGraphDialogComponent } from './create-graph-dialog.component';
import { DashboardEngineService } from '../../services/dashboard-engine.service';
import { of } from 'rxjs';

describe('CreateGraphDialogComponent', () => {
  let component: CreateGraphDialogComponent;
  let fixture: ComponentFixture<CreateGraphDialogComponent>;
  let mockDialogRef: any;
  let mockEngine: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn(),
    };

    mockEngine = {
      getEntityMetadataList: vi.fn().mockReturnValue([
        {
          entity: 'OPPORTUNITY',
          labelKey: 'dashboard.entities.opportunity',
          icon: 'trending_up',
          groupByOptions: [{ value: 'stage', labelKey: 'stage' }],
          metricFieldOptions: [
            { value: 'amountInBrl', labelKey: 'amount', allowedMetrics: ['SUM', 'AVG'] },
          ],
        },
        {
          entity: 'CUSTOMER',
          labelKey: 'dashboard.entities.customer',
          icon: 'people',
          groupByOptions: [{ value: 'status', labelKey: 'status' }],
          metricFieldOptions: [
            { value: 'annualRevenue', labelKey: 'revenue', allowedMetrics: ['SUM', 'AVG'] },
          ],
        },
      ]),
      computeChartData: vi.fn().mockReturnValue({
        items: [{ label: 'PROPOSAL', value: 100, formattedValue: '100', color: '#2563eb' }],
        totalValue: 100,
        formattedTotal: '100',
        chartType: 'BAR',
      }),
    };

    await TestBed.configureTestingModule({
      imports: [CreateGraphDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: DashboardEngineService, useValue: mockEngine },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGraphDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize form with default values', () => {
    expect(component.form.valid).toBe(true);
    expect(component.form.value.entity).toBe('OPPORTUNITY');
    expect(component.form.value.chartType).toBe('BAR');
  });

  it('should select entity and update group-by options', () => {
    component.selectEntity('CUSTOMER');
    expect(component.form.value.entity).toBe('CUSTOMER');
    expect(component.form.value.groupBy).toBe('status');
  });

  it('should select chart type', () => {
    component.selectChartType('DONUT');
    expect(component.form.value.chartType).toBe('DONUT');
  });

  it('should close dialog with panel config on save', () => {
    component.form.patchValue({ title: 'Painel Teste' });
    component.savePanel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Painel Teste',
        entity: 'OPPORTUNITY',
      }),
    );
  });
});
