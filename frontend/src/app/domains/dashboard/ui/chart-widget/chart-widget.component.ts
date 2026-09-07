import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {
  DashboardPanelConfig,
  ChartWidgetData,
  ChartSeriesItem,
} from '../../models/dashboard.model';

interface DonutSegment {
  label: string;
  value: number;
  formattedValue: string;
  color: string;
  percentage: number;
  strokeDasharray: string;
  strokeDashoffset: number;
}

interface LinePoint {
  x: number;
  y: number;
  label: string;
  value: number;
  formattedValue: string;
  color: string;
}

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule],
  template: `
    <div class="chart-widget-container">
      <!-- Empty State -->
      @if (isEmpty()) {
        <div class="empty-state">
          <mat-icon class="empty-icon">bar_chart</mat-icon>
          <p class="empty-text">Nenhum dado encontrado para os filtros selecionados</p>
        </div>
      } @else {
        <!-- 1. STAT CARD -->
        @if (data().chartType === 'STAT') {
          <div class="stat-card">
            <div class="stat-icon-wrapper" [style.background-color]="statBadgeColor()">
              <mat-icon>{{ panel().icon || 'analytics' }}</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ data().singleStatValue || data().formattedTotal }}</span>
              <span class="stat-subtitle">{{ data().singleStatSubtitle || panel().title }}</span>
            </div>
          </div>
        }

        <!-- 2. BAR CHART (Horizontal Proportional Bars) -->
        @if (data().chartType === 'BAR') {
          <div class="bar-chart-container">
            @for (item of data().items; track item.label) {
              <div class="bar-row">
                <div class="bar-header">
                  <span class="bar-label" [title]="item.label">{{ item.label }}</span>
                  <div class="bar-value-wrapper">
                    <span class="bar-value">{{ item.formattedValue }}</span>
                    @if (item.percentage !== undefined) {
                      <span class="bar-percentage">{{ item.percentage }}%</span>
                    }
                  </div>
                </div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    [style.width.%]="getBarWidthPercentage(item.value)"
                    [style.background-color]="item.color"
                  ></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- 3. DONUT CHART (SVG Multi-Segment) -->
        @if (data().chartType === 'DONUT') {
          <div class="donut-chart-container">
            <div class="donut-svg-wrapper">
              <svg viewBox="0 0 200 200" class="donut-svg">
                <!-- Background ring -->
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  class="donut-bg-ring"
                  stroke-width="26"
                />
                <!-- Segments -->
                @for (seg of donutSegments(); track seg.label) {
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    [attr.stroke]="seg.color"
                    stroke-width="26"
                    [attr.stroke-dasharray]="seg.strokeDasharray"
                    [attr.stroke-dashoffset]="seg.strokeDashoffset"
                    transform="rotate(-90 100 100)"
                    class="donut-segment"
                  />
                }
                <!-- Center text -->
                <g class="donut-center-group">
                  <text x="100" y="95" text-anchor="middle" class="donut-total-val">
                    {{ data().formattedTotal }}
                  </text>
                  <text x="100" y="115" text-anchor="middle" class="donut-total-lbl">
                    Total
                  </text>
                </g>
              </svg>
            </div>

            <!-- Donut Legend -->
            <div class="donut-legend">
              @for (item of data().items; track item.label) {
                <div class="legend-item">
                  <span class="legend-color-dot" [style.background-color]="item.color"></span>
                  <span class="legend-label" [title]="item.label">{{ item.label }}</span>
                  <span class="legend-val">{{ item.formattedValue }}</span>
                  <span class="legend-pct">({{ item.percentage }}%)</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- 4. LINE CHART (SVG Trend Area) -->
        @if (data().chartType === 'LINE') {
          <div class="line-chart-container">
            <svg viewBox="0 0 500 210" class="line-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2563eb" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#2563eb" stop-opacity="0.02" />
                </linearGradient>
              </defs>

              <!-- Grid horizontal lines -->
              <line x1="30" y1="30" x2="480" y2="30" class="line-grid" />
              <line x1="30" y1="95" x2="480" y2="95" class="line-grid" />
              <line x1="30" y1="160" x2="480" y2="160" class="line-grid" />

              <!-- Gradient Area fill -->
              @if (lineAreaPath()) {
                <path [attr.d]="lineAreaPath()" fill="url(#lineGrad)" />
              }

              <!-- Main Trend Line -->
              @if (linePath()) {
                <path
                  [attr.d]="linePath()"
                  fill="none"
                  stroke="#2563eb"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              }

              <!-- Data Dots and Tooltip Labels -->
              @for (pt of linePoints(); track pt.label) {
                <circle
                  [attr.cx]="pt.x"
                  [attr.cy]="pt.y"
                  r="5"
                  fill="#ffffff"
                  stroke="#2563eb"
                  stroke-width="2.5"
                  class="line-dot"
                />
                <text
                  [attr.x]="pt.x"
                  [attr.y]="pt.y - 10"
                  text-anchor="middle"
                  class="line-val-text"
                >
                  {{ pt.formattedValue }}
                </text>
                <text
                  [attr.x]="pt.x"
                  y="185"
                  text-anchor="middle"
                  class="line-lbl-text"
                >
                  {{ pt.label }}
                </text>
              }
            </svg>
          </div>
        }

        <!-- 5. SUMMARY TABLE -->
        @if (data().chartType === 'TABLE') {
          <div class="table-container">
            <table class="summary-table">
              <thead>
                <tr>
                  <th class="th-dim">Categoria / Dimensão</th>
                  <th class="th-val">Valor</th>
                  <th class="th-share">Participação</th>
                </tr>
              </thead>
              <tbody>
                @for (item of data().items; track item.label) {
                  <tr>
                    <td class="td-dim">
                      <span class="table-dot" [style.background-color]="item.color"></span>
                      <span class="table-label">{{ item.label }}</span>
                    </td>
                    <td class="td-val font-semibold">{{ item.formattedValue }}</td>
                    <td class="td-share">
                      <div class="table-share-cell">
                        <div class="table-share-track">
                          <div
                            class="table-share-fill"
                            [style.width.%]="item.percentage || 0"
                            [style.background-color]="item.color"
                          ></div>
                        </div>
                        <span class="table-share-pct">{{ item.percentage || 0 }}%</span>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .chart-widget-container {
        width: 100%;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      /* Empty State */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2.5rem 1rem;
        color: var(--mat-sys-outline, #9ca3af);
        text-align: center;
      }

      .empty-icon {
        font-size: 40px;
        height: 40px;
        width: 40px;
        margin-bottom: 0.5rem;
        opacity: 0.5;
      }

      .empty-text {
        font-size: 0.875rem;
        margin: 0;
      }

      /* 1. Stat Card */
      .stat-card {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        padding: 1rem 0.5rem;
      }

      .stat-icon-wrapper {
        width: 58px;
        height: 58px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .stat-icon-wrapper mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #ffffff;
      }

      .stat-content {
        display: flex;
        flex-direction: column;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.2;
        color: var(--mat-sys-on-surface, #1f2937);
        letter-spacing: -0.02em;
      }

      .stat-subtitle {
        font-size: 0.875rem;
        color: var(--mat-sys-outline, #6b7280);
        margin-top: 0.25rem;
      }

      /* 2. Horizontal Bar Chart */
      .bar-chart-container {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        padding: 0.5rem 0;
      }

      .bar-row {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .bar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8125rem;
      }

      .bar-label {
        font-weight: 500;
        color: var(--mat-sys-on-surface, #374151);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 60%;
      }

      .bar-value-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .bar-value {
        font-weight: 600;
        color: var(--mat-sys-on-surface, #111827);
      }

      .bar-percentage {
        font-size: 0.75rem;
        color: var(--mat-sys-outline, #6b7280);
        background: var(--mat-sys-surface-variant, #f3f4f6);
        padding: 0.1rem 0.4rem;
        border-radius: 9999px;
      }

      .bar-track {
        width: 100%;
        height: 8px;
        background-color: var(--mat-sys-surface-variant, #e5e7eb);
        border-radius: 9999px;
        overflow: hidden;
      }

      .bar-fill {
        height: 100%;
        border-radius: 9999px;
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* 3. Donut Chart */
      .donut-chart-container {
        display: flex;
        align-items: center;
        justify-content: space-around;
        gap: 1.5rem;
        flex-wrap: wrap;
        padding: 0.5rem 0;
      }

      .donut-svg-wrapper {
        width: 180px;
        height: 180px;
        flex-shrink: 0;
      }

      .donut-svg {
        width: 100%;
        height: 100%;
      }

      .donut-bg-ring {
        stroke: var(--mat-sys-surface-variant, #f3f4f6);
      }

      .donut-segment {
        transition: stroke-dasharray 0.5s ease;
      }

      .donut-total-val {
        font-size: 15px;
        font-weight: 700;
        fill: var(--mat-sys-on-surface, #111827);
      }

      .donut-total-lbl {
        font-size: 11px;
        fill: var(--mat-sys-outline, #6b7280);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .donut-legend {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        max-width: 220px;
        flex: 1;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8125rem;
      }

      .legend-color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .legend-label {
        color: var(--mat-sys-on-surface, #4b5563);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }

      .legend-val {
        font-weight: 600;
        color: var(--mat-sys-on-surface, #111827);
      }

      .legend-pct {
        font-size: 0.75rem;
        color: var(--mat-sys-outline, #9ca3af);
      }

      /* 4. Line Chart */
      .line-chart-container {
        width: 100%;
        height: 200px;
        padding-top: 0.5rem;
      }

      .line-svg {
        width: 100%;
        height: 100%;
      }

      .line-grid {
        stroke: var(--mat-sys-outline-variant, #e5e7eb);
        stroke-dasharray: 4 4;
        stroke-width: 1;
      }

      .line-val-text {
        font-size: 10px;
        font-weight: 600;
        fill: var(--mat-sys-on-surface, #1f2937);
      }

      .line-lbl-text {
        font-size: 10px;
        fill: var(--mat-sys-outline, #6b7280);
      }

      /* 5. Table Chart */
      .table-container {
        width: 100%;
        overflow-x: auto;
      }

      .summary-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8125rem;
      }

      .summary-table th {
        text-align: left;
        padding: 0.6rem 0.75rem;
        color: var(--mat-sys-outline, #6b7280);
        border-bottom: 1px solid var(--mat-sys-outline-variant, #e5e7eb);
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .summary-table td {
        padding: 0.6rem 0.75rem;
        border-bottom: 1px solid var(--mat-sys-outline-variant, #f3f4f6);
        color: var(--mat-sys-on-surface, #374151);
      }

      .table-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 0.5rem;
      }

      .table-share-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .table-share-track {
        flex: 1;
        height: 6px;
        background: var(--mat-sys-surface-variant, #e5e7eb);
        border-radius: 9999px;
        overflow: hidden;
        min-width: 60px;
      }

      .table-share-fill {
        height: 100%;
        border-radius: 9999px;
      }

      .table-share-pct {
        font-size: 0.75rem;
        color: var(--mat-sys-outline, #6b7280);
        min-width: 32px;
        text-align: right;
      }
    `,
  ],
})
export class ChartWidgetComponent {
  panel = input.required<DashboardPanelConfig>();
  data = input.required<ChartWidgetData>();

  private readonly CIRCUMFERENCE = 2 * Math.PI * 70; // ~439.82

  isEmpty = computed(() => {
    const d = this.data();
    if (d.chartType === 'STAT') return false;
    return !d.items || d.items.length === 0;
  });

  statBadgeColor = computed(() => {
    const scheme = this.panel().colorScheme;
    if (scheme) return scheme;
    const p = this.panel();
    if (p.entity === 'CUSTOMER') return '#0d9488'; // teal
    if (p.entity === 'OPPORTUNITY') return '#2563eb'; // blue
    if (p.entity === 'CUSTOMER_LIST') return '#8b5cf6'; // purple
    return '#f59e0b'; // amber
  });

  getBarWidthPercentage(val: number): number {
    const d = this.data();
    if (!d.items || d.items.length === 0) return 0;
    const maxVal = Math.max(...d.items.map((i) => i.value), 1);
    return Math.round((val / maxVal) * 100);
  }

  donutSegments = computed<DonutSegment[]>(() => {
    const d = this.data();
    if (!d.items || d.items.length === 0 || d.totalValue <= 0) return [];

    let cumulativePct = 0;
    return d.items.map((item) => {
      const pct = (item.value / d.totalValue) * 100;
      const strokeDasharray = `${(pct / 100) * this.CIRCUMFERENCE} ${this.CIRCUMFERENCE}`;
      const strokeDashoffset = -((cumulativePct / 100) * this.CIRCUMFERENCE);
      cumulativePct += pct;

      return {
        label: item.label,
        value: item.value,
        formattedValue: item.formattedValue,
        color: item.color,
        percentage: Math.round(pct),
        strokeDasharray,
        strokeDashoffset,
      };
    });
  });

  linePoints = computed<LinePoint[]>(() => {
    const d = this.data();
    if (!d.items || d.items.length === 0) return [];

    const items = d.items;
    const maxVal = Math.max(...items.map((i) => i.value), 1);

    const xMin = 45;
    const xMax = 465;
    const yMin = 35;
    const yMax = 160;

    if (items.length === 1) {
      return [
        {
          x: 250,
          y: yMax - (items[0].value / maxVal) * (yMax - yMin),
          label: items[0].label,
          value: items[0].value,
          formattedValue: items[0].formattedValue,
          color: items[0].color,
        },
      ];
    }

    return items.map((item, idx) => {
      const x = xMin + (idx / (items.length - 1)) * (xMax - xMin);
      const y = yMax - (item.value / maxVal) * (yMax - yMin);
      return {
        x,
        y,
        label: item.label,
        value: item.value,
        formattedValue: item.formattedValue,
        color: item.color,
      };
    });
  });

  linePath = computed<string>(() => {
    const pts = this.linePoints();
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;

    return pts.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');
  });

  lineAreaPath = computed<string>(() => {
    const pts = this.linePoints();
    if (pts.length < 2) return '';
    const yBaseline = 160;
    const first = pts[0];
    const last = pts[pts.length - 1];

    let path = `M ${first.x},${yBaseline} L ${first.x},${first.y}`;
    for (let i = 1; i < pts.length; i++) {
      path += ` L ${pts[i].x},${pts[i].y}`;
    }
    path += ` L ${last.x},${yBaseline} Z`;
    return path;
  });
}
